import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { useGamificationStore } from '@store/gamification.store'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme'

export function DailyGoalCard() {
  const { dailyGoal, todayXPEarned, currentLeague } = useGamificationStore()
  const progress = Math.min(dailyGoal.completed / dailyGoal.target, 1)
  const widthAnim = useRef(new Animated.Value(0)).current
  const isComplete = progress >= 1

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start()
    if (isComplete) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [progress])

  const leagueEmoji: Record<string, string> = {
    BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎', DIAMOND: '💠'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Objectif du jour</Text>
          <Text style={styles.subtitle}>
            {dailyGoal.completed}/{dailyGoal.target} questions
          </Text>
        </View>
        <View style={styles.leagueRow}>
          <Text style={styles.leagueEmoji}>{leagueEmoji[currentLeague]}</Text>
          <Text style={styles.xpText}>+{todayXPEarned} XP</Text>
        </View>
      </View>

      <View style={styles.progressBg}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={isComplete ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {isComplete && (
        <Text style={styles.completeText}>🎉 Objectif atteint !</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface?.elevated ?? '#242424',
    borderRadius: BORDER_RADIUS?.lg ?? 12,
    padding: SPACING[4] ?? 16,
    gap: SPACING[3] ?? 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: TYPOGRAPHY?.fontSizes?.md ?? 16, fontWeight: '600', color: COLORS.text?.primary ?? '#fff' },
  subtitle: { fontSize: TYPOGRAPHY?.fontSizes?.sm ?? 14, color: COLORS.text?.secondary ?? '#A1A1AA', marginTop: 2 },
  leagueRow: { alignItems: 'flex-end', gap: 4 },
  leagueEmoji: { fontSize: 20 },
  xpText: { fontSize: TYPOGRAPHY?.fontSizes?.sm ?? 14, color: '#6366F1', fontWeight: '700' },
  progressBg: { height: 10, backgroundColor: '#2A2A2A', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, overflow: 'hidden' },
  completeText: { fontSize: TYPOGRAPHY?.fontSizes?.sm ?? 14, color: '#10B981', fontWeight: '600', textAlign: 'center' },
})
