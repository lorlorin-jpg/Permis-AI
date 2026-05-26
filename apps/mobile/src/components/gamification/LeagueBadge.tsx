import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { type League } from '@store/gamification.store'

const LEAGUE_CONFIG: Record<League, { emoji: string; label: string; color: string; bg: string }> = {
  BRONZE:   { emoji: '🥉', label: 'Bronze',   color: '#CD7F32', bg: 'rgba(205,127,50,0.15)' },
  SILVER:   { emoji: '🥈', label: 'Argent',   color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)' },
  GOLD:     { emoji: '🥇', label: 'Or',        color: '#FFD700', bg: 'rgba(255,215,0,0.15)' },
  PLATINUM: { emoji: '💎', label: 'Platine',  color: '#00CED1', bg: 'rgba(0,206,209,0.15)' },
  DIAMOND:  { emoji: '💠', label: 'Diamant',  color: '#6366F1', bg: 'rgba(99,102,241,0.15)' },
}

export function LeagueBadge({ league, size = 'md' }: { league: League; size?: 'sm' | 'md' | 'lg' }) {
  const config = LEAGUE_CONFIG[league]
  const isLg = size === 'lg'
  const isSm = size === 'sm'

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isSm && styles.sm, isLg && styles.lg]}>
      <Text style={[styles.emoji, isSm && { fontSize: 12 }, isLg && { fontSize: 24 }]}>
        {config.emoji}
      </Text>
      <Text style={[styles.label, { color: config.color }, isSm && { fontSize: 10 }, isLg && { fontSize: 16 }]}>
        {config.label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  lg: { paddingHorizontal: 16, paddingVertical: 8 },
  emoji: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '700' },
})
