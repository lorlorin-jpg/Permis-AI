import { useAuthStore } from '@store/auth.store'
import { apiClient } from '@api/client'

export function useAuth() {
  const { user, session, setUser, setSession, logout } = useAuthStore()

  const isAuthenticated = !!session
  const isPremium = user?.role === 'PREMIUM'
  const isAdmin = user?.role === 'ADMIN'

  async function refreshUser() {
    if (!session) return
    try {
      const { data } = await apiClient.get('/api/user')
      setUser(data)
    } catch {}
  }

  return { user, session, isAuthenticated, isPremium, isAdmin, logout, refreshUser }
}
