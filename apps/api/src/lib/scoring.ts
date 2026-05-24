import type { PrismaClient, Badge, UserBadge } from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// Level system
// ─────────────────────────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  5000,   // Level 7
  10000,  // Level 8
  20000,  // Level 9
  50000,  // Level 10
]

export function calculateLevel(totalXp: number): number {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return level
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) return Infinity
  return LEVEL_THRESHOLDS[currentLevel] // threshold at index = level (0-indexed +1)
}

// ─────────────────────────────────────────────────────────────────────────────
// XP calculation
// ─────────────────────────────────────────────────────────────────────────────

const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  EASY: 1.0,
  MEDIUM: 1.5,
  HARD: 2.0,
}

const BASE_XP = 10
const WRONG_ANSWER_XP = 2  // partial XP for attempting
const TIME_BONUS_THRESHOLD_SECONDS = 15
const TIME_BONUS_XP = 3

/**
 * Calculate XP earned for a single question answer.
 *
 * @param isCorrect   - Whether the answer was correct
 * @param timeSpent   - Time spent in seconds
 * @param difficulty  - Question difficulty: EASY | MEDIUM | HARD
 * @param streak      - Current answer streak (consecutive correct answers)
 */
export function calculateXP(
  isCorrect: boolean,
  timeSpent: number,
  difficulty: string,
  streak: number
): number {
  if (!isCorrect) {
    return WRONG_ANSWER_XP
  }

  const diffMult = DIFFICULTY_MULTIPLIER[difficulty] ?? 1.0

  // Streak bonus: +10% per 5 correct answers, capped at +50%
  const streakBonus = Math.min(Math.floor(streak / 5) * 0.1, 0.5)

  // Speed bonus for answering quickly
  const speedBonus =
    timeSpent > 0 && timeSpent <= TIME_BONUS_THRESHOLD_SECONDS
      ? TIME_BONUS_XP
      : 0

  const xp = Math.round(BASE_XP * diffMult * (1 + streakBonus) + speedBonus)
  return xp
}

// ─────────────────────────────────────────────────────────────────────────────
// Weakness score
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update weakness score for a category based on a new answer.
 * Score is between 0 (no weakness) and 1 (very weak).
 * Uses exponential moving average so recent answers weigh more.
 *
 * @param currentScore  - Existing weakness score (0–1)
 * @param isCorrect     - Whether the latest answer was correct
 */
export function updateWeaknessScore(
  currentScore: number,
  isCorrect: boolean
): number {
  const alpha = 0.2 // smoothing factor
  const outcome = isCorrect ? 0 : 1
  const newScore = alpha * outcome + (1 - alpha) * currentScore
  return Math.max(0, Math.min(1, newScore))
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge evaluation
// ─────────────────────────────────────────────────────────────────────────────

interface UserStats {
  totalAnswered: number
  totalCorrect: number
  streak: number
  level: number
  isPremium: boolean
}

interface BadgeCondition {
  type: string
  value: number
}

async function getUserStats(
  userId: string,
  prisma: PrismaClient
): Promise<UserStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      level: true,
      streak: true,
      isPremium: true,
    },
  })

  const progress = await prisma.userProgress.aggregate({
    where: { userId },
    _sum: {
      totalAnswered: true,
      correctAnswers: true,
    },
  })

  return {
    totalAnswered: progress._sum.totalAnswered ?? 0,
    totalCorrect: progress._sum.correctAnswers ?? 0,
    streak: user?.streak ?? 0,
    level: user?.level ?? 1,
    isPremium: user?.isPremium ?? false,
  }
}

function evaluateBadgeCondition(
  condition: BadgeCondition,
  stats: UserStats
): boolean {
  switch (condition.type) {
    case 'totalAnswered':
      return stats.totalAnswered >= condition.value
    case 'totalCorrect':
      return stats.totalCorrect >= condition.value
    case 'streak':
      return stats.streak >= condition.value
    case 'level':
      return stats.level >= condition.value
    case 'accuracy': {
      if (stats.totalAnswered === 0) return false
      const accuracy = (stats.totalCorrect / stats.totalAnswered) * 100
      return accuracy >= condition.value
    }
    default:
      return false
  }
}

/**
 * Check all defined badges and award any newly earned ones to the user.
 * Returns only newly awarded badges (not previously earned).
 */
export async function checkForBadges(
  userId: string,
  prisma: PrismaClient
): Promise<(Badge & { userBadge: UserBadge })[]> {
  const [allBadges, earnedBadges, stats] = await Promise.all([
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    }),
    getUserStats(userId, prisma),
  ])

  const earnedIds = new Set(earnedBadges.map((ub) => ub.badgeId))
  const newlyEarned: (Badge & { userBadge: UserBadge })[] = []

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue

    const condition = badge.condition as BadgeCondition
    if (evaluateBadgeCondition(condition, stats)) {
      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badge.id,
        },
      })
      newlyEarned.push({ ...badge, userBadge })
    }
  }

  return newlyEarned
}
