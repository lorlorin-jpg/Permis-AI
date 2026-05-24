import React, { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@store/auth.store'
import { useCreateSession, useSessionHistory } from '@api/sessions'
import { useQuizStore } from '@store/quiz.store'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { Badge } from '@components/ui/Badge'
import { Skeleton } from '@components/ui/Skeleton'
import * as Haptics from 'expo-haptics'

// ============================================================
// EXAM INFO CARDS
// ============================================================

const EXAM_RULES = [
  { icon: 'help-circle' as const, label: '45 questions', sublabel: 'Questions officielles' },
  { icon: 'clock' as const, label: '45 minutes', sublabel: 'Durée maximale' },
  { icon: 'percent' as const, label: '80% pour réussir', sublabel: 'Minimum 36/45' },
]

// ============================================================
// COMPONENT
// ============================================================

export default function ExamScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isPremium = useAuthStore((s) => s.isPremium())
  const createSession = useCreateSession()
  const { setSession, setQuestions } = useQuizStore()
  const { data: history, isLoading } = useSessionHistory()

  const examHistory = history?.filter((s) => s.type === 'EXAM').slice(0, 5) ?? []

  const handleStartExam = useCallback(async () => {
    Alert.alert(
      'Mode Examen Officiel',
      'Vous serez dans les conditions réelles. Pas de corrections en cours d\'examen. Prêt ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commencer',
          style: 'default',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              const session = await createSession.mutateAsync({
                type: 'EXAM',
                questionCount: 45,
              })
              setSession(session)
              setQuestions(session.questions)
              router.push(`/exam/${session.id}`)
            } catch (e) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
              Alert.alert('Erreur', 'Impossible de démarrer l\'examen. Vérifiez votre connexion.')
            }
          },
        },
      ],
    )
  }, [createSession, router])

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatScore = (score: number | null) => {
    if (score === null) return '—'
    return `${Math.round(score * 100)}%`
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.15)', 'transparent']}
          style={{
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
            paddingBottom: SPACING.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: RADIUS.md,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="clipboard" size={18} color={COLORS.primary} />
            </View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' }}>
              Mode Examen Officiel
            </Text>
          </View>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Simulez les conditions réelles de l'examen théorique suisse
          </Text>
        </LinearGradient>

        {/* Exam Rules */}
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.xl,
            gap: SPACING.sm,
          }}
        >
          {EXAM_RULES.map((rule) => (
            <View
              key={rule.label}
              style={{
                flex: 1,
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
                alignItems: 'center',
                gap: SPACING.xs,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.md,
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name={rule.icon} size={16} color={COLORS.primary} />
              </View>
              <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
                {rule.label}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 10, textAlign: 'center' }}>
                {rule.sublabel}
              </Text>
            </View>
          ))}
        </View>

        {/* Tips Card */}
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.xl,
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            gap: SPACING.sm,
          }}
        >
          <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>
            💡 Conseils pour l'examen
          </Text>
          {[
            'Lisez attentivement chaque question',
            'Ne revenez pas en arrière (comme l\'examen réel)',
            'Gérez votre temps (1 min par question)',
            'Faites confiance à votre premier instinct',
          ].map((tip) => (
            <View key={tip} style={{ flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' }}>
              <Text style={{ color: COLORS.primary, fontSize: 14, marginTop: 1 }}>•</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 }}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
          <TouchableOpacity
            onPress={handleStartExam}
            disabled={createSession.isPending}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 60,
                borderRadius: RADIUS.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.md,
                opacity: createSession.isPending ? 0.7 : 1,
              }}
            >
              <Feather name="play" size={22} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                {createSession.isPending ? 'Préparation...' : 'Commencer l\'examen'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Premium Feature (if free user) */}
        {!isPremium && (
          <View
            style={{
              marginHorizontal: SPACING.lg,
              marginBottom: SPACING.xl,
              borderRadius: RADIUS.xl,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: SPACING.lg,
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.3)',
                borderRadius: RADIUS.xl,
                gap: SPACING.md,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Text style={{ fontSize: 22 }}>⭐</Text>
                <Text style={{ color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' }}>
                  Débloquer Premium
                </Text>
              </View>
              <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 }}>
                Accédez à des examens illimités, des analyses IA avancées et des statistiques détaillées.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: RADIUS.lg,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(139, 92, 246, 0.5)',
                }}
              >
                <Text style={{ color: '#A78BFA', fontSize: 15, fontWeight: '700' }}>
                  Voir les offres →
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Past Exams */}
        {(isLoading || examHistory.length > 0) && (
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <Text
              style={{
                color: COLORS.textPrimary,
                fontSize: 17,
                fontWeight: '700',
                marginBottom: SPACING.md,
              }}
            >
              Examens récents
            </Text>

            <View style={{ gap: SPACING.sm }}>
              {isLoading && [0, 1, 2].map((i) => (
                <Skeleton key={i} height={68} borderRadius={12} />
              ))}
              {!isLoading && examHistory.map((exam) => (
                <TouchableOpacity
                  key={exam.id}
                  onPress={() => router.push(`/results/${exam.id}`)}
                  activeOpacity={0.8}
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
                  {/* Pass/Fail indicator */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: exam.passed
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather
                      name={exam.passed ? 'check' : 'x'}
                      size={20}
                      color={exam.passed ? COLORS.success : COLORS.error}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' }}>
                      {formatScore(exam.score)} — {exam.passed ? 'Réussi' : 'Échoué'}
                    </Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
                      {exam.correctCount}/{exam.totalQuestions} correctes ·{' '}
                      {formatDate(exam.startedAt)}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
