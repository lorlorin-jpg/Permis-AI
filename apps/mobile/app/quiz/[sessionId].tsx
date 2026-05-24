import React, { useEffect, useCallback, useRef, useState } from 'react'
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
import Animated, {
  FadeInDown,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useQuizStore } from '@store/quiz.store'
import { useSubmitAnswer } from '@api/sessions'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { QuestionCard } from '@components/quiz/QuestionCard'
import { AnswerOption } from '@components/quiz/AnswerOption'
import { ProgressBar } from '@components/ui/ProgressBar'
import { AIExplanationSheet } from '@components/quiz/AIExplanationSheet'
import { Skeleton, SkeletonText } from '@components/ui/Skeleton'
import type { AnswerState } from '@components/quiz/AnswerOption'

// ============================================================
// ANSWER LABELS
// ============================================================

const ANSWER_LABELS = ['A', 'B', 'C', 'D']

// ============================================================
// COMPONENT
// ============================================================

export default function QuizScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const router = useRouter()
  const submitAnswerMutation = useSubmitAnswer()

  const {
    currentSession,
    questions,
    currentQuestionIndex,
    selectedAnswerId,
    isCurrentAnswerSubmitted,
    showExplanationSheet,
    isSessionComplete,
    xpEarned,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    showExplanation,
    hideExplanation,
    reset,
    getCurrentQuestion,
    getAnswerForCurrentQuestion,
    getProgress,
  } = useQuizStore()

  const question = getCurrentQuestion()
  const answerResult = getAnswerForCurrentQuestion()
  const progress = getProgress()
  const [isValidating, setIsValidating] = useState(false)

  // Session complete redirect
  useEffect(() => {
    if (isSessionComplete && sessionId) {
      router.replace(`/results/${sessionId}`)
    }
  }, [isSessionComplete, sessionId])

  // XP badge animation
  const xpScale = useSharedValue(0)
  const xpStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xpScale.value }],
  }))

  const getAnswerState = useCallback(
    (answerId: string): AnswerState => {
      if (!isCurrentAnswerSubmitted) {
        return selectedAnswerId === answerId ? 'selected' : 'default'
      }
      // After submission
      if (answerId === question?.correctAnswerId) return 'correct'
      if (answerId === selectedAnswerId && !answerResult?.isCorrect) return 'wrong'
      return 'default'
    },
    [isCurrentAnswerSubmitted, selectedAnswerId, question, answerResult],
  )

  const handleValidate = useCallback(async () => {
    if (!selectedAnswerId || isCurrentAnswerSubmitted || !question || !sessionId) return

    setIsValidating(true)

    const result = submitAnswer()
    if (!result) {
      setIsValidating(false)
      return
    }

    try {
      await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: question.id,
        answerId: selectedAnswerId,
        timeSpentMs: result.timeSpentMs,
      })
    } catch (e) {
      // Continue quiz even if API call fails (offline-friendly)
    }

    // Haptic feedback
    if (result.isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      xpScale.value = withSpring(1, { damping: 8, stiffness: 300 })
      setTimeout(() => {
        xpScale.value = withSpring(0, { damping: 12 })
      }, 2000)
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }

    setIsValidating(false)
  }, [
    selectedAnswerId,
    isCurrentAnswerSubmitted,
    question,
    sessionId,
    submitAnswer,
    submitAnswerMutation,
  ])

  const handleNextQuestion = useCallback(() => {
    nextQuestion()
  }, [nextQuestion])

  const handleQuit = useCallback(() => {
    Alert.alert(
      'Quitter la session ?',
      'Votre progression sera perdue.',
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Quitter',
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
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Skeleton top bar */}
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
            <Skeleton width={36} height={36} borderRadius={18} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton height={6} borderRadius={99} />
              <Skeleton height={12} width={120} borderRadius={4} />
            </View>
            <Skeleton width={60} height={28} borderRadius={99} />
          </View>
          {/* Skeleton question + answers */}
          <View style={{ paddingHorizontal: SPACING.lg, gap: SPACING.lg, marginTop: SPACING.md }}>
            <SkeletonText lines={3} />
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} borderRadius={16} />
            ))}
          </View>
        </SafeAreaView>
      </View>
    )
  }

  const isCorrect = answerResult?.isCorrect

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
          {/* Quit Button */}
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

          {/* Progress Bar */}
          <View style={{ flex: 1, gap: 6 }}>
            <ProgressBar progress={progress.percentage} height={6} />
            <Text style={{ color: COLORS.textMuted, fontSize: 12, textAlign: 'center' }}>
              Question {progress.current} sur {progress.total}
            </Text>
          </View>

          {/* XP counter */}
          <View
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: RADIUS.full,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#818CF8', fontSize: 13, fontWeight: '700' }}>
              {xpEarned} XP
            </Text>
          </View>
        </View>

        {/* ── Scrollable Content ── */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.xxl + 80, // space for bottom bar
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Question */}
          <Animated.View entering={FadeInDown.duration(350)} key={question.id}>
            <QuestionCard
              question={question}
              questionNumber={progress.current}
              totalQuestions={progress.total}
            />
          </Animated.View>

          {/* Answers */}
          <View style={{ marginTop: SPACING.xl, gap: 0 }}>
            {question.answers.map((answer, index) => (
              <Animated.View
                key={answer.id}
                entering={FadeInDown.delay(index * 60).duration(300)}
              >
                <AnswerOption
                  label={ANSWER_LABELS[index] ?? String(index + 1)}
                  text={answer.text}
                  state={getAnswerState(answer.id)}
                  onPress={() => selectAnswer(answer.id)}
                  disabled={isCurrentAnswerSubmitted}
                  index={index}
                />
              </Animated.View>
            ))}
          </View>

          {/* Post-answer feedback */}
          {isCurrentAnswerSubmitted && (
            <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: SPACING.md }}>
              {/* Result card */}
              <View
                style={{
                  backgroundColor: isCorrect
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: isCorrect
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isCorrect ? COLORS.success : COLORS.error,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                    {isCorrect ? '✓' : '✗'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: isCorrect ? COLORS.success : COLORS.error,
                      fontSize: 15,
                      fontWeight: '700',
                      marginBottom: 4,
                    }}
                  >
                    {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 13,
                      lineHeight: 19,
                    }}
                    numberOfLines={2}
                  >
                    {question.explanation}
                  </Text>
                </View>
              </View>

              {/* XP earned badge */}
              {isCorrect && (
                <Animated.View
                  style={[
                    {
                      alignSelf: 'center',
                      marginTop: SPACING.sm,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      borderRadius: RADIUS.full,
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                    },
                    xpStyle,
                  ]}
                >
                  <Text style={{ color: '#818CF8', fontSize: 14, fontWeight: '700' }}>
                    +10 XP 🎉
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* ── Bottom Action Bar ── */}
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
            gap: SPACING.sm,
          }}
        >
          {!isCurrentAnswerSubmitted ? (
            /* Validate button */
            <TouchableOpacity
              onPress={handleValidate}
              disabled={!selectedAnswerId || isValidating}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  selectedAnswerId
                    ? ['#6366F1', '#8B5CF6']
                    : [COLORS.elevated, COLORS.elevated]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 54,
                  borderRadius: RADIUS.xl,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: SPACING.sm,
                }}
              >
                {isValidating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    style={{
                      color: selectedAnswerId ? '#FFFFFF' : COLORS.textMuted,
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    Valider
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* Post-answer buttons */
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {/* Explain me */}
              <TouchableOpacity
                onPress={showExplanation}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: RADIUS.xl,
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14 }}>🧠</Text>
                <Text style={{ color: '#818CF8', fontSize: 14, fontWeight: '600' }}>
                  Explique-moi
                </Text>
              </TouchableOpacity>

              {/* Next Question */}
              <TouchableOpacity
                onPress={handleNextQuestion}
                activeOpacity={0.85}
                style={{ flex: 1.4 }}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 50,
                    borderRadius: RADIUS.xl,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                    {progress.current === progress.total ? 'Terminer' : 'Suivante'}
                  </Text>
                  <Feather
                    name={progress.current === progress.total ? 'check' : 'arrow-right'}
                    size={16}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* AI Explanation Bottom Sheet */}
      {showExplanationSheet && (
        <AIExplanationSheet
          visible={showExplanationSheet}
          onClose={hideExplanation}
          questionId={question.id}
          userAnswerId={selectedAnswerId ?? ''}
          questionText={question.text}
        />
      )}
    </View>
  )
}
