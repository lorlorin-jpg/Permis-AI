import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sessions/[id] - Get session details
export async function GET(
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
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await prisma.examSession.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        userAnswers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                category: true,
                difficulty: true,
              },
            },
            answer: {
              select: { id: true, text: true, isCorrect: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        aiAnalysis: {
          select: { id: true, content: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Extract question IDs from metadata so the client knows what to expect
    const meta = session.metadata as { questionIds?: string[]; currentIndex?: number } | null

    return NextResponse.json({
      session: {
        id: session.id,
        type: session.type,
        status: session.status,
        score: session.score,
        totalQuestions: session.totalQuestions,
        correctAnswers: session.correctAnswers,
        timeSpent: session.timeSpent,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        categoryFilter: session.categoryFilter,
        currentIndex: meta?.currentIndex ?? session.userAnswers.length,
        questionIds: meta?.questionIds ?? [],
        answers: session.userAnswers.map((ua) => ({
          id: ua.id,
          questionId: ua.questionId,
          question: ua.question,
          answerId: ua.answerId,
          answer: ua.answer,
          isCorrect: ua.isCorrect,
          timeSpent: ua.timeSpent,
          createdAt: ua.createdAt,
        })),
        aiAnalysis: session.aiAnalysis[0] ?? null,
      },
    })
  } catch (error) {
    console.error('[sessions/[id]] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/sessions/[id] - Update session (e.g., mark as abandoned)
export async function PATCH(
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
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await prisma.examSession.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true, status: true },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: `Session is already ${session.status}` },
        { status: 409 }
      )
    }

    let body: { status?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const allowedUpdates: Record<string, string> = {
      ABANDONED: 'ABANDONED',
    }

    const newStatus = body.status ? allowedUpdates[body.status] : undefined

    if (!newStatus) {
      return NextResponse.json(
        { error: 'Only "ABANDONED" status updates are supported via PATCH' },
        { status: 400 }
      )
    }

    const updated = await prisma.examSession.update({
      where: { id: session.id },
      data: {
        status: 'ABANDONED',
        completedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    })

    return NextResponse.json({ session: updated })
  } catch (error) {
    console.error('[sessions/[id]] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
