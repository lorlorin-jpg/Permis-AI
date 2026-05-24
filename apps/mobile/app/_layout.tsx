import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as Font from 'expo-font'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { COLORS } from '@/constants/theme'

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes default
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// ============================================================
// ROOT LAYOUT
// ============================================================

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Using system fonts as fallback; Inter would be loaded here
          // if bundled via @expo-google-fonts/inter
        })
      } catch (e) {
        console.warn('Font loading failed:', e)
      } finally {
        setFontsLoaded(true)
        await SplashScreen.hideAsync()
      }
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="light" backgroundColor={COLORS.background} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: COLORS.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="quiz/[sessionId]"
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="exam/[sessionId]"
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="results/[sessionId]"
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
})
