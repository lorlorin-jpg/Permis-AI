import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'

interface PulseRingProps {
  color?: string
  size?: number
  pulseSize?: number
}

export function PulseRing({ color = '#6366F1', size = 80, pulseSize = 120 }: PulseRingProps) {
  const scale = useRef(new Animated.Value(1)).current
  const opacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: pulseSize / size, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 2 },
})
