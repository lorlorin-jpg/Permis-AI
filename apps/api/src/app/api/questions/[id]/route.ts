import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 })
    }

    const question = await prisma.question.findFirst({
      where: { id, isPublished: true },
      select: {
        id: true,
        text: true,
        imageUrl: true,
        category: true,
        difficulty: true,
        tags: true,
        isAIGenerated: true,
        createdAt: true,
        // Do NOT expose 'explanation' or embeddings here
        answers: {
          select: {
            id: true,
            text: true,
            // isCorrect is intentionally omitted
          },
        },
      },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({
      question: {
        ...question,
        answers: shuffleArray(question.answers),
      },
    })
  } catch (error) {
    console.error('[questions/[id]] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
