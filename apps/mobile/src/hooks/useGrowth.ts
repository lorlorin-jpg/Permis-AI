import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@api/client'
import { Share } from 'react-native'

export function useReferral() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/referral')
      return data
    },
  })
}

export function useShareScore() {
  return {
    shareScore: async (score: number, correct: number, total: number) => {
      const isPassed = score >= 80
      const message = isPassed
        ? `✅ J'ai réussi le permis théorie suisse avec ${score}% ! (${correct}/${total})\n🇨🇭 Préparé avec Permis AI`
        : `💪 Je m'entraîne pour le permis suisse : ${score}% aujourd'hui\n🇨🇭 Permis AI`

      await Share.share({ message })
    },
  }
}
