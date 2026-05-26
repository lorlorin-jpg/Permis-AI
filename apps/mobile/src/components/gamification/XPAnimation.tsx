import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet } from 'react-native'

interface XPAnimationProps {
  xp: number
  visible: boolean
  onComplete?: () => void
}

export function XPAnimation({ xp, visible, onComplete }: XPAnimationProps) {
  const translateY = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!visible) return
    translateY.setValue(0)
    opacity.setValue(1)
    Animated.parallel([
      Animated.timing(translateY, { toValue: -60, duration: 1200, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(onComplete)
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], opacity }]}
      pointerEvents="none"
    >
      <Text style={styles.text}>+{xp} XP</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 120,
    zIndex: 999,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 18 },
})
