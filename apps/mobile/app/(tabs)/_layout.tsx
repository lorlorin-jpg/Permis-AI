import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Tabs, useRouter } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '@store/auth.store'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'

// ============================================================
// TAB DEFINITIONS
// ============================================================

const TABS = [
  { name: 'index', label: 'Accueil', icon: 'home' as const },
  { name: 'practice', label: 'Entraînement', icon: 'book-open' as const },
  { name: 'exam', label: 'Examen', icon: 'clipboard' as const },
  { name: 'chat', label: 'Coach IA', icon: 'message-square' as const },
  { name: 'profile', label: 'Profil', icon: 'user' as const },
]

// ============================================================
// CUSTOM TAB BAR
// ============================================================

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        flexDirection: 'row',
        paddingHorizontal: SPACING.sm,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index
        const tab = TABS.find((t) => t.name === route.name) ?? TABS[0]

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6,
              gap: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 28,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'transparent',
              }}
            >
              <Feather
                name={tab.icon}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
              />
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isFocused ? '600' : '400',
                color: isFocused ? COLORS.primary : COLORS.textMuted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// ============================================================
// TABS LAYOUT
// ============================================================

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)')
    }
  }, [isAuthenticated, isLoading])

  if (!isAuthenticated) return null

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="practice" />
      <Tabs.Screen name="exam" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
