import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@api/client'

export function useAdaptiveSession() {
  return useMutation({
    mutationFn: async (count: number = 10) => {
      const { data } = await apiClient.post('/api/sessions/adaptive', { count })
      return data
    },
  })
}

export function useAdaptiveSessionEnabled() {
  // Enabled only for premium users or after first 10 questions answered
  return { isEnabled: true } // Simplified — in production check user.isPremium
}
