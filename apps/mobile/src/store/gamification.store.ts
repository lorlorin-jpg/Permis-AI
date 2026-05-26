import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type League = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

interface DailyGoal {
  target: number // questions à répondre
  completed: number
  date: string // YYYY-MM-DD
}

interface GamificationStore {
  // Daily Challenge
  dailyChallengeCompleted: boolean
  dailyChallengeDate: string | null
  dailyChallengeStreak: number

  // Streak
  streakShields: number // nombre de shields disponibles
  lastStreakDate: string | null

  // League
  currentLeague: League
  leagueXP: number // XP dans la ligue actuelle
  weeklyRank: number

  // Daily Goal
  dailyGoal: DailyGoal

  // Session
  todayQuestionsAnswered: number
  todayCorrectAnswers: number
  todayXPEarned: number

  // Actions
  completeDailyChallenge: () => void
  useStreakShield: () => boolean
  addStreakShield: () => void
  updateDailyGoal: (completed: number) => void
  addTodayStats: (correct: boolean, xp: number) => void
  checkAndPromoteLeague: (totalXP: number) => void
  resetDailyStats: () => void
}

const LEAGUE_THRESHOLDS: Record<League, number> = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 2000,
  PLATINUM: 5000,
  DIAMOND: 15000,
}

function getLeagueForXP(xp: number): League {
  if (xp >= 15000) return 'DIAMOND'
  if (xp >= 5000) return 'PLATINUM'
  if (xp >= 2000) return 'GOLD'
  if (xp >= 500) return 'SILVER'
  return 'BRONZE'
}

const today = () => new Date().toISOString().split('T')[0]

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      dailyChallengeCompleted: false,
      dailyChallengeDate: null,
      dailyChallengeStreak: 0,
      streakShields: 2,
      lastStreakDate: null,
      currentLeague: 'BRONZE',
      leagueXP: 0,
      weeklyRank: 0,
      dailyGoal: { target: 10, completed: 0, date: today() },
      todayQuestionsAnswered: 0,
      todayCorrectAnswers: 0,
      todayXPEarned: 0,

      completeDailyChallenge: () => {
        const t = today()
        const { dailyChallengeDate, dailyChallengeStreak } = get()
        const isNextDay = dailyChallengeDate === getPreviousDay(t)
        set({
          dailyChallengeCompleted: true,
          dailyChallengeDate: t,
          dailyChallengeStreak: isNextDay ? dailyChallengeStreak + 1 : 1,
        })
      },

      useStreakShield: () => {
        const { streakShields } = get()
        if (streakShields <= 0) return false
        set({ streakShields: streakShields - 1 })
        return true
      },

      addStreakShield: () => {
        set(s => ({ streakShields: Math.min(s.streakShields + 1, 5) }))
      },

      updateDailyGoal: (completed) => {
        const t = today()
        set(s => ({
          dailyGoal: {
            ...s.dailyGoal,
            completed,
            date: t,
          },
        }))
      },

      addTodayStats: (correct, xp) => {
        const t = today()
        set(s => {
          // Reset si nouveau jour
          const isNewDay = s.dailyGoal.date !== t
          return {
            todayQuestionsAnswered: (isNewDay ? 0 : s.todayQuestionsAnswered) + 1,
            todayCorrectAnswers: (isNewDay ? 0 : s.todayCorrectAnswers) + (correct ? 1 : 0),
            todayXPEarned: (isNewDay ? 0 : s.todayXPEarned) + xp,
            dailyGoal: {
              target: s.dailyGoal.target,
              completed: (isNewDay ? 0 : s.dailyGoal.completed) + 1,
              date: t,
            },
          }
        })
      },

      checkAndPromoteLeague: (totalXP) => {
        const league = getLeagueForXP(totalXP)
        set({ currentLeague: league, leagueXP: totalXP })
      },

      resetDailyStats: () => {
        const t = today()
        set({
          dailyChallengeCompleted: false,
          todayQuestionsAnswered: 0,
          todayCorrectAnswers: 0,
          todayXPEarned: 0,
          dailyGoal: { target: 10, completed: 0, date: t },
        })
      },
    }),
    {
      name: 'gamification-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

function getPreviousDay(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export { getLeagueForXP, LEAGUE_THRESHOLDS }
