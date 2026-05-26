import React, { useEffect, useRef } from 'react'
import { Animated, View, Text, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { PulseRing } from '@components/ui/PulseRing'

interface CelebrationProps {
  visible: boolean
  xp: number
  isStreak?: boolean
}

export function CorrectAnswerCelebration({ visible, xp, isStreak }: CelebrationProps) {
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1500),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { transform: [{ scale }], opacity }]}
    >
      <PulseRing color="#10B981" size={60} pulseSize={100} />
      <View style={styles.bubble}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.xp}>+{xp} XP</Text>
        {isStreak && <Text style={styles.streak}>🔥 Série !</Text>}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 180, alignSelf: 'center', alignItems: 'center', zIndex: 999 },
  bubble: { backgroundColor: 'rgba(16, 185, 129, 0.95)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99, alignItems: 'center', gap: 2 },
  check: { fontSize: 20, color: '#fff', fontWeight: '800' },
  xp: { fontSize: 16, color: '#fff', fontWeight: '800' },
  streak: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
})
