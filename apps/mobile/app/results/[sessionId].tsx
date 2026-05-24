import React, { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { useSessionResult, useCreateSession } from '@api/sessions'
import { useQuizStore } from '@store/quiz.store'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { CATEGORIES } from '@/constants/categories'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Badge } from '@components/ui/Badge'

// ============================================================
// SCORE CIRCLE
// ============================================================

const ScoreCircle: React.FC<{ score: number; passed: boolean }> = ({ score, passed }) => {
  const percentage = Math.round(score * 100)
  const color = passed ? COLORS.success : COLORS.error
  const bg = passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'

  return (
    <View
      style={{
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: bg,
        borderWidth: 6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        gap: 4,
      }}
    >
      <Text style={{ color, fontSize: 44, fontWeight: '800' }}>{percentage}%</Text>
      <Text style={{ color, fontSize: 14, fontWeight: '600' }}>
        {passed ? 'Réussi ✓' : 'Échoué ✗'}
      </Text>
    </View>
  )
}

// ============================================================
// COMPONENT
// ============================================================

export default function ResultsScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const createSession = useCreateSession()
  const { setSession, setQuestions, reset } = useQuizStore()

  const { data: result, isLoading, error } = useSessionResult(sessionId ?? '')

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}min ${seconds}s`
  }

  const handleRetryWrong = useCallback(async () => {
    // Create a new practice session with weak categories
    try {
      const weakCategories = result?.categoryBreakdown
        ?.filter((c) => c.score < 0.8)
        ?.map((c) => c.category)

      const session = await createSession.mutateAsync({
        type: 'PRACTICE',
        questionCount: 10,
        ...(weakCategories?.length === 1 ? { category: weakCategories[0] } : {}),
      })
      setSession(session)
      setQuestions(session.questions)
      router.replace(`/quiz/${session.id}`)
    } catch {
      router.replace('/(tabs)')
    }
  }, [result, createSession, router])

  const handleNewExam = useCallback(async () => {
    try {
      const session = await createSession.mutateAsync({ type: 'EXAM', questionCount: 45 })
      setSession(session)
      setQuestions(session.questions)
      reset()
      router.replace(`/exam/${session.id}`)
    } catch {
      router.replace('/(tabs)/exam')
    }
  }, [createSession, router])

  const handleGoHome = useCallback(() => {
    reset()
    router.replace('/(tabs)')
  }, [reset, router])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACING.md,
        }}
      >
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={{ color: COLORS.textSecondary }}>Chargement des résultats...</Text>
      </View>
    )
  }

  if (error || !result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', gap: SPACING.md }}>
        <Feather name="alert-circle" size={48} color={COLORS.error} />
        <Text style={{ color: COLORS.textPrimary, fontSize: 17, fontWeight: '600' }}>
          Résultats indisponibles
        </Text>
        <TouchableOpacity onPress={handleGoHome}>
          <Text style={{ color: COLORS.primary }}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const weakCategories = result.categoryBreakdown?.filter((c) => c.score < 0.6) ?? []
  const strongCategories = result.categoryBreakdown?.filter((c) => c.score >= 0.8) ?? []

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <LinearGradient
            colors={
              result.passed
                ? ['rgba(16, 185, 129, 0.15)', 'transparent']
                : ['rgba(239, 68, 68, 0.12)', 'transparent']
            }
            style={{
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.lg,
              paddingBottom: SPACING.xl,
              alignItems: 'center',
              gap: SPACING.lg,
            }}
          >
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {result.passed ? '🎉 Félicitations !' : '📚 Continuez à réviser'}
            </Text>

            <Animated.View entering={FadeIn.delay(150).duration(500)}>
              <ScoreCircle score={result.score} passed={result.passed} />
            </Animated.View>

            {/* Summary */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={{
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.xl,
                padding: SPACING.md,
                width: '100%',
                borderWidth: 1,
                borderColor: COLORS.border,
                gap: SPACING.md,
              }}
            >
              <Text style={{ color: COLORS.textPrimary, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>
                {result.correctCount}/{result.totalQuestions} questions correctes
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Temps</Text>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' }}>
                    {formatTime(result.timeSpentMs)}
                  </Text>
                </View>
                <View
                  style={{ width: 1, backgroundColor: COLORS.border, height: '100%' }}
                />
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>XP gagnés</Text>
                  <Text style={{ color: COLORS.primary, fontSize: 15, fontWeight: '600' }}>
                    +{result.xpEarned} XP
                  </Text>
                </View>
                <View
                  style={{ width: 1, backgroundColor: COLORS.border, height: '100%' }}
                />
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Score min.</Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' }}>
                    80%
                  </Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* Category Breakdown */}
          {result.categoryBreakdown && result.categoryBreakdown.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
            >
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 17,
                  fontWeight: '700',
                  marginBottom: SPACING.md,
                }}
              >
                Résultats par catégorie
              </Text>

              <View style={{ gap: SPACING.sm }}>
                {result.categoryBreakdown.map((cat) => {
                  const catDef = CATEGORIES[cat.category]
                  const pct = Math.round(cat.score * 100)

                  return (
                    <View
                      key={cat.category}
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
                      {catDef && (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.md,
                            backgroundColor: `${catDef.color}22`,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Feather
                            name={catDef.icon as any}
                            size={16}
                            color={catDef.color}
                          />
                        </View>
                      )}

                      <View style={{ flex: 1, gap: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '500' }}>
                            {catDef?.label ?? cat.category}
                          </Text>
                          <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                            {cat.correct}/{cat.total}
                          </Text>
                        </View>
                        <ProgressBar
                          progress={cat.score}
                          height={5}
                          colors={
                            cat.score >= 0.8
                              ? [COLORS.success, COLORS.success]
                              : cat.score >= 0.6
                              ? [COLORS.warning, COLORS.warning]
                              : [COLORS.error, COLORS.error]
                          }
                        />
                      </View>

                      <Text
                        style={{
                          color:
                            cat.score >= 0.8
                              ? COLORS.success
                              : cat.score >= 0.6
                              ? COLORS.warning
                              : COLORS.error,
                          fontSize: 14,
                          fontWeight: '700',
                          minWidth: 36,
                          textAlign: 'right',
                        }}
                      >
                        {pct}%
                      </Text>
                    </View>
                  )
                })}
              </View>
            </Animated.View>
          )}

          {/* AI Analysis & Recommendations */}
          {weakCategories.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
            >
              <View
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: RADIUS.xl,
                  padding: SPACING.lg,
                  gap: SPACING.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Text style={{ fontSize: 20 }}>🧠</Text>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' }}>
                    Analyse IA
                  </Text>
                </View>

                <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 }}>
                  {result.passed
                    ? `Excellent travail ! Vous avez réussi avec ${Math.round(result.score * 100)}%. Continuez à pratiquer pour maintenir votre niveau.`
                    : `Vous avez besoin de renforcer certaines catégories. Concentrez-vous sur les domaines où votre score est inférieur à 60%.`}
                </Text>

                {/* Weak areas */}
                <View style={{ gap: SPACING.xs }}>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
                    À réviser en priorité :
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                    {weakCategories.map((cat) => {
                      const catDef = CATEGORIES[cat.category]
                      return (
                        <Badge
                          key={cat.category}
                          label={catDef?.label ?? cat.category}
                          variant="error"
                          size="sm"
                        />
                      )
                    })}
                  </View>
                </View>

                {strongCategories.length > 0 && (
                  <View style={{ gap: SPACING.xs }}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
                      Points forts :
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                      {strongCategories.map((cat) => {
                        const catDef = CATEGORIES[cat.category]
                        return (
                          <Badge
                            key={cat.category}
                            label={catDef?.label ?? cat.category}
                            variant="success"
                            size="sm"
                          />
                        )
                      })}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(400)}
            style={{ paddingHorizontal: SPACING.lg, gap: SPACING.sm }}
          >
            {/* Retry Weak Areas */}
            {weakCategories.length > 0 && (
              <TouchableOpacity
                onPress={handleRetryWrong}
                disabled={createSession.isPending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 54,
                    borderRadius: RADIUS.xl,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: SPACING.sm,
                    opacity: createSession.isPending ? 0.7 : 1,
                  }}
                >
                  <Feather name="refresh-cw" size={18} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                    Réviser les erreurs
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* New Exam */}
            <TouchableOpacity
              onPress={handleNewExam}
              disabled={createSession.isPending}
              activeOpacity={0.8}
              style={{
                height: 54,
                borderRadius: RADIUS.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.card,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
              }}
            >
              <Feather name="clipboard" size={18} color={COLORS.textSecondary} />
              <Text style={{ color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' }}>
                Nouvel examen
              </Text>
            </TouchableOpacity>

            {/* Go Home */}
            <TouchableOpacity
              onPress={handleGoHome}
              activeOpacity={0.7}
              style={{ alignItems: 'center', paddingVertical: SPACING.md }}
            >
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Retour à l'accueil</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
