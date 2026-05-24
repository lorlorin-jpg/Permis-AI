import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { QuestionCategory, Difficulty } from '@prisma/client'

// Fisher-Yates shuffle
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const VALID_CATEGORIES: QuestionCategory[] = [
  'SIGNS', 'PRIORITY', 'HIGHWAY', 'SPEED_LIMITS', 'ALCOHOL',
  'DISTANCES', 'REAL_SITUATIONS', 'ECO_DRIVING', 'SAFETY', 'BEHAVIORS',
]

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']

export async function GET(request: NextRequest) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl

    // Parse and validate query parameters
    const categoryParam = searchParams.get('category')?.toUpperCase() as QuestionCategory | null
    const difficultyParam = searchParams.get('difficulty')?.toUpperCase() as Difficulty | null
    const limitParam = parseInt(searchParams.get('limit') ?? '20', 10)
    const offsetParam = parseInt(searchParams.get('offset') ?? '0', 10)
    const sessionType = searchParams.get('sessionType')

    // Validate category
    if (categoryParam && !VALID_CATEGORIES.includes(categoryParam)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Validate difficulty
    if (difficultyParam && !VALID_DIFFICULTIES.includes(difficultyParam)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }

    // Clamp limit
    const limit = Math.min(Math.max(1, limitParam), 100)
    const offset = Math.max(0, offsetParam)

    // Build where clause
    const where = {
      isPublished: true,
      ...(categoryParam ? { category: categoryParam } : {}),
      ...(difficultyParam ? { difficulty: difficultyParam } : {}),
    }

    // Fetch questions and total count in parallel
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy:
          sessionType === 'EXAM'
            ? { createdAt: 'desc' }
            : { difficulty: 'asc' },
        select: {
          id: true,
          text: true,
          imageUrl: true,
          category: true,
          difficulty: true,
          tags: true,
          isAIGenerated: true,
          createdAt: true,
          answers: {
            select: {
              id: true,
              text: true,
              // Never expose isCorrect in list endpoint
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ])

    // Shuffle answers for each question
    const questionsWithShuffledAnswers = questions.map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }))

    return NextResponse.json({
      questions: questionsWithShuffledAnswers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('[questions] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
