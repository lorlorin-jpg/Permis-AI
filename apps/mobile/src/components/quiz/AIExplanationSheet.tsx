import React, { useCallback, useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'
import { useStreamExplanation, ExplainQuestionParams } from '@/api/questions'

// ============================================================
// TYPES
// ============================================================

export interface AIExplanationSheetProps {
  visible: boolean
  onClose: () => void
  questionId: string
  userAnswerId: string
  questionText?: string
}

const QUICK_PROMPTS = [
  { label: 'Pourquoi cette réponse ?', prompt: 'Explique pourquoi cette réponse est correcte.' },
  { label: 'Exemple concret', prompt: 'Donne-moi un exemple concret de cette situation.' },
  { label: 'Règle suisse', prompt: 'Quelle est la règle suisse exacte applicable ici ?' },
]

// ============================================================
// COMPONENT
// ============================================================

export const AIExplanationSheet: React.FC<AIExplanationSheetProps> = ({
  visible,
  onClose,
  questionId,
  userAnswerId,
  questionText,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const [explanation, setExplanation] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activePrompt, setActivePrompt] = useState<string | null>(null)
  const snapPoints = ['55%', '90%']

  const { mutate: streamExplanation } = useStreamExplanation()

  const fetchExplanation = useCallback(
    (prompt?: string) => {
      setExplanation('')
      setIsStreaming(true)
      setActivePrompt(prompt ?? null)

      const params: ExplainQuestionParams = {
        questionId,
        userAnswerId,
        prompt,
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      streamExplanation(
        {
          params,
          onChunk: (chunk) => {
            setExplanation((prev) => prev + chunk)
          },
        },
        {
          onSettled: () => setIsStreaming(false),
        },
      )
    },
    [questionId, userAnswerId, streamExplanation],
  )

  // Auto-fetch when sheet opens
  useEffect(() => {
    if (visible && questionId && userAnswerId) {
      fetchExplanation()
    }
  }, [visible, questionId, userAnswerId])

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
      setExplanation('')
      setIsStreaming(false)
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        onPress={onClose}
      />
    ),
    [onClose],
  )

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: COLORS.card }}
      handleIndicatorStyle={{ backgroundColor: COLORS.border, width: 40 }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.sm,
            paddingBottom: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>🧠</Text>
            </View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Coach IA
            </Text>
          </View>
          {isStreaming && <ActivityIndicator color={COLORS.primary} size="small" />}
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Prompts */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: SPACING.sm }}
          >
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p.label}
                onPress={() => fetchExplanation(p.prompt)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: RADIUS.full,
                  backgroundColor:
                    activePrompt === p.prompt
                      ? 'rgba(99, 102, 241, 0.3)'
                      : COLORS.elevated,
                  borderWidth: 1,
                  borderColor:
                    activePrompt === p.prompt ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color:
                      activePrompt === p.prompt ? '#818CF8' : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Explanation Text */}
          {explanation ? (
            <View
              style={{
                backgroundColor: COLORS.elevated,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
              }}
            >
              <Text
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                {explanation}
                {isStreaming && (
                  <Text style={{ color: COLORS.primary }}>▌</Text>
                )}
              </Text>
            </View>
          ) : isStreaming ? (
            <View
              style={{
                backgroundColor: COLORS.elevated,
                borderRadius: RADIUS.lg,
                padding: SPACING.md,
                alignItems: 'center',
                gap: SPACING.sm,
              }}
            >
              <ActivityIndicator color={COLORS.primary} />
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
                Génération de l'explication...
              </Text>
            </View>
          ) : null}

          {/* Bottom padding for safe area */}
          <View style={{ height: 32 }} />
        </BottomSheetScrollView>
      </View>
    </BottomSheet>
  )
}

export default AIExplanationSheet
