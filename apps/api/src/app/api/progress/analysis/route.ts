import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { rateLimitByPlan } from '@/lib/rate-limit'
import { WEAKNESS_ANALYSIS_PROMPT } from '@/lib/ai/prompts'
import { calculateLevel } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, xp: true, streak: true, isPremium: true, level: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // AI analysis is a premium + AI_QUESTION rate limited feature
    const rl = await rateLimitByPlan(user.id, 'AI_QUESTION', user.isPremium)
    if (!rl.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rl.remaining,
          reset: rl.reset,
          isPremiumFeature: !user.isPremium,
        },
        { status: 429 }
      )
    }

    // Gather user progress data
    const [progress, recentAnswers, sessions] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: user.id },
        orderBy: { weaknessScore: 'desc' },
      }),
      prisma.userAnswer.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: {
          isCorrect: true,
          timeSpent: true,
          createdAt: true,
          question: { select: { category: true, difficulty: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      prisma.examSession.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        select: { type: true, score: true, completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 20,
      }),
    ])

    if (progress.length === 0 || recentAnswers.length < 5) {
      return NextResponse.json(
        {
          error:
            'Insufficient data for analysis. Answer at least 5 questions first.',
          minimumAnswers: 5,
          currentAnswers: recentAnswers.length,
        },
        { status: 422 }
      )
    }

    // Build stats strings for prompt
    const totalAnswered = progress.reduce((s, p) => s + p.totalAnswered, 0)
    const totalCorrect = progress.reduce((s, p) => s + p.correctAnswers, 0)
    const overallAccuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    const userStats = [
      `Niveau : ${calculateLevel(user.xp)} (${user.xp} XP)`,
      `Série actuelle : ${user.streak} jours consécutifs`,
      `Questions répondues (total) : ${totalAnswered}`,
      `Précision globale : ${overallAccuracy}%`,
      `Sessions d'examen blanc : ${sessions.filter((s) => s.type === 'EXAM').length}`,
      `Meilleur score examen : ${
        sessions.filter((s) => s.type === 'EXAM' && s.score !== null).length > 0
          ? Math.max(
              ...sessions
                .filter((s) => s.type === 'EXAM' && s.score !== null)
                .map((s) => s.score!)
            ) + '%'
          : 'N/A'
      }`,
    ].join('\n')

    const categoryBreakdown = progress
      .map((p) => {
        const acc =
          p.totalAnswered > 0
            ? Math.round((p.correctAnswers / p.totalAnswered) * 100)
            : 0
        return [
          `Catégorie: ${p.category}`,
          `  Questions: ${p.totalAnswered}, Correctes: ${p.correctAnswers} (${acc}%)`,
          `  Score de faiblesse: ${Math.round(p.weaknessScore * 100)}%`,
          `  Temps moyen: ${Math.round(p.averageTime)}s`,
          `  Dernière pratique: ${p.lastPracticed ? p.lastPracticed.toLocaleDateString('fr-CH') : 'Jamais'}`,
        ].join('\n')
      })
      .join('\n\n')

    // Recent history: aggregate by week
    const weeklyActivity: Record<string, { total: number; correct: number }> = {}
    for (const ans of recentAnswers) {
      const weekKey = ans.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!weeklyActivity[weekKey]) weeklyActivity[weekKey] = { total: 0, correct: 0 }
      weeklyActivity[weekKey].total++
      if (ans.isCorrect) weeklyActivity[weekKey].correct++
    }

    const recentHistory = Object.entries(weeklyActivity)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4)
      .map(([month, stats]) => {
        const acc = Math.round((stats.correct / stats.total) * 100)
        return `${month}: ${stats.total} questions, ${acc}% de précision`
      })
      .join('\n')

    // Build and call OpenAI
    const prompt = WEAKNESS_ANALYSIS_PROMPT
      .replace('{{USER_STATS}}', userStats)
      .replace('{{CATEGORY_BREAKDOWN}}', categoryBreakdown)
      .replace('{{RECENT_HISTORY}}', recentHistory)

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un moniteur d\'auto-école suisse expert en pédagogie. Réponds uniquement avec du JSON valide selon le format demandé. Ne mets rien en dehors du JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const raw = aiResponse.choices[0]?.message?.content
    if (!raw) {
      throw new Error('OpenAI returned empty content')
    }

    const analysis = JSON.parse(raw)

    return NextResponse.json({
      analysis,
      generatedAt: new Date(),
      dataWindow: '30 days',
      questionsAnalyzed: recentAnswers.length,
    })
  } catch (error) {
    console.error('[progress/analysis] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
