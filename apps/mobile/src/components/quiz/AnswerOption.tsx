import React, { useEffect } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export type AnswerState = 'default' | 'selected' | 'correct' | 'wrong'

export interface AnswerOptionProps {
  label: string // A, B, C, D
  text: string
  state: AnswerState
  onPress: () => void
  disabled?: boolean
  index?: number
}

// ============================================================
// STATE COLORS
// ============================================================

const stateConfig: Record<AnswerState, { bg: string; border: string; labelBg: string; textColor: string }> = {
  default: {
    bg: COLORS.card,
    border: COLORS.border,
    labelBg: COLORS.elevated,
    textColor: COLORS.textPrimary,
  },
  selected: {
    bg: 'rgba(99, 102, 241, 0.12)',
    border: COLORS.primary,
    labelBg: COLORS.primary,
    textColor: COLORS.textPrimary,
  },
  correct: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: COLORS.success,
    labelBg: COLORS.success,
    textColor: COLORS.textPrimary,
  },
  wrong: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: COLORS.error,
    labelBg: COLORS.error,
    textColor: COLORS.textPrimary,
  },
}

// ============================================================
// COMPONENT
// ============================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  label,
  text,
  state,
  onPress,
  disabled = false,
  index = 0,
}) => {
  const config = stateConfig[state]

  // Scale animation for press feedback
  const scale = useSharedValue(1)

  // Color animations
  const borderOpacity = useSharedValue(0)
  const bgOpacity = useSharedValue(0)

  useEffect(() => {
    const targetOpacity = state !== 'default' ? 1 : 0
    borderOpacity.value = withTiming(targetOpacity, { duration: 250, easing: Easing.out(Easing.ease) })
    bgOpacity.value = withTiming(targetOpacity, { duration: 250, easing: Easing.out(Easing.ease) })

    if (state === 'correct') {
      scale.value = withSpring(1.02, { damping: 10, stiffness: 200 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 })
      })
    } else if (state === 'wrong') {
      // Subtle shake
      scale.value = withSpring(0.98, { damping: 10, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 })
      })
    }
  }, [state])

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: config.bg,
    borderColor: config.border,
    borderWidth: 1.5,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  }))

  const handlePress = async () => {
    if (disabled) return
    scale.value = withSpring(0.97, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 15 })
    })
    await Haptics.selectionAsync()
    onPress()
  }

  const labelBgColor = config.labelBg

  return (
    <AnimatedTouchable
      style={animatedContainerStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: SPACING.md,
          gap: SPACING.md,
        }}
      >
        {/* Label Badge */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: labelBgColor,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              color: state === 'default' ? COLORS.textSecondary : '#FFFFFF',
              fontSize: 13,
              fontWeight: '700',
            }}
          >
            {label}
          </Text>
        </View>

        {/* Answer Text */}
        <Text
          style={{
            flex: 1,
            color: config.textColor,
            fontSize: 15,
            lineHeight: 22,
            fontWeight: state !== 'default' ? '500' : '400',
          }}
        >
          {text}
        </Text>

        {/* State Icon */}
        {state === 'correct' && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: COLORS.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
          </View>
        )}
        {state === 'wrong' && (
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: COLORS.error,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✗</Text>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  )
}

export default AnswerOption
