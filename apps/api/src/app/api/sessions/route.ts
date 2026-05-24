import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimitByPlan } from '@/lib/rate-limit'
import type { QuestionCategory, SessionType } from '@prisma/client'

const VALID_SESSION_TYPES: SessionType[] = ['PRACTICE', 'EXAM', 'REVIEW', 'AI_GUIDED']

const VALID_CATEGORIES: QuestionCategory[] = [
  'SIGNS', 'PRIORITY', 'HIGHWAY', 'SPEED_LIMITS', 'ALCOHOL',
  'DISTANCES', 'REAL_SITUATIONS', 'ECO_DRIVING', 'SAFETY', 'BEHAVIORS',
]

const SESSION_QUESTION_COUNTS: Record<SessionType, number> = {
  PRACTICE: 20,
  EXAM: 40,
  REVIEW: 15,
  AI_GUIDED: 20,
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
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

    let body: {
      type: SessionType
      categories?: QuestionCategory[]
      questionCount?: number
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { type, categories, questionCount } = body

    // Validate session type
    if (!type || !VALID_SESSION_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid session type. Must be one of: ${VALID_SESSION_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Rate limit for EXAM sessions
    if (type === 'EXAM') {
      const rl = await rateLimitByPlan(user.id, 'EXAM', user.isPremium)
      if (!rl.success) {
        return NextResponse.json(
          { error: 'Daily exam limit reached', remaining: rl.remaining, reset: rl.reset },
          { status: 429 }
        )
      }
    }

    // Validate categories
    const filteredCategories: QuestionCategory[] = (categories ?? []).filter((c) =>
      VALID_CATEGORIES.includes(c)
    )

    // Determine total question count
    const defaultCount = SESSION_QUESTION_COUNTS[type]
    const totalQuestions = Math.min(
      Math.max(1, questionCount ?? defaultCount),
      100
    )

    // Build question filter
    const questionWhere = {
      isPublished: true,
      ...(filteredCategories.length > 0
        ? { category: { in: filteredCategories } }
        : {}),
    }

    // Fetch available question IDs and randomly pick the required amount
    const allIds = await prisma.question.findMany({
      where: questionWhere,
      select: { id: true },
    })

    if (allIds.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the requested filters' },
        { status: 422 }
      )
    }

    // Fisher-Yates shuffle (unbiased) then take the required count
    const idArray = allIds.map((q) => q.id)
    for (let i = idArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idArray[i], idArray[j]] = [idArray[j], idArray[i]]
    }
    const selectedIds = idArray.slice(0, totalQuestions)

    // Create the session
    const session = await prisma.examSession.create({
      data: {
        userId: user.id,
        type,
        status: 'IN_PROGRESS',
        totalQuestions: selectedIds.length,
        categoryFilter: filteredCategories.length > 0 ? filteredCategories : [],
        metadata: {
          questionIds: selectedIds,
          currentIndex: 0,
        },
      },
    })

    // Fetch the first batch of questions (without revealing correct answers)
    const questions = await prisma.question.findMany({
      where: { id: { in: selectedIds } },
      select: {
        id: true,
        text: true,
        imageUrl: true,
        category: true,
        difficulty: true,
        tags: true,
        answers: {
          select: {
            id: true,
            text: true,
            // isCorrect intentionally omitted
          },
        },
      },
    })

    // Preserve the shuffled order
    const orderedQuestions = selectedIds.map((qId) => {
      const q = questions.find((qu) => qu.id === qId)!
      return {
        ...q,
        answers: q.answers.sort(() => Math.random() - 0.5),
      }
    })

    return NextResponse.json(
      {
        session: {
          id: session.id,
          type: session.type,
          status: session.status,
          totalQuestions: session.totalQuestions,
          categoryFilter: session.categoryFilter,
          startedAt: session.startedAt,
        },
        questions: orderedQuestions,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[sessions] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/sessions - Get session history for user
export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50)
    const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10), 0)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    // Validate status and type params to avoid injection via Prisma enum
    const VALID_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'] as const
    const VALID_TYPES = ['PRACTICE', 'EXAM', 'REVIEW', 'AI_GUIDED'] as const

    type ValidStatus = (typeof VALID_STATUSES)[number]
    type ValidType = (typeof VALID_TYPES)[number]

    const validatedStatus = status && VALID_STATUSES.includes(status as ValidStatus)
      ? (status as ValidStatus)
      : undefined

    const validatedType = type && VALID_TYPES.includes(type as ValidType)
      ? (type as ValidType)
      : undefined

    const where = {
      userId: user.id,
      ...(validatedStatus ? { status: validatedStatus } : {}),
      ...(validatedType ? { type: validatedType } : {}),
    }

    const [sessions, total] = await Promise.all([
      prisma.examSession.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { startedAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          timeSpent: true,
          startedAt: true,
          completedAt: true,
          categoryFilter: true,
        },
      }),
      prisma.examSession.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('[sessions] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
