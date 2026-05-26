import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme'

interface PremiumUpsellCardProps {
  trigger: 'ai_limit' | 'exam_limit' | 'feature_locked' | 'general'
  onUpgrade: () => void
  onDismiss?: () => void
  freeUsed?: number
  freeTotal?: number
}

const TRIGGER_CONTENT = {
  ai_limit: {
    emoji: '🤖',
    headline: "L'IA vous attend",
    sub: "Vous avez utilisé vos 5 explications gratuites aujourd'hui.",
    urgency: "Débloquez des explications illimitées",
  },
  exam_limit: {
    emoji: '📋',
    headline: "Plus d'examens disponibles",
    sub: "Vous avez passé vos 2 examens gratuits du jour.",
    urgency: "Passez des examens illimités avec Premium",
  },
  feature_locked: {
    emoji: '🔒',
    headline: "Fonctionnalité Premium",
    sub: "Cette fonctionnalité est réservée aux abonnés.",
    urgency: "Déverrouillez tout le potentiel de l'app",
  },
  general: {
    emoji: '⚡',
    headline: "Passez Premium",
    sub: "Accélérez votre apprentissage avec l'IA illimitée.",
    urgency: "Les utilisateurs Premium réussissent 2× plus vite",
  },
}

export function PremiumUpsellCard({ trigger, onUpgrade, onDismiss, freeUsed, freeTotal }: PremiumUpsellCardProps) {
  const content = TRIGGER_CONTENT[trigger]
  const shakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Subtle attention-grabbing shake
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(shakeAnim, { toValue: 3, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{content.emoji}</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
        </View>

        {/* Copy */}
        <Text style={styles.headline}>{content.headline}</Text>
        <Text style={styles.sub}>{content.sub}</Text>

        {/* Social proof */}
        <View style={styles.proof}>
          <Text style={styles.proofText}>⭐️ {content.urgency}</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {['🤖 IA illimitée', '📋 Examens illimités', '📊 Analyse détaillée', '🎯 Coaching personnalisé'].map(f => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            onUpgrade()
          }}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Passer Premium — 4.99 CHF/mois</Text>
          </LinearGradient>
        </TouchableOpacity>

        {onDismiss && (
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.dismiss}>Pas maintenant</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { borderRadius: BORDER_RADIUS?.xl ?? 16, overflow: 'hidden' },
  gradient: { padding: SPACING[5] ?? 20, gap: SPACING[3] ?? 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emoji: { fontSize: 32 },
  premiumBadge: { backgroundColor: 'rgba(99,102,241,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1, borderColor: '#6366F1' },
  premiumBadgeText: { color: '#6366F1', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  headline: { fontSize: 22, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  proof: { backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 8, padding: 10 },
  proofText: { color: '#A5B4FC', fontSize: 13, fontWeight: '600' },
  features: { gap: 6 },
  feature: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  ctaBtn: { borderRadius: BORDER_RADIUS?.lg ?? 12, overflow: 'hidden', marginTop: 4 },
  ctaGradient: { padding: 16, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dismiss: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', marginTop: 4 },
})
