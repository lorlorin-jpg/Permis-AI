import React, { useState } from 'react'
import { View, Text, Image, ActivityIndicator } from 'react-native'
import { Question } from '@permis-ai/shared'
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme'
import { CATEGORIES } from '@/constants/categories'
import Badge from '@/components/ui/Badge'

// ============================================================
// TYPES
// ============================================================

export interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
}

// ============================================================
// HELPERS
// ============================================================

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'EASY':   return 'Facile'
    case 'MEDIUM': return 'Moyen'
    case 'HARD':   return 'Difficile'
    default:       return difficulty
  }
}

function getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'error' {
  switch (difficulty) {
    case 'EASY':   return 'success'
    case 'MEDIUM': return 'warning'
    case 'HARD':   return 'error'
    default:       return 'warning'
  }
}

// ============================================================
// COMPONENT
// ============================================================

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
}) => {
  const categoryDef = CATEGORIES[question.category]
  const [imageLoading, setImageLoading] = useState(!!question.imageUrl)
  const [imageError, setImageError]     = useState(false)

  return (
    <View style={{ gap: SPACING.md }}>
      {/* Category & Difficulty Row */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', alignItems: 'center' }}>
        {categoryDef && (
          <Badge
            label={categoryDef.label}
            variant="custom"
            backgroundColor={`${categoryDef.color}22`}
            color={categoryDef.color}
            size="sm"
          />
        )}
        <Badge
          label={getDifficultyLabel(question.difficulty)}
          variant={getDifficultyVariant(question.difficulty)}
          size="sm"
        />
      </View>

      {/* Question Text — largest type on the screen */}
      <Text
        style={{
          color: COLORS.textPrimary,
          fontSize: TYPOGRAPHY.fontSizes.xl,
          fontWeight: TYPOGRAPHY.fontWeights.semibold,
          lineHeight: TYPOGRAPHY.fontSizes.xl * TYPOGRAPHY.lineHeights.relaxed,
          letterSpacing: -0.2,
        }}
      >
        {question.text}
      </Text>

      {/* Optional Image with loading/error states */}
      {question.imageUrl && !imageError && (
        <View
          style={{
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            backgroundColor: COLORS.elevated,
            height: 200,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {imageLoading && (
            <View style={{ position: 'absolute', zIndex: 1 }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          )}
          <Image
            source={{ uri: question.imageUrl }}
            style={{
              width: '100%',
              height: '100%',
              opacity: imageLoading ? 0 : 1,
            }}
            resizeMode="contain"
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false)
              setImageError(true)
            }}
          />
        </View>
      )}
    </View>
  )
}

export default QuestionCard
