import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: ViewStyle
  borderRadius?: number
}

// ============================================================
// COMPONENT
// ============================================================

const paddingMap = {
  none: 0,
  sm: SPACING.sm,
  md: SPACING.md,
  lg: SPACING.lg,
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  borderRadius = RADIUS.lg,
}) => {
  const backgroundColor =
    variant === 'elevated'
      ? COLORS.elevated
      : COLORS.card

  const borderStyle: ViewStyle =
    variant === 'outlined'
      ? { borderWidth: 1, borderColor: COLORS.border }
      : {}

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius,
          padding: paddingMap[padding],
          ...borderStyle,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export default Card
