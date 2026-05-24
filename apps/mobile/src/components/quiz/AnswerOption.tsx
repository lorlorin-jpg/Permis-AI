import React, { useEffect } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS, RADIUS, SPACING, ANIMATIONS } from '@/constants/theme'

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
    bg: 'rgba(16, 185, 129, 0.15)',
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

  // Scale for press & state feedback
  const scale = useSharedValue(1)
  // Horizontal offset for wrong-answer shake
  const translateX = useSharedValue(0)
  // Label badge scale pulse on correct
  const labelScale = useSharedValue(1)

  useEffect(() => {
    if (state === 'correct') {
      // Satisfying spring pop → settle
      scale.value = withSpring(1.03, ANIMATIONS.springs.bouncy, () => {
        scale.value = withSpring(1, ANIMATIONS.springs.smooth)
      })
      // Label badge celebratory pulse
      labelScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 400 }),
        withSpring(1.0, ANIMATIONS.springs.smooth),
      )
    } else if (state === 'wrong') {
      // Shake left-right
      translateX.value = withSequence(
        withTiming(-8, { duration: 60, easing: Easing.linear }),
        withTiming(8,  { duration: 60, easing: Easing.linear }),
        withTiming(-6, { duration: 50, easing: Easing.linear }),
        withTiming(6,  { duration: 50, easing: Easing.linear }),
        withTiming(-3, { duration: 40, easing: Easing.linear }),
        withTiming(0,  { duration: 40, easing: Easing.linear }),
      )
      // Subtle compress
      scale.value = withSequence(
        withTiming(0.97, { duration: 80 }),
        withSpring(1, ANIMATIONS.springs.smooth),
      )
    }
  }, [state])

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    backgroundColor: config.bg,
    borderColor: config.border,
    borderWidth: state === 'default' ? 1.5 : 2,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  }))

  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: labelScale.value }],
  }))

  const handlePress = async () => {
    if (disabled) return
    // Press-down spring
    scale.value = withSpring(0.97, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 15 })
    })
    await Haptics.selectionAsync()
    onPress()
  }

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
        <Animated.View
          style={[
            {
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: config.labelBg,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            },
            animatedLabelStyle,
          ]}
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
        </Animated.View>

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

        {/* State Icon — correct */}
        {state === 'correct' && (
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: COLORS.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>
          </View>
        )}

        {/* State Icon — wrong */}
        {state === 'wrong' && (
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: COLORS.error,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✗</Text>
          </View>
        )}

        {/* State Icon — selected (not yet submitted) */}
        {state === 'selected' && (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: COLORS.primary,
              borderWidth: 3,
              borderColor: COLORS.primaryLight,
            }}
          />
        )}
      </View>
    </AnimatedTouchable>
  )
}

export default AnswerOption
