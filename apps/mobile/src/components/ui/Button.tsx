import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  label: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  haptic?: boolean
}

// ============================================================
// STYLE MAPS
// ============================================================

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: RADIUS.md },
    text: { fontSize: 14, fontWeight: '600' },
  },
  md: {
    container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: RADIUS.lg },
    text: { fontSize: 16, fontWeight: '600' },
  },
  lg: {
    container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: RADIUS.xl },
    text: { fontSize: 17, fontWeight: '700' },
  },
}

const variantTextColor: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: '#FFFFFF',
  ghost: COLORS.textSecondary,
  danger: '#FFFFFF',
  success: '#FFFFFF',
}

// ============================================================
// COMPONENT
// ============================================================

export const Button: React.FC<ButtonProps> = ({
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  label,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
}) => {
  const sizeStyle = sizeStyles[size]
  const isDisabled = disabled || loading

  const handlePress = async () => {
    if (isDisabled || !onPress) return
    if (haptic) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    onPress()
  }

  const containerStyle: ViewStyle = {
    ...sizeStyle.container,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: fullWidth ? 'stretch' : 'auto',
    opacity: isDisabled ? 0.5 : 1,
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
    ...(variant === 'secondary' && {
      backgroundColor: COLORS.secondary,
    }),
    ...(variant === 'danger' && {
      backgroundColor: COLORS.error,
    }),
    ...(variant === 'success' && {
      backgroundColor: COLORS.success,
    }),
    ...style,
  }

  const textColor = variantTextColor[variant]

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={{ alignSelf: fullWidth ? 'stretch' : 'auto', opacity: isDisabled ? 0.5 : 1 }}
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[sizeStyle.container, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, style]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              {leftIcon}
              <Text style={[sizeStyle.text, { color: '#FFFFFF' }, textStyle]}>{label}</Text>
              {rightIcon}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={containerStyle}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text style={[sizeStyle.text, { color: textColor }, textStyle]}>{label}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  )
}

export default Button
