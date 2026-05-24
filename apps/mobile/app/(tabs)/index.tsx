import React, { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@store/auth.store'
import { useUserProgress } from '@api/progress'
import { useCreateSession } from '@api/sessions'
import { useQuizStore } from '@store/quiz.store'
import { COLORS, SPACING, RADIUS, FONT_SIZE } from '@/constants/theme'
import { CATEGORY_LIST } from '@/constants/categories'
import { CategoryCard } from '@components/home/CategoryCard'
import { StatsCard } from '@components/home/StatsCard'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Badge } from '@components/ui/Badge'

// ============================================================
// DAILY XP GOAL
// ============================================================

const DAILY_XP_GOAL = 100

// ============================================================
// COMPONENT
// ============================================================

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: progress, isLoading, refetch, isRefetching } = useUserProgress()
  const createSession = useCreateSession()
  const { setSession, setQuestions } = useQuizStore()

  const firstName = user?.name?.split(' ')[0] ?? 'Conducteur'
  const streak = user?.streak ?? 0
  const totalXp = user?.xp ?? 0
  const accuracy = progress
    ? Math.round((progress.globalAccuracy ?? 0) * 100)
    : Math.round(((user?.totalCorrectAnswers ?? 0) / Math.max(user?.totalQuestionsAnswered ?? 1, 1)) * 100)

  // Daily XP progress (simplified - in production, track daily XP separately)
  const todayXp = Math.min(totalXp % DAILY_XP_GOAL, DAILY_XP_GOAL)
  const dailyProgress = todayXp / DAILY_XP_GOAL

  // Category progress map
  const categoryProgressMap: Record<string, number> = {}
  if (progress?.categoryProgress) {
    progress.categoryProgress.forEach((cp) => {
      categoryProgressMap[cp.category] = cp.masteryScore ?? 0
    })
  }

  const handleStartPractice = useCallback(async () => {
    try {
      const session = await createSession.mutateAsync({ type: 'PRACTICE', questionCount: 10 })
      setSession(session)
      setQuestions(session.questions)
      router.push(`/quiz/${session.id}`)
    } catch (e) {
      console.error('Failed to create session:', e)
    }
  }, [createSession, router])

  const handleCategoryPress = useCallback(
    async (categoryKey: string) => {
      try {
        const session = await createSession.mutateAsync({
          type: 'CATEGORY',
          category: categoryKey as any,
          questionCount: 10,
        })
        setSession(session)
        setQuestions(session.questions)
        router.push(`/quiz/${session.id}`)
      } catch (e) {
        console.error('Failed to create session:', e)
      }
    },
    [createSession, router],
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
            paddingBottom: SPACING.md,
          }}
        >
          <View>
            <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 2 }}>
              Bonjour,
            </Text>
            <Text style={{ color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' }}>
              {firstName} 👋
            </Text>
          </View>

          {/* Streak Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderRadius: RADIUS.full,
              paddingHorizontal: 12,
              paddingVertical: 6,
              gap: 4,
              borderWidth: 1,
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={{ color: '#F59E0B', fontSize: 15, fontWeight: '700' }}>{streak}</Text>
          </View>
        </View>

        {/* ── Daily XP Progress ── */}
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            gap: SPACING.sm,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>
              Objectif du jour
            </Text>
            <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '700' }}>
              {todayXp}/{DAILY_XP_GOAL} XP
            </Text>
          </View>
          <ProgressBar progress={dailyProgress} height={8} />
          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
            {dailyProgress >= 1
              ? '🎉 Objectif atteint !'
              : `Plus que ${DAILY_XP_GOAL - todayXp} XP pour atteindre votre objectif`}
          </Text>
        </View>

        {/* ── Streak Card ── */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.md,
            borderWidth: 1,
            borderColor: 'rgba(245, 158, 11, 0.25)',
          }}
        >
          <Text style={{ fontSize: 32 }}>🔥</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: '800' }}>
              {streak} jours consécutifs
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
              {streak > 0
                ? 'Continuez comme ça !'
                : 'Commencez votre série aujourd\'hui !'}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Quick Stats ── */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          <StatsCard
            icon="check-circle"
            iconColor={COLORS.success}
            label="Questions"
            value={user?.totalQuestionsAnswered ?? 0}
            sublabel="répondues"
          />
          <StatsCard
            icon="target"
            iconColor={COLORS.primary}
            label="Précision"
            value={`${accuracy}%`}
            sublabel="de bonnes réponses"
          />
          <StatsCard
            icon="award"
            iconColor={COLORS.warning}
            label="Niveau"
            value={`Niv. ${user?.level ?? 1}`}
            sublabel={`${user?.xp ?? 0} XP`}
          />
        </View>

        {/* ── Continuer l'apprentissage ── */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 17,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Continuer l'apprentissage
          </Text>

          <TouchableOpacity
            onPress={handleStartPractice}
            activeOpacity={0.8}
            disabled={createSession.isPending}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: RADIUS.xl,
                padding: SPACING.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.md,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="play" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  {createSession.isPending ? 'Préparation...' : 'Session rapide'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                  10 questions · Adapté à votre niveau
                </Text>
              </View>
              <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Daily Challenge ── */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              borderWidth: 1,
              borderColor: 'rgba(236, 72, 153, 0.3)',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 22 }}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 }}>
                <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' }}>
                  Défi du jour
                </Text>
                <Badge label="Nouveau" variant="custom" backgroundColor="rgba(236, 72, 153, 0.15)" color="#F472B6" size="xs" />
              </View>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                5 questions · Bonus XP ×2
              </Text>
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: RADIUS.full,
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(236, 72, 153, 0.3)',
              }}
            >
              <Text style={{ color: '#EC4899', fontSize: 13, fontWeight: '600' }}>Jouer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Categories Grid ── */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 17,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Catégories
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
            {CATEGORY_LIST.map((cat) => (
              <View key={cat.key} style={{ width: '48%' }}>
                <CategoryCard
                  category={cat}
                  progress={categoryProgressMap[cat.key] ?? 0}
                  onPress={() => handleCategoryPress(cat.key)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
