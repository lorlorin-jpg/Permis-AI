import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

interface EmptyStateProps {
  icon: string // emoji
  title: string
  subtitle?: string
  action?: React.ReactNode
}

// ============================================================
// COMPONENT
// ============================================================

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[6],
    gap: SPACING[3],
  },
  icon: {
    fontSize: 48,
    lineHeight: 56,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: SPACING[2],
  },
})

export default EmptyState
