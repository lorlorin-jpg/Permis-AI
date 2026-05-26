import React, { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme'

interface ShareScoreCardProps {
  score: number          // 0-100
  correctAnswers: number
  totalQuestions: number
  category?: string
  streak?: number
}

export function ShareScoreCard({
  score,
  correctAnswers,
  totalQuestions,
  category,
  streak,
}: ShareScoreCardProps) {
  const isPassed = score >= 80
  const emoji = score >= 95 ? '🏆' : score >= 80 ? '✅' : score >= 60 ? '📚' : '💪'

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    const message = isPassed
      ? `${emoji} J'ai réussi l'examen théorie suisse avec ${score}% ! (${correctAnswers}/${totalQuestions})${streak ? `\n🔥 Série de ${streak} jours` : ''}\n\nPrépare ton permis avec Permis AI 🇨🇭`
      : `💪 Je m'entraîne pour le permis suisse : ${score}% aujourd'hui (${correctAnswers}/${totalQuestions})\n\nObjectif 80% avec Permis AI 🇨🇭`

    try {
      await Share.share({ message, title: 'Permis AI — Mon score' })
    } catch {}
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isPassed ? ['#10B981', '#059669'] : ['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.scoreText}>{score}%</Text>
        <Text style={styles.resultText}>
          {isPassed ? 'Examen réussi !' : `${correctAnswers}/${totalQuestions} correctes`}
        </Text>
        {category && <Text style={styles.category}>{category}</Text>}
      </LinearGradient>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.shareBtnText}>📤 Partager mon score</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: SPACING[3] ?? 12 },
  gradient: {
    borderRadius: BORDER_RADIUS?.xl ?? 16,
    padding: SPACING[5] ?? 20,
    alignItems: 'center',
    gap: SPACING[2] ?? 8,
  },
  emoji: { fontSize: 40 },
  scoreText: { fontSize: 48, fontWeight: '800', color: '#fff' },
  resultText: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  category: { fontSize: 14, color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  shareBtn: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS?.lg ?? 12,
    padding: SPACING[4] ?? 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  shareBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
})
