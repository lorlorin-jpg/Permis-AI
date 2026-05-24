import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import { User, UserRole, SubscriptionStatus } from '@permis-ai/shared'

// Supabase-compatible session type (lightweight version)
export interface AppSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: {
    id: string
    email: string
  }
}

interface AuthStore {
  user: User | null
  session: AppSession | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setSession: (session: AppSession | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isPremium: () => boolean
}

// SecureStore adapter for zustand persist
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name)
    } catch {
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value)
    } catch {
      // Silently fail if SecureStore unavailable (e.g., web/simulator)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name)
    } catch {
      // Silently fail
    }
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),

      setSession: (session) =>
        set({
          session,
          isAuthenticated: session !== null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      isPremium: () => {
        const { user } = get()
        if (!user) return false
        return (
          user.role === UserRole.PREMIUM ||
          user.role === UserRole.ADMIN ||
          user.subscriptionStatus === SubscriptionStatus.ACTIVE ||
          user.subscriptionStatus === SubscriptionStatus.TRIALING
        )
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
