import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'

export interface LearningProfile {
  userId: string
  weakCategories: string[]
  strongCategories: string[]
  averageAccuracy: number
  averageTime: number
  learningStyle: 'visual' | 'analytical' | 'practical'
  frustrationLevel: 'low' | 'medium' | 'high'
  currentStreak: number
  recommendedDifficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

export async function buildLearningProfile(userId: string): Promise<LearningProfile> {
  const [progress, recentAnswers, user] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId } }),
    prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { question: { select: { category: true, difficulty: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, xp: true },
    }),
  ])

  const weakCategories = progress
    .filter(p => p.weaknessScore > 0.4)
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
    .map(p => p.category)

  const strongCategories = progress
    .filter(p => p.weaknessScore < 0.2 && p.totalAnswered > 5)
    .map(p => p.category)

  const totalAnswered = recentAnswers.length
  const correctCount = recentAnswers.filter(a => a.isCorrect).length
  const averageAccuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0

  const avgTime = recentAnswers.reduce((acc, a) => acc + (a.timeSpent ?? 0), 0) / Math.max(totalAnswered, 1)

  // Détection frustration : erreurs consécutives récentes
  const last10 = recentAnswers.slice(0, 10)
  const recentErrors = last10.filter(a => !a.isCorrect).length
  const frustrationLevel = recentErrors >= 7 ? 'high' : recentErrors >= 4 ? 'medium' : 'low'

  // Style d'apprentissage basé sur le temps de réponse
  const learningStyle = avgTime < 10 ? 'practical' : avgTime > 25 ? 'analytical' : 'visual'

  // Difficulté recommandée
  const recommendedDifficulty =
    averageAccuracy > 0.8 ? 'HARD' :
    averageAccuracy > 0.6 ? 'MEDIUM' : 'EASY'

  return {
    userId,
    weakCategories: weakCategories.slice(0, 3),
    strongCategories: strongCategories.slice(0, 3),
    averageAccuracy,
    averageTime: Math.round(avgTime),
    learningStyle,
    frustrationLevel,
    currentStreak: user?.streak ?? 0,
    recommendedDifficulty,
  }
}

export function buildCoachingTone(profile: LearningProfile): string {
  const toneMap = {
    high: `L'utilisateur est actuellement frustré (${Math.round((1 - profile.averageAccuracy) * 100)}% d'erreurs récentes).
Utilise un ton TRÈS rassurant, bienveillant et encourageant.
Valorise l'effort, pas seulement le résultat.
Commence par "C'est tout à fait normal de trouver ça difficile..."`,

    medium: `L'utilisateur progresse mais a des difficultés.
Utilise un ton équilibré : encourageant mais pédagogique.
Souligne les progrès tout en expliquant clairement les erreurs.`,

    low: `L'utilisateur est en bonne forme (${Math.round(profile.averageAccuracy * 100)}% de précision).
Utilise un ton dynamique et challengeant.
Propose des nuances avancées et des cas particuliers.`,
  }

  return toneMap[profile.frustrationLevel]
}

export function buildPersonalizedPrompt(profile: LearningProfile, basePrompt: string): string {
  const weakStr = profile.weakCategories.length > 0
    ? `Les points faibles de l'utilisateur sont : ${profile.weakCategories.join(', ')}.`
    : ''

  const styleStr = {
    visual: "Utilise des descriptions visuelles et des exemples concrets de situations sur route.",
    analytical: "L'utilisateur apprécie les explications détaillées avec la logique derrière les règles.",
    practical: "L'utilisateur préfère des réponses courtes et directes. Va à l'essentiel.",
  }[profile.learningStyle]

  const tone = buildCoachingTone(profile)

  return `${basePrompt}

=== PROFIL APPRENANT ===
${tone}
${weakStr}
${styleStr}
Streak actuel : ${profile.currentStreak} jours — ${profile.currentStreak > 7 ? "félicite-le discrètement" : "encourage-le à maintenir l'effort"}.
Niveau de précision global : ${Math.round(profile.averageAccuracy * 100)}%.
===================`
}

export async function generateAdaptiveSeries(
  userId: string,
  count: number = 10
): Promise<string[]> {
  const profile = await buildLearningProfile(userId)

  // Prioritise les catégories faibles (70%) + catégories fortes pour confiance (30%)
  const weakWeight = Math.floor(count * 0.7)
  const strongWeight = count - weakWeight

  const weakQuestions = await prisma.question.findMany({
    where: {
      isPublished: true,
      category: profile.weakCategories.length > 0
        ? { in: profile.weakCategories as any[] }
        : undefined,
      difficulty: profile.recommendedDifficulty,
    },
    select: { id: true },
    take: weakWeight,
    orderBy: { createdAt: 'desc' },
  })

  const strongQuestions = await prisma.question.findMany({
    where: {
      isPublished: true,
      category: profile.strongCategories.length > 0
        ? { in: profile.strongCategories as any[] }
        : undefined,
      difficulty: 'EASY',
      id: { notIn: weakQuestions.map(q => q.id) },
    },
    select: { id: true },
    take: strongWeight,
  })

  const allIds = [...weakQuestions, ...strongQuestions].map(q => q.id)
  // Shuffle
  return allIds.sort(() => Math.random() - 0.5)
}
