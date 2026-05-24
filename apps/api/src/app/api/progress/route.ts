import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/scoring'

export async function GET(request: NextRequest) {
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
        createdAt: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch all data in parallel
    const [progress, sessions, badges, recentAnswers] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: user.id },
        orderBy: { weaknessScore: 'desc' },
      }),

      prisma.examSession.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        select: {
          id: true,
          type: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          timeSpent: true,
          completedAt: true,
          categoryFilter: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      }),

      prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      }),

      prisma.userAnswer.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          isCorrect: true,
          createdAt: true,
          question: {
            select: { category: true, difficulty: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // ── Overall stats ──────────────────────────────────────────────────────────
    const totalAnswered = progress.reduce((s, p) => s + p.totalAnswered, 0)
    const totalCorrect = progress.reduce((s, p) => s + p.correctAnswers, 0)
    const overallAccuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    const totalExams = sessions.filter((s) => s.type === 'EXAM').length
    const passedExams = sessions.filter(
      (s) => s.type === 'EXAM' && (s.score ?? 0) >= 90
    ).length

    const currentLevel = calculateLevel(user.xp)
    const xpForNext =
      currentLevel < LEVEL_THRESHOLDS.length
        ? LEVEL_THRESHOLDS[currentLevel]
        : null
    const xpInCurrentLevel =
      currentLevel > 1 ? LEVEL_THRESHOLDS[currentLevel - 1] : 0
    const xpProgress =
      xpForNext !== null
        ? Math.round(
            ((user.xp - xpInCurrentLevel) / (xpForNext - xpInCurrentLevel)) *
              100
          )
        : 100

    // ── Per-category progress ──────────────────────────────────────────────────
    const categoryProgress = progress.map((p) => ({
      category: p.category,
      totalAnswered: p.totalAnswered,
      correctAnswers: p.correctAnswers,
      accuracy:
        p.totalAnswered > 0
          ? Math.round((p.correctAnswers / p.totalAnswered) * 100)
          : 0,
      averageTime: Math.round(p.averageTime),
      weaknessScore: Math.round(p.weaknessScore * 100) / 100,
      lastPracticed: p.lastPracticed,
    }))

    // ── Weak areas (top 3 by weakness score, min 5 answers) ───────────────────
    const weakAreas = categoryProgress
      .filter((p) => p.totalAnswered >= 5)
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 3)

    // ── Recent activity (last 7 days by day) ──────────────────────────────────
    const activityByDay: Record<string, { correct: number; total: number }> = {}
    for (const ans of recentAnswers) {
      const day = ans.createdAt.toISOString().slice(0, 10)
      if (!activityByDay[day]) activityByDay[day] = { correct: 0, total: 0 }
      activityByDay[day].total++
      if (ans.isCorrect) activityByDay[day].correct++
    }

    const recentActivity = Object.entries(activityByDay)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
      .map(([date, stats]) => ({ date, ...stats }))

    // ── Recommendations ────────────────────────────────────────────────────────
    const recommendations: string[] = []

    if (weakAreas.length > 0) {
      recommendations.push(
        `Concentrez-vous sur la catégorie "${weakAreas[0].category}" (score de faiblesse: ${Math.round(weakAreas[0].weaknessScore * 100)}%).`
      )
    }
    if (overallAccuracy < 90) {
      recommendations.push(
        `Votre précision globale est de ${overallAccuracy}%. L'examen suisse exige 90% — continuez à vous entraîner !`
      )
    }
    if (user.streak === 0) {
      recommendations.push(
        'Commencez une série de jours consécutifs pour gagner des bonus XP!'
      )
    } else if (user.streak < 7) {
      recommendations.push(
        `Vous avez une série de ${user.streak} jours — continuez pour atteindre 7 jours !`
      )
    }
    if (totalExams === 0) {
      recommendations.push(
        'Tentez un examen blanc pour évaluer votre niveau avant l\'examen officiel.'
      )
    }

    return NextResponse.json({
      overall: {
        xp: user.xp,
        level: currentLevel,
        xpProgress,
        xpForNextLevel: xpForNext,
        streak: user.streak,
        lastStudyDate: user.lastStudyDate,
        totalAnswered,
        totalCorrect,
        overallAccuracy,
        totalExams,
        passedExams,
        passRate:
          totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : null,
        memberSince: user.createdAt,
      },
      categoryProgress,
      weakAreas,
      badges: badges.map((ub) => ({
        id: ub.badge.id,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        earnedAt: ub.earnedAt,
      })),
      recentSessions: sessions,
      recentActivity,
      recommendations,
    })
  } catch (error) {
    console.error('[progress] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
