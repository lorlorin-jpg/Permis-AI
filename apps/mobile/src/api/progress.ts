import { useQuery } from '@tanstack/react-query'
import { OverallStats, UserProgress, QuestionCategory } from '@permis-ai/shared'
import apiClient from './client'

// ============================================================
// QUERY KEYS
// ============================================================

export const progressKeys = {
  all: ['progress'] as const,
  userProgress: () => [...progressKeys.all, 'user'] as const,
  weakness: () => [...progressKeys.all, 'weakness'] as const,
  stats: () => [...progressKeys.all, 'stats'] as const,
  categoryProgress: (category: QuestionCategory) =>
    [...progressKeys.all, 'category', category] as const,
}

// ============================================================
// TYPES
// ============================================================

export interface WeaknessAnalysis {
  weakestCategories: QuestionCategory[]
  recommendedCategories: QuestionCategory[]
  categoryInsights: CategoryInsight[]
  overallTrend: 'improving' | 'stable' | 'declining'
  aiRecommendation: string
}

export interface CategoryInsight {
  category: QuestionCategory
  masteryScore: number
  recentAccuracy: number
  questionsNeeded: number
  priority: 'high' | 'medium' | 'low'
}

// ============================================================
// HOOKS
// ============================================================

export function useUserProgress() {
  return useQuery({
    queryKey: progressKeys.userProgress(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: OverallStats }>('/progress')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useWeaknessAnalysis() {
  return useQuery({
    queryKey: progressKeys.weakness(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: WeaknessAnalysis }>('/progress/weakness')
      return response.data.data
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useCategoryProgress(category: QuestionCategory) {
  return useQuery({
    queryKey: progressKeys.categoryProgress(category),
    queryFn: async () => {
      const response = await apiClient.get<{ data: UserProgress }>(
        `/progress/category/${category}`,
      )
      return response.data.data
    },
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  })
}
