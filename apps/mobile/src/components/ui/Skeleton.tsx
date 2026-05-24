import React, { useEffect, useRef } from 'react'
import { Animated, View, ViewStyle } from 'react-native'
import { COLORS } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

interface SkeletonGroupProps {
  children: React.ReactNode
  style?: ViewStyle
}

// ============================================================
// SKELETON PULSE
// ============================================================

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: COLORS.elevated,
          opacity,
        },
        style,
      ]}
    />
  )
}

// ============================================================
// SKELETON PRESETS
// ============================================================

/** A row of skeleton lines simulating text content */
export function SkeletonText({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '65%' : '100%'}
          borderRadius={4}
        />
      ))}
    </View>
  )
}

/** Full card skeleton — mirrors the shape of StatsCard / CategoryCard */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 16,
          gap: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
        },
        style,
      ]}
    >
      <Skeleton width={40} height={40} borderRadius={12} />
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="40%" />
    </View>
  )
}

/** Horizontal list of skeleton cards */
export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={{ width: '48%' }} />
      ))}
    </View>
  )
}

export default Skeleton
