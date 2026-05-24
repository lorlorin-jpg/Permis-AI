import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Session, SessionStatus, ExamResult, QuestionCategory, Difficulty } from '@permis-ai/shared'
import apiClient from './client'

// ============================================================
// QUERY KEYS
// ============================================================

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
  history: () => [...sessionKeys.all, 'history'] as const,
  result: (id: string) => [...sessionKeys.all, 'result', id] as const,
}

// ============================================================
// TYPES
// ============================================================

export interface CreateSessionParams {
  type: 'PRACTICE' | 'EXAM' | 'CATEGORY'
  category?: QuestionCategory
  difficulty?: Difficulty
  questionCount?: number
}

export interface SubmitAnswerParams {
  sessionId: string
  questionId: string
  answerId: string
  timeSpentMs: number
}

export interface CompleteSessionParams {
  sessionId: string
}

// ============================================================
// HOOKS
// ============================================================

export function useSession(id: string) {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Session }>(`/sessions/${id}`)
      return response.data.data
    },
    enabled: Boolean(id),
  })
}

export function useSessionHistory() {
  return useQuery({
    queryKey: sessionKeys.history(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: Session[] }>('/sessions/history')
      return response.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useSessionResult(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.result(sessionId),
    queryFn: async () => {
      const response = await apiClient.get<{ data: ExamResult }>(`/sessions/${sessionId}/result`)
      return response.data.data
    },
    enabled: Boolean(sessionId),
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateSessionParams): Promise<Session> => {
      const response = await apiClient.post<{ data: Session }>('/sessions', params)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
    },
  })
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async (params: SubmitAnswerParams) => {
      const response = await apiClient.post<{
        data: { isCorrect: boolean; correctAnswerId: string; xpEarned: number }
      }>(`/sessions/${params.sessionId}/answers`, {
        questionId: params.questionId,
        answerId: params.answerId,
        timeSpentMs: params.timeSpentMs,
      })
      return response.data.data
    },
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CompleteSessionParams): Promise<ExamResult> => {
      const response = await apiClient.post<{ data: ExamResult }>(
        `/sessions/${params.sessionId}/complete`,
      )
      return response.data.data
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.history() })
      queryClient.invalidateQueries({ queryKey: sessionKeys.result(params.sessionId) })
    },
  })
}
