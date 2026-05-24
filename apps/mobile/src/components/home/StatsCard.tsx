import React from 'react'
import { View, Text, ViewStyle } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export interface StatsCardProps {
  icon: string
  iconColor?: string
  label: string
  value: string | number
  sublabel?: string
  trend?: 'up' | 'down' | 'neutral'
  style?: ViewStyle
}

// ============================================================
// COMPONENT
// ============================================================

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  iconColor = COLORS.primary,
  label,
  value,
  sublabel,
  trend,
  style,
}) => {
  const trendColor =
    trend === 'up' ? COLORS.success : trend === 'down' ? COLORS.error : COLORS.textMuted

  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: RADIUS.lg,
          padding: SPACING.md,
          flex: 1,
          borderWidth: 1,
          borderColor: COLORS.border,
          gap: SPACING.sm,
        },
        style,
      ]}
    >
      {/* Icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: RADIUS.md,
          backgroundColor: `${iconColor}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>

      {/* Value */}
      <Text
        style={{
          color: COLORS.textPrimary,
          fontSize: 22,
          fontWeight: '700',
        }}
      >
        {value}
      </Text>

      {/* Label */}
      <View style={{ gap: 2 }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{ color: trendColor, fontSize: 11 }}>
            {trend === 'up' && '↑ '}
            {trend === 'down' && '↓ '}
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  )
}

export default StatsCard
