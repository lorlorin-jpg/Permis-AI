import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme'
import { useGamificationStore } from '@store/gamification.store'

interface StreakCardProps {
  streak: number
  onProtect?: () => void
}

export function StreakCard({ streak, onProtect }: StreakCardProps) {
  const { streakShields } = useGamificationStore()
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start()
  }, [])

  const isOnFire = streak >= 7
  const flameColors = isOnFire
    ? ['#F97316', '#EF4444'] as const
    : ['#6366F1', '#8B5CF6'] as const

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={['#1A1A1A', '#242424']} style={styles.gradient}>
        <View style={styles.row}>
          <Text style={styles.flame}>{isOnFire ? '🔥' : '⚡'}</Text>
          <View style={styles.info}>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>jours de suite</Text>
          </View>
          {streakShields > 0 && (
            <TouchableOpacity
              style={styles.shieldBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                onProtect?.()
              }}
            >
              <Text style={styles.shieldEmoji}>🛡️</Text>
              <Text style={styles.shieldCount}>{streakShields}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.weekRow}>
          {Array.from({ length: 7 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dayDot, i < Math.min(streak, 7) && styles.dayDotActive]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { borderRadius: BORDER_RADIUS?.xl ?? 16, overflow: 'hidden' },
  gradient: { padding: SPACING[4] ?? 16, gap: SPACING[3] ?? 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING[3] ?? 12 },
  flame: { fontSize: 32 },
  info: { flex: 1 },
  streakNum: { fontSize: TYPOGRAPHY?.fontSizes?.['4xl'] ?? 36, fontWeight: '800', color: '#fff' },
  streakLabel: { fontSize: TYPOGRAPHY?.fontSizes?.sm ?? 14, color: COLORS.text?.secondary ?? '#A1A1AA' },
  shieldBtn: { alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 12, padding: SPACING[2] ?? 8 },
  shieldEmoji: { fontSize: 20 },
  shieldCount: { fontSize: 12, color: COLORS.text?.secondary ?? '#A1A1AA', fontWeight: '700' },
  weekRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dayDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: '#2A2A2A' },
  dayDotActive: { backgroundColor: '#6366F1' },
})
