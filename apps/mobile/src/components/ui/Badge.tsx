import React from 'react'
import { View, Text, ViewStyle, TextStyle } from 'react-native'
import { COLORS, RADIUS } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'custom'
export type BadgeSize = 'xs' | 'sm' | 'md'

export interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
  color?: string // for 'custom' variant
  backgroundColor?: string // for 'custom' variant
  style?: ViewStyle
  textStyle?: TextStyle
  leftIcon?: React.ReactNode
  dot?: boolean
}

// ============================================================
// STYLE MAPS
// ============================================================

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8' },
  secondary: { bg: 'rgba(139, 92, 246, 0.2)', text: '#A78BFA' },
  success: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34D399' },
  warning: { bg: 'rgba(245, 158, 11, 0.2)', text: '#FCD34D' },
  error: { bg: 'rgba(239, 68, 68, 0.2)', text: '#FCA5A5' },
  muted: { bg: COLORS.elevated, text: COLORS.textMuted },
  custom: { bg: 'transparent', text: COLORS.textPrimary },
}

const sizeStyles: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number; radius: number }> = {
  xs: { paddingH: 6, paddingV: 2, fontSize: 10, radius: RADIUS.sm },
  sm: { paddingH: 8, paddingV: 3, fontSize: 11, radius: RADIUS.sm },
  md: { paddingH: 10, paddingV: 4, fontSize: 12, radius: RADIUS.md },
}

// ============================================================
// COMPONENT
// ============================================================

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  color,
  backgroundColor,
  style,
  textStyle,
  leftIcon,
  dot = false,
}) => {
  const variantStyle = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  const bgColor = backgroundColor ?? variantStyle.bg
  const textColor = color ?? variantStyle.text

  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: sizeStyle.radius,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: textColor,
          }}
        />
      )}
      {leftIcon}
      <Text
        style={[
          {
            color: textColor,
            fontSize: sizeStyle.fontSize,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  )
}

export default Badge
