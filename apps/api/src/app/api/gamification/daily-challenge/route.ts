import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, Errors } from '@/lib/errors'

// GET — récupère le challenge du jour (même pour tous les users)
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return handleError(Errors.UNAUTHORIZED())

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sélectionne 3 questions aléatoires comme challenge du jour
    // (même seed pour tous les users ce jour-là)
    const dayOfYear = Math.floor((Date.now() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)

    const totalQuestions = await prisma.question.count({ where: { isPublished: true } })
    const skip = (dayOfYear * 3) % Math.max(totalQuestions - 3, 1)

    const questions = await prisma.question.findMany({
      where: { isPublished: true },
      skip,
      take: 3,
      select: {
        id: true,
        text: true,
        category: true,
        difficulty: true,
        answers: { select: { id: true, text: true } },
      },
    })

    // Vérifie si le user a déjà complété le challenge aujourd'hui
    const completed = await prisma.userAnswer.findFirst({
      where: {
        userId,
        questionId: { in: questions.map(q => q.id) },
        createdAt: { gte: today },
      },
    })

    return Response.json({
      questions,
      completed: !!completed,
      xpReward: 50,
      date: today.toISOString().split('T')[0],
    })
  } catch (error) {
    return handleError(error)
  }
}
