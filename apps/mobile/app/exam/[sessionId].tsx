import React, { useEffect, useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useQuizStore } from '@store/quiz.store'
import { useSubmitAnswer, useCompleteSession } from '@api/sessions'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { QuestionCard } from '@components/quiz/QuestionCard'
import { AnswerOption } from '@components/quiz/AnswerOption'
import { ProgressBar } from '@components/ui/ProgressBar'

// ============================================================
// CONSTANTS
// ============================================================

const EXAM_DURATION_SECONDS = 45 * 60 // 45 minutes
const ANSWER_LABELS = ['A', 'B', 'C', 'D']

// ============================================================
// TIMER COMPONENT
// ============================================================

const Timer: React.FC<{ seconds: number }> = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const isWarning = seconds < 5 * 60 // Less than 5 min
  const isDanger = seconds < 2 * 60 // Less than 2 min

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: isDanger
          ? 'rgba(239, 68, 68, 0.15)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(99, 102, 241, 0.12)',
        borderRadius: RADIUS.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: isDanger
          ? 'rgba(239, 68, 68, 0.3)'
          : isWarning
          ? 'rgba(245, 158, 11, 0.3)'
          : 'transparent',
      }}
    >
      <Feather
        name="clock"
        size={13}
        color={isDanger ? COLORS.error : isWarning ? COLORS.warning : '#818CF8'}
      />
      <Text
        style={{
          color: isDanger ? COLORS.error : isWarning ? COLORS.warning : '#818CF8',
          fontSize: 14,
          fontWeight: '700',
          fontVariant: ['tabular-nums'],
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </Text>
    </View>
  )
}

// ============================================================
// COMPONENT
// ============================================================

export default function ExamSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const submitAnswerMutation = useSubmitAnswer()
  const completeSessionMutation = useCompleteSession()

  const {
    questions,
    currentQuestionIndex,
    selectedAnswerId,
    timeRemaining,
    isSessionComplete,
    selectAnswer,
    nextQuestion,
    setTimeRemaining,
    decrementTimer,
    completeSession,
    reset,
    getCurrentQuestion,
    getProgress,
  } = useQuizStore()

  const question = getCurrentQuestion()
  const progress = getProgress()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize timer
  useEffect(() => {
    setTimeRemaining(EXAM_DURATION_SECONDS)
  }, [])

  // Timer tick
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const interval = setInterval(() => {
      decrementTimer()
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, decrementTimer])

  // Timer expired
  useEffect(() => {
    if (timeRemaining === 0) {
      handleSubmitExam(true)
    }
  }, [timeRemaining])

  // Session complete
  useEffect(() => {
    if (isSessionComplete && sessionId) {
      router.replace(`/results/${sessionId}`)
    }
  }, [isSessionComplete, sessionId])

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      selectAnswer(answerId)
    },
    [selectAnswer],
  )

  const handleNextOrSubmit = useCallback(async () => {
    const isLast = currentQuestionIndex === questions.length - 1

    if (!selectedAnswerId) {
      // Confirm skip
      Alert.alert(
        'Question sans réponse',
        'Voulez-vous passer cette question sans répondre ?',
        [
          { text: 'Rester', style: 'cancel' },
          {
            text: 'Passer',
            onPress: () => {
              if (isLast) handleSubmitExam(false)
              else nextQuestion()
            },
          },
        ],
      )
      return
    }

    // Submit current answer silently
    if (selectedAnswerId && sessionId && question) {
      submitAnswerMutation.mutate({
        sessionId,
        questionId: question.id,
        answerId: selectedAnswerId,
        timeSpentMs: 0,
      })
    }

    if (isLast) {
      await handleSubmitExam(false)
    } else {
      nextQuestion()
    }
  }, [
    currentQuestionIndex,
    questions,
    selectedAnswerId,
    sessionId,
    question,
    nextQuestion,
    submitAnswerMutation,
  ])

  const handleSubmitExam = useCallback(
    async (isTimeout: boolean) => {
      if (!sessionId || isSubmitting) return

      setIsSubmitting(true)
      try {
        await completeSessionMutation.mutateAsync({ sessionId })
        completeSession()
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de soumettre l\'examen')
        setIsSubmitting(false)
      }
    },
    [sessionId, completeSessionMutation, completeSession, isSubmitting],
  )

  const handleQuit = useCallback(() => {
    Alert.alert(
      'Abandonner l\'examen ?',
      'L\'examen sera marqué comme échoué. Cette action est irréversible.',
      [
        { text: 'Continuer l\'examen', style: 'cancel' },
        {
          text: 'Abandonner',
          style: 'destructive',
          onPress: () => {
            reset()
            router.back()
          },
        },
      ],
    )
  }, [reset, router])

  if (!question) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    )
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* ── Top Bar ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.sm,
            paddingBottom: SPACING.md,
            gap: SPACING.md,
          }}
        >
          {/* Quit */}
          <TouchableOpacity
            onPress={handleQuit}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.card,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Feather name="x" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Progress */}
          <View style={{ flex: 1, gap: 4 }}>
            <ProgressBar
              progress={progress.percentage}
              height={6}
              colors={['#6366F1', '#8B5CF6']}
            />
            <Text style={{ color: COLORS.textMuted, fontSize: 11, textAlign: 'center' }}>
              {progress.current}/{progress.total}
            </Text>
          </View>

          {/* Timer */}
          {timeRemaining !== null && <Timer seconds={timeRemaining} />}
        </View>

        {/* Exam Mode Banner */}
        <View
          style={{
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
          }}
        >
          <Feather name="lock" size={13} color={COLORS.primary} />
          <Text style={{ color: '#818CF8', fontSize: 12, fontWeight: '500' }}>
            Mode examen officiel — les explications sont disponibles après l'examen
          </Text>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(300)} key={question.id}>
            <QuestionCard
              question={question}
              questionNumber={progress.current}
              totalQuestions={progress.total}
            />
          </Animated.View>

          {/* Answers — no feedback states in exam mode */}
          <View style={{ marginTop: SPACING.xl }}>
            {question.answers.map((answer, index) => (
              <Animated.View
                key={answer.id}
                entering={FadeInDown.delay(index * 50).duration(250)}
              >
                <AnswerOption
                  label={ANSWER_LABELS[index] ?? String(index + 1)}
                  text={answer.text}
                  state={selectedAnswerId === answer.id ? 'selected' : 'default'}
                  onPress={() => handleSelectAnswer(answer.id)}
                  index={index}
                />
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        {/* ── Bottom Bar ── */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.background,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.md,
            paddingBottom: SPACING.lg,
          }}
        >
          <TouchableOpacity
            onPress={handleNextOrSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isLastQuestion
                  ? ['#10B981', '#059669']
                  : ['#6366F1', '#8B5CF6']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 54,
                borderRadius: RADIUS.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                    {isLastQuestion ? 'Soumettre l\'examen' : 'Question suivante'}
                  </Text>
                  <Feather
                    name={isLastQuestion ? 'check-circle' : 'arrow-right'}
                    size={18}
                    color="#FFFFFF"
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}
