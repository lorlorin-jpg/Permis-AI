import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/scoring'

// GET /api/user - Get current user profile with stats
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
        supabaseId: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        lastStudyDate: true,
        isPremium: true,
        premiumExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Aggregate stats
    const [progressStats, sessionStats, badgeCount] = await Promise.all([
      prisma.userProgress.aggregate({
        where: { userId: user.id },
        _sum: { totalAnswered: true, correctAnswers: true },
      }),
      prisma.examSession.aggregate({
        where: { userId: user.id, status: 'COMPLETED' },
        _count: { id: true },
        _avg: { score: true },
      }),
      prisma.userBadge.count({ where: { userId: user.id } }),
    ])

    const totalAnswered = progressStats._sum.totalAnswered ?? 0
    const totalCorrect = progressStats._sum.correctAnswers ?? 0
    const accuracy =
      totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

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

    return NextResponse.json({
      user: {
        ...user,
        level: currentLevel,
      },
      stats: {
        totalAnswered,
        totalCorrect,
        accuracy,
        totalSessions: sessionStats._count.id,
        averageScore: sessionStats._avg.score
          ? Math.round(sessionStats._avg.score * 10) / 10
          : null,
        badgesEarned: badgeCount,
        xpProgress,
        xpForNextLevel: xpForNext,
      },
    })
  } catch (error) {
    console.error('[user] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let body: { name?: string; avatarUrl?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Only allow updating specific safe fields
    const allowedUpdates: Record<string, unknown> = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.length > 100) {
        return NextResponse.json(
          { error: 'name must be a string (max 100 chars)' },
          { status: 400 }
        )
      }
      allowedUpdates.name = body.name.trim() || null
    }

    if (body.avatarUrl !== undefined) {
      if (body.avatarUrl !== null && typeof body.avatarUrl !== 'string') {
        return NextResponse.json(
          { error: 'avatarUrl must be a string or null' },
          { status: 400 }
        )
      }
      // Basic URL validation
      if (body.avatarUrl) {
        try {
          new URL(body.avatarUrl)
        } catch {
          return NextResponse.json(
            { error: 'avatarUrl must be a valid URL' },
            { status: 400 }
          )
        }
      }
      allowedUpdates.avatarUrl = body.avatarUrl || null
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update (allowed: name, avatarUrl)' },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: allowedUpdates,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        isPremium: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error('[user] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
