import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatMessage, ChatRole } from '@permis-ai/shared'
import apiClient from './client'

// ============================================================
// QUERY KEYS
// ============================================================

export const chatKeys = {
  all: ['chat'] as const,
  history: () => [...chatKeys.all, 'history'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
}

// ============================================================
// TYPES
// ============================================================

export interface SendMessageParams {
  content: string
  questionId?: string
  conversationId?: string
}

export interface SendMessageStreamParams {
  content: string
  questionId?: string
  conversationId?: string
  onChunk: (chunk: string) => void
  onDone: () => void
}

export interface ChatHistoryItem {
  id: string
  lastMessage: string
  updatedAt: string
  messageCount: number
}

export interface UsageQuota {
  questionsAsked: number
  maxAllowed: number
  resetsAt: string
}

// ============================================================
// HOOKS
// ============================================================

export function useChatHistory() {
  return useQuery({
    queryKey: chatKeys.history(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: ChatHistoryItem[] }>('/chat/history')
      return response.data.data
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useChatUsageQuota() {
  return useQuery({
    queryKey: [...chatKeys.all, 'quota'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: UsageQuota }>('/chat/quota')
      return response.data.data
    },
    staleTime: 60 * 1000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SendMessageParams): Promise<ChatMessage> => {
      const response = await apiClient.post<{ data: ChatMessage }>('/chat/message', {
        content: params.content,
        questionId: params.questionId,
        conversationId: params.conversationId,
      })
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.history() })
    },
  })
}

export function useSendMessageStream() {
  return useMutation({
    mutationFn: async (params: SendMessageStreamParams): Promise<void> => {
      const baseURL = apiClient.defaults.baseURL ?? ''
      const session = (apiClient.defaults.headers.common?.['Authorization'] as string) ?? ''

      const response = await fetch(`${baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: session,
        },
        body: JSON.stringify({
          content: params.content,
          questionId: params.questionId,
          conversationId: params.conversationId,
        }),
      })

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
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              params.onDone()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                params.onChunk(parsed.content)
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      params.onDone()
    },
  })
}
