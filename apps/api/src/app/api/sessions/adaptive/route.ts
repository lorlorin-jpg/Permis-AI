import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, Errors } from '@/lib/errors'
import { generateAdaptiveSeries, buildLearningProfile } from '@/lib/ai/adaptive-learning'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return handleError(Errors.UNAUTHORIZED())

    const user = await prisma.user.findUnique({ where: { supabaseId: userId } })
    if (!user) return handleError(Errors.NOT_FOUND('User'))

    const { count = 10 } = await req.json().catch(() => ({}))

    const [questionIds, profile] = await Promise.all([
      generateAdaptiveSeries(user.id, count),
      buildLearningProfile(user.id),
    ])

    const session = await prisma.examSession.create({
      data: {
        userId: user.id,
        type: 'AI_GUIDED',
        status: 'IN_PROGRESS',
        totalQuestions: questionIds.length,
        metadata: {
          questionIds,
          profile: {
            weakCategories: profile.weakCategories,
            recommendedDifficulty: profile.recommendedDifficulty,
            frustrationLevel: profile.frustrationLevel,
          },
        },
      },
    })

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { answers: { select: { id: true, text: true } } },
    })

    // Réordonne selon l'ordre adaptatif
    const orderedQuestions = questionIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean)

    return Response.json({ session, questions: orderedQuestions, profile })
  } catch (error) {
    return handleError(error)
  }
}
