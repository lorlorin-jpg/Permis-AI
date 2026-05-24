import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@store/auth.store'
import { useUserProgress } from '@api/progress'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { CATEGORY_LIST } from '@/constants/categories'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Badge } from '@components/ui/Badge'

// ============================================================
// SAMPLE BADGES
// ============================================================

const SAMPLE_BADGES = [
  { id: '1', icon: '🔥', name: 'En feu', description: '7 jours consécutifs', earned: true },
  { id: '2', icon: '🎯', name: 'Précis', description: '90% de précision', earned: true },
  { id: '3', icon: '⚡', name: 'Rapide', description: 'Répond en < 5s', earned: false },
  { id: '4', icon: '🏆', name: 'Champion', description: 'Examen réussi', earned: false },
  { id: '5', icon: '📚', name: 'Assidu', description: '100 questions', earned: true },
  { id: '6', icon: '🌟', name: 'Expert', description: 'Niveau 10', earned: false },
]

// ============================================================
// COMPONENT
// ============================================================

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const isPremium = useAuthStore((s) => s.isPremium())
  const { data: progress } = useUserProgress()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  const xpForNextLevel = (user?.level ?? 1) * 500
  const xpProgress = (user?.xp ?? 0) % xpForNextLevel
  const xpProgressRatio = xpProgress / xpForNextLevel

  const totalAnswered = user?.totalQuestionsAnswered ?? 0
  const totalCorrect = user?.totalCorrectAnswers ?? 0
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const streak = user?.streak ?? 0
  const longestStreak = user?.longestStreak ?? 0

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const categoryProgressMap: Record<string, number> = {}
  if (progress?.categoryProgress) {
    progress.categoryProgress.forEach((cp) => {
      categoryProgressMap[cp.category] = cp.masteryScore ?? 0
    })
  }

  const handleLogout = useCallback(() => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => {
          logout()
          router.replace('/(auth)')
        },
      },
    ])
  }, [logout, router])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' }}>Profil</Text>
        </View>

        {/* Avatar + Info */}
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.lg,
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.xl,
            padding: SPACING.lg,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md }}>
            {/* Avatar */}
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
                {initials}
              </Text>
            </LinearGradient>

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' }}>
                {user?.name ?? 'Conducteur'}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{user?.email}</Text>
              <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: 2 }}>
                <Badge
                  label={isPremium ? 'Premium ⭐' : 'Gratuit'}
                  variant={isPremium ? 'secondary' : 'muted'}
                  size="xs"
                />
                <Badge
                  label={`Niveau ${user?.level ?? 1}`}
                  variant="primary"
                  size="xs"
                />
              </View>
            </View>
          </View>

          {/* XP Progress */}
          <View style={{ gap: SPACING.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' }}>
                Progression Niveau {user?.level ?? 1}
              </Text>
              <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '600' }}>
                {xpProgress}/{xpForNextLevel} XP
              </Text>
            </View>
            <ProgressBar progress={xpProgressRatio} height={6} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Statistiques
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {[
              {
                icon: 'check-circle' as const,
                color: COLORS.success,
                value: totalAnswered,
                label: 'Questions',
              },
              {
                icon: 'target' as const,
                color: COLORS.primary,
                value: `${accuracy}%`,
                label: 'Précision',
              },
              {
                icon: 'zap' as const,
                color: COLORS.warning,
                value: streak,
                label: 'Série actuelle',
              },
              {
                icon: 'award' as const,
                color: COLORS.accent,
                value: longestStreak,
                label: 'Meilleure série',
              },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  width: '48%',
                  backgroundColor: COLORS.card,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  gap: SPACING.sm,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: RADIUS.md,
                    backgroundColor: `${stat.color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' }}>
                  {stat.value}
                </Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Badges
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {SAMPLE_BADGES.map((badge) => (
              <View
                key={badge.id}
                style={{
                  width: 90,
                  alignItems: 'center',
                  gap: SPACING.xs,
                  opacity: badge.earned ? 1 : 0.35,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: badge.earned ? COLORS.elevated : COLORS.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: badge.earned ? 'rgba(99, 102, 241, 0.3)' : COLORS.border,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{badge.icon}</Text>
                </View>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 10,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {badge.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Progress */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Maîtrise par catégorie
          </Text>
          <View style={{ gap: SPACING.sm }}>
            {CATEGORY_LIST.map((cat) => {
              const catProgress = categoryProgressMap[cat.key] ?? 0
              const pct = Math.round(catProgress * 100)

              return (
                <View
                  key={cat.key}
                  style={{
                    backgroundColor: COLORS.card,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${cat.color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Feather name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '500' }}>
                        {cat.label}
                      </Text>
                      <Text style={{ color: cat.color, fontSize: 12, fontWeight: '700' }}>
                        {pct}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={catProgress}
                      height={4}
                      colors={[cat.color, cat.color]}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Premium Upgrade (if free) */}
        {!isPremium && (
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: RADIUS.xl,
                padding: SPACING.lg,
                gap: SPACING.md,
                borderWidth: 1,
                borderColor: 'rgba(99, 102, 241, 0.3)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Text style={{ fontSize: 24 }}>⭐</Text>
                <Text style={{ color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' }}>
                  Passez à Premium
                </Text>
              </View>
              <View style={{ gap: SPACING.xs }}>
                {[
                  'Examens illimités',
                  'Coach IA sans limite',
                  'Analyses avancées',
                  'Mode hors ligne',
                ].map((feat) => (
                  <View key={feat} style={{ flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' }}>
                    <Feather name="check" size={14} color={COLORS.success} />
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{feat}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity activeOpacity={0.85}>
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 48,
                    borderRadius: RADIUS.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                    Voir les offres — dès 4.90 CHF/mois
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Settings */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Paramètres
          </Text>

          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: 'hidden',
            }}
          >
            {/* Notifications */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.md,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.sm,
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Feather name="bell" size={17} color={COLORS.primary} />
              </View>
              <Text style={{ flex: 1, color: COLORS.textPrimary, fontSize: 15 }}>
                Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: COLORS.primary, false: COLORS.elevated }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Language */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.md,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.sm,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Feather name="globe" size={17} color={COLORS.success} />
              </View>
              <Text style={{ flex: 1, color: COLORS.textPrimary, fontSize: 15 }}>Langue</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 14, marginRight: SPACING.sm }}>
                Français
              </Text>
              <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.md,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.sm,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: SPACING.md,
                }}
              >
                <Feather name="log-out" size={17} color={COLORS.error} />
              </View>
              <Text style={{ flex: 1, color: COLORS.error, fontSize: 15, fontWeight: '500' }}>
                Déconnexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <Text style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>
          Permis AI · Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
