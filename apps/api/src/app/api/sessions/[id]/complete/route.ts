import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { checkForBadges } from '@/lib/scoring'
import { SESSION_ANALYSIS_PROMPT } from '@/lib/ai/prompts'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, isPremium: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch session
    const session = await prisma.examSession.findFirst({
      where: { id: params.id, userId: user.id, status: 'IN_PROGRESS' },
      include: {
        userAnswers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                category: true,
                difficulty: true,
                explanation: true,
              },
            },
            answer: {
              select: { id: true, text: true, isCorrect: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!session) {
      // Check if the session was already completed (idempotency support)
      const completedSession = await prisma.examSession.findFirst({
        where: { id: params.id, userId: user.id, status: 'COMPLETED' },
        select: { id: true, score: true, correctAnswers: true, timeSpent: true, completedAt: true, type: true },
      })
      if (completedSession) {
        return NextResponse.json(
          { error: 'Session already completed', session: completedSession },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Session not found or not in progress' },
        { status: 404 }
      )
    }

    const answers = session.userAnswers
    const correctCount = answers.filter((a) => a.isCorrect).length
    const totalAnswered = answers.length
    const totalTimeSpent = answers.reduce((sum, a) => sum + a.timeSpent, 0)

    // If the user hasn't answered any questions, still allow completion
    const score =
      totalAnswered > 0
        ? Math.round((correctCount / totalAnswered) * 100 * 10) / 10
        : 0

    // Passed Swiss exam threshold: 90% correct
    const PASS_THRESHOLD = 90
    const passed = score >= PASS_THRESHOLD

    // Update session to COMPLETED
    await prisma.examSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        score,
        correctAnswers: correctCount,
        timeSpent: totalTimeSpent,
        completedAt: new Date(),
      },
    })

    // ── AI Post-session Analysis ────────────────────────────────────────────────
    let analysis: {
      overallFeedback: string
      passStatus: boolean
      passThreshold: number
      strongCategories: string[]
      weakCategories: string[]
      mistakePatterns: string[]
      nextSteps: string[]
      encouragement: string
    } | null = null

    // Build per-category stats
    const categoryMap: Record<
      string,
      { correct: number; total: number }
    > = {}
    for (const ua of answers) {
      const cat = ua.question.category
      if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0 }
      categoryMap[cat].total++
      if (ua.isCorrect) categoryMap[cat].correct++
    }

    const categoryBreakdown = Object.entries(categoryMap)
      .map(
        ([cat, { correct, total }]) =>
          `${cat}: ${correct}/${total} (${Math.round((correct / total) * 100)}%)`
      )
      .join('\n')

    // Only run AI analysis for EXAM sessions or when premium
    if (session.type === 'EXAM' || user.isPremium) {
      try {
        const wrongAnswers = answers
          .filter((a) => !a.isCorrect)
          .slice(0, 10) // Limit to 10 for context
          .map(
            (ua) =>
              `Q: ${ua.question.text}\nRépondu: ${ua.answer.text}\nCorrect: ${ua.question.explanation}`
          )
          .join('\n---\n')

        const prompt = SESSION_ANALYSIS_PROMPT
          .replace('{{SESSION_TYPE}}', session.type)
          .replace('{{SCORE}}', String(score))
          .replace('{{CORRECT}}', String(correctCount))
          .replace('{{TOTAL}}', String(totalAnswered))
          .replace('{{TIME_SPENT}}', String(totalTimeSpent))
          .replace(
            '{{CATEGORIES}}',
            session.categoryFilter.length > 0
              ? session.categoryFilter.join(', ')
              : 'Toutes'
          )
          .replace('{{QUESTION_DETAILS}}', wrongAnswers || 'Aucune erreur!')

        const aiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content:
                'Tu es un moniteur d\'auto-école suisse expert. Réponds uniquement avec du JSON valide selon le format demandé.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        })

        const raw = aiResponse.choices[0]?.message?.content
        if (raw) {
          analysis = JSON.parse(raw)

          // Persist AI analysis
          await prisma.aIAnalysis.create({
            data: {
              sessionId: session.id,
              content: raw,
            },
          })
        }
      } catch (aiError) {
        console.error('[sessions/[id]/complete] AI analysis error:', aiError)
        // Non-critical — proceed without AI analysis
      }
    }

    // ── Badge check ────────────────────────────────────────────────────────────
    let newBadges: { id: string; name: string; icon: string; description: string }[] = []
    try {
      const earned = await checkForBadges(user.id, prisma)
      newBadges = earned.map((b) => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
        description: b.description,
      }))
    } catch (badgeErr) {
      // Non-critical — log but don't fail
      console.error('[sessions/[id]/complete] Badge check error:', badgeErr)
    }

    // ── Build recommendations ──────────────────────────────────────────────────
    const weakCategories = Object.entries(categoryMap)
      .filter(([, { correct, total }]) => total > 0 && correct / total < 0.7)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
      .map(([cat]) => cat)

    const recommendations = weakCategories
      .slice(0, 3)
      .map((cat) => `Retravailler la catégorie : ${cat}`)

    return NextResponse.json({
      session: {
        id: session.id,
        type: session.type,
        status: 'COMPLETED',
        score,
        passed,
        passThreshold: PASS_THRESHOLD,
        correctAnswers: correctCount,
        totalQuestions: totalAnswered,
        timeSpent: totalTimeSpent,
        completedAt: new Date(),
      },
      categoryBreakdown: Object.entries(categoryMap).map(([category, stats]) => ({
        category,
        correct: stats.correct,
        total: stats.total,
        accuracy: Math.round((stats.correct / stats.total) * 100),
      })),
      analysis,
      recommendations,
      newBadges,
    })
  } catch (error) {
    console.error('[sessions/[id]/complete] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
