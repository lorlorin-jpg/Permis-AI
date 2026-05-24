import React from 'react'
import { View, TouchableOpacity, ViewStyle } from 'react-native'
import { COLORS, RADIUS, SHADOWS, SPACING } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: ViewStyle
  borderRadius?: number
  onPress?: () => void
  activeOpacity?: number
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

// ============================================================
// STYLE MAPS
// ============================================================

const paddingMap: Record<NonNullable<CardProps['padding']>, number> = {
  none: 0,
  sm: SPACING.sm,
  md: SPACING.md,
  lg: SPACING.lg,
}

// ============================================================
// COMPONENT
// ============================================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  borderRadius = RADIUS.lg,
  onPress,
  activeOpacity = 0.8,
  shadow = 'none',
}) => {
  const backgroundColor =
    variant === 'elevated'
      ? COLORS.elevated
      : variant === 'ghost'
      ? 'transparent'
      : COLORS.card

  const borderStyle: ViewStyle =
    variant === 'outlined'
      ? { borderWidth: 1, borderColor: COLORS.border }
      : variant === 'default' || variant === 'elevated'
      ? { borderWidth: 1, borderColor: COLORS.border }
      : {}

  const shadowStyle = shadow !== 'none' ? SHADOWS[shadow] : {}

  const baseStyle: ViewStyle = {
    backgroundColor,
    borderRadius,
    padding: paddingMap[padding],
    ...borderStyle,
    ...shadowStyle,
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[baseStyle, style]}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <View style={[baseStyle, style]}>
      {children}
    </View>
  )
}

export default Card
