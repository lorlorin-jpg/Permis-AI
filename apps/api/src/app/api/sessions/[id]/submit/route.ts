import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateXP,
  calculateLevel,
  updateWeaknessScore,
  checkForBadges,
} from '@/lib/scoring'

interface SubmitBody {
  questionId: string
  answerId: string
  timeSpent: number
}

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
      select: {
        id: true,
        xp: true,
        level: true,
        streak: true,
        lastStudyDate: true,
        isPremium: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify session belongs to user and is in progress
    const session = await prisma.examSession.findFirst({
      where: { id: params.id, userId: user.id, status: 'IN_PROGRESS' },
      select: {
        id: true,
        type: true,
        totalQuestions: true,
        metadata: true,
        _count: { select: { userAnswers: true } },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not in progress' },
        { status: 404 }
      )
    }

    let body: SubmitBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { questionId, answerId, timeSpent } = body

    if (!questionId || !answerId) {
      return NextResponse.json(
        { error: 'questionId and answerId are required' },
        { status: 400 }
      )
    }

    const safeTimeSpent = Math.max(0, Math.min(timeSpent ?? 0, 3600))

    // Validate question exists and belongs to this session
    const meta = session.metadata as { questionIds?: string[] } | null
    const sessionQuestionIds = meta?.questionIds ?? []

    if (sessionQuestionIds.length > 0 && !sessionQuestionIds.includes(questionId)) {
      return NextResponse.json(
        { error: 'Question does not belong to this session' },
        { status: 400 }
      )
    }

    // Check question hasn't already been answered in this session
    const existingAnswer = await prisma.userAnswer.findFirst({
      where: { sessionId: params.id, questionId },
    })

    if (existingAnswer) {
      return NextResponse.json(
        { error: 'Question already answered in this session' },
        { status: 409 }
      )
    }

    // Fetch question + answer details
    const question = await prisma.question.findFirst({
      where: { id: questionId, isPublished: true },
      select: {
        id: true,
        category: true,
        difficulty: true,
        answers: {
          where: { id: answerId },
          select: { id: true, isCorrect: true },
        },
      },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const chosenAnswer = question.answers[0]
    if (!chosenAnswer) {
      return NextResponse.json(
        { error: 'Answer not found for this question' },
        { status: 404 }
      )
    }

    const isCorrect = chosenAnswer.isCorrect

    // ── Streak update ──────────────────────────────────────────────────────────
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const lastStudyStr = user.lastStudyDate
      ? user.lastStudyDate.toISOString().slice(0, 10)
      : null

    let newStreak = user.streak
    if (isCorrect) {
      if (lastStudyStr === null) {
        newStreak = 1
      } else {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)

        if (lastStudyStr === todayStr) {
          // Already studied today — streak unchanged
        } else if (lastStudyStr === yesterdayStr) {
          newStreak = user.streak + 1
        } else {
          // Streak broken
          newStreak = 1
        }
      }
    }

    // ── XP calculation ─────────────────────────────────────────────────────────
    const xpEarned = calculateXP(isCorrect, safeTimeSpent, question.difficulty, newStreak)
    const newTotalXp = user.xp + xpEarned
    const newLevel = calculateLevel(newTotalXp)
    const leveledUp = newLevel > user.level

    // ── Persist answer + update user + update progress (all in a transaction) ──
    const [userAnswer] = await prisma.$transaction(async (tx) => {
      // 1. Record user answer
      const ua = await tx.userAnswer.create({
        data: {
          userId: user.id,
          questionId,
          answerId,
          isCorrect,
          timeSpent: safeTimeSpent,
          sessionId: params.id,
        },
      })

      // 2. Update user XP, level, streak
      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: newTotalXp,
          level: newLevel,
          streak: newStreak,
          lastStudyDate: now,
        },
      })

      // 3. Upsert UserProgress for the category
      const existingProgress = await tx.userProgress.findUnique({
        where: {
          userId_category: { userId: user.id, category: question.category },
        },
      })

      const prevWeakness = existingProgress?.weaknessScore ?? 0.5
      const prevAvgTime = existingProgress?.averageTime ?? 0
      const prevTotal = existingProgress?.totalAnswered ?? 0

      const newAvgTime =
        prevTotal === 0
          ? safeTimeSpent
          : (prevAvgTime * prevTotal + safeTimeSpent) / (prevTotal + 1)

      await tx.userProgress.upsert({
        where: {
          userId_category: { userId: user.id, category: question.category },
        },
        update: {
          totalAnswered: { increment: 1 },
          correctAnswers: isCorrect ? { increment: 1 } : undefined,
          averageTime: newAvgTime,
          weaknessScore: updateWeaknessScore(prevWeakness, isCorrect),
          lastPracticed: now,
        },
        create: {
          userId: user.id,
          category: question.category,
          totalAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          averageTime: safeTimeSpent,
          weaknessScore: updateWeaknessScore(0.5, isCorrect),
          lastPracticed: now,
        },
      })

      // 4. Update session metadata with current index
      const currentMeta = session.metadata as { questionIds?: string[]; currentIndex?: number } | null
      await tx.examSession.update({
        where: { id: params.id },
        data: {
          metadata: {
            ...(currentMeta ?? {}),
            currentIndex: (currentMeta?.currentIndex ?? 0) + 1,
          },
        },
      })

      return [ua]
    })

    // ── Badge check (outside transaction to avoid long-running locks) ──────────
    let newBadges: { id: string; name: string; icon: string; description: string }[] = []
    try {
      const earned = await checkForBadges(user.id, prisma)
      newBadges = earned.map((b) => ({
        id: b.id,
        name: b.name,
        icon: b.icon,
        description: b.description,
      }))
    } catch {
      // Badge check is non-critical; don't fail the request
    }

    // Fetch the correct answer text for the response
    const fullAnswer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { id: true, text: true, isCorrect: true },
    })

    const correctAnswerRecord = await prisma.answer.findFirst({
      where: { questionId, isCorrect: true },
      select: { id: true, text: true },
    })

    return NextResponse.json({
      isCorrect,
      xpEarned,
      newTotalXp,
      newLevel,
      leveledUp,
      currentStreak: newStreak,
      newBadges,
      answer: fullAnswer,
      correctAnswer: correctAnswerRecord,
    })
  } catch (error) {
    console.error('[sessions/[id]/submit] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
