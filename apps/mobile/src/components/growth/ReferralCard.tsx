import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Share, Clipboard } from 'react-native'
import * as Haptics from 'expo-haptics'
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme'

interface ReferralCardProps {
  referralCode: string
  referralsCount: number
  rewardDescription?: string
}

export function ReferralCard({ referralCode, referralsCount, rewardDescription = '7 jours Premium offerts par parrainage' }: ReferralCardProps) {
  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    await Share.share({
      message: `🇨🇭 Prépare ton permis suisse avec l'IA ! Utilise mon code ${referralCode} et obtiens 7 jours Premium gratuits.\n\nTélécharge Permis AI sur l'App Store.`,
      title: 'Invite un ami sur Permis AI',
    })
  }

  function handleCopy() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Clipboard.setString(referralCode)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎁 Inviter des amis</Text>
        <Text style={styles.reward}>{rewardDescription}</Text>
      </View>

      <View style={styles.codeRow}>
        <Text style={styles.code}>{referralCode}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyText}>Copier</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>{referralsCount} ami{referralsCount > 1 ? 's' : ''} invité{referralsCount > 1 ? 's' : ''}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(referralsCount / 5 * 100, 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>5 parrainages = 1 mois Premium offert</Text>
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareBtnText}>📤 Partager mon code</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1A1A1A', borderRadius: BORDER_RADIUS?.xl ?? 16, padding: SPACING[4] ?? 16, gap: SPACING[3] ?? 12, borderWidth: 1, borderColor: '#2A2A2A' },
  header: { gap: 4 },
  title: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reward: { fontSize: 13, color: '#A1A1AA' },
  codeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#242424', borderRadius: 10, padding: 12, gap: 12 },
  code: { flex: 1, fontSize: 20, fontWeight: '800', color: '#6366F1', letterSpacing: 3 },
  copyBtn: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  copyText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  progress: { gap: 6 },
  progressText: { fontSize: 13, color: '#A1A1AA' },
  progressBar: { height: 6, backgroundColor: '#2A2A2A', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 99 },
  progressLabel: { fontSize: 11, color: '#71717A' },
  shareBtn: { backgroundColor: '#242424', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  shareBtnText: { color: '#fff', fontWeight: '600' },
})
