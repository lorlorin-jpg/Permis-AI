import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuthStore } from '@store/auth.store'
import { COLORS } from '@/constants/theme'

// ============================================================
// AUTH LAYOUT
// Guards: if user is already authenticated, redirect to main app
// ============================================================

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isLoading])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
