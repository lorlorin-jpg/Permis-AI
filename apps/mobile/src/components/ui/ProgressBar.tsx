import React, { useEffect } from 'react'
import { View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, RADIUS } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export interface ProgressBarProps {
  progress: number // 0 to 1
  height?: number
  colors?: [string, string]
  backgroundColor?: string
  style?: ViewStyle
  animated?: boolean
  duration?: number
  borderRadius?: number
}

// ============================================================
// COMPONENT
// ============================================================

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 6,
  colors = ['#6366F1', '#8B5CF6'],
  backgroundColor = COLORS.border,
  style,
  animated = true,
  duration = 500,
  borderRadius = RADIUS.full,
}) => {
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const widthAnim = useSharedValue(animated ? 0 : clampedProgress)

  useEffect(() => {
    if (animated) {
      widthAnim.value = withTiming(clampedProgress, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    } else {
      widthAnim.value = clampedProgress
    }
  }, [clampedProgress, animated, duration])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
  }))

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[{ height: '100%' }, animatedStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius }}
        />
      </Animated.View>
    </View>
  )
}

export default ProgressBar
