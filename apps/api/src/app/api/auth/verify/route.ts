import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySupabaseToken } from '@/lib/supabase'
import { calculateLevel } from '@/lib/scoring'

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7).trim()

    // Verify Supabase JWT
    let payload
    try {
      payload = await verifySupabaseToken(token)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { sub: supabaseId, email } = payload

    if (!supabaseId) {
      return NextResponse.json({ error: 'Token missing sub claim' }, { status: 401 })
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { supabaseId },
      update: {
        ...(email ? { email } : {}),
        updatedAt: new Date(),
      },
      create: {
        supabaseId,
        email: email ?? `${supabaseId}@unknown.local`,
        name: null,
        role: 'FREE',
        xp: 0,
        level: 1,
        streak: 0,
        isPremium: false,
      },
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

    // Recompute level based on XP in case it drifted
    const correctLevel = calculateLevel(user.xp)
    if (correctLevel !== user.level) {
      await prisma.user.update({
        where: { id: user.id },
        data: { level: correctLevel },
      })
    }

    return NextResponse.json({
      user: {
        ...user,
        level: correctLevel,
      },
    })
  } catch (error) {
    console.error('[auth/verify] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
