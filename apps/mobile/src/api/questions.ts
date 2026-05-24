import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Question, QuestionCategory, Difficulty, AIExplanation, PaginatedResponse } from '@permis-ai/shared'
import apiClient from './client'

// ============================================================
// QUERY KEYS
// ============================================================

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: QuestionFilters) => [...questionKeys.lists(), filters] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
  explanation: (questionId: string, answerId?: string) =>
    [...questionKeys.all, 'explanation', questionId, answerId] as const,
}

// ============================================================
// TYPES
// ============================================================

export interface QuestionFilters {
  category?: QuestionCategory
  difficulty?: Difficulty
  limit?: number
  page?: number
  excludeIds?: string[]
}

export interface ExplainQuestionParams {
  questionId: string
  userAnswerId: string
  prompt?: string
}

export interface GenerateSessionOptions {
  type: 'PRACTICE' | 'EXAM' | 'CATEGORY'
  category?: QuestionCategory
  difficulty?: Difficulty
  questionCount?: number
}

// ============================================================
// HOOKS
// ============================================================

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: questionKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.limit) params.append('limit', String(filters.limit))
      if (filters.page) params.append('page', String(filters.page))
      if (filters.excludeIds?.length) {
        params.append('excludeIds', filters.excludeIds.join(','))
      }

      const response = await apiClient.get<PaginatedResponse<Question>>(
        `/questions?${params.toString()}`,
      )
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Question }>(`/questions/${id}`)
      return response.data.data
    },
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  })
}

export function useExplainQuestion() {
  return useMutation({
    mutationFn: async (params: ExplainQuestionParams): Promise<AIExplanation> => {
      const response = await apiClient.post<{ data: AIExplanation }>(
        `/questions/${params.questionId}/explain`,
        {
          userAnswerId: params.userAnswerId,
          prompt: params.prompt,
        },
      )
      return response.data.data
    },
  })
}

export function useStreamExplanation() {
  return useMutation({
    mutationFn: async ({
      params,
      onChunk,
    }: {
      params: ExplainQuestionParams
      onChunk: (chunk: string) => void
    }): Promise<void> => {
      const response = await fetch(
        `${apiClient.defaults.baseURL}/questions/${params.questionId}/explain/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiClient.defaults.headers.common?.['Authorization'] as string ?? '',
          },
          body: JSON.stringify({
            userAnswerId: params.userAnswerId,
            prompt: params.prompt,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE format
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) onChunk(parsed.content)
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }
    },
  })
}

export function useGenerateSession() {
  return useMutation({
    mutationFn: async (options: GenerateSessionOptions) => {
      const response = await apiClient.post<{ data: Question[] }>('/questions/generate-session', options)
      return response.data.data
    },
  })
}
