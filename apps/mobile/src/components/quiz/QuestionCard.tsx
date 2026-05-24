import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { Question } from '@permis-ai/shared'
import { COLORS, RADIUS, SPACING, FONT_SIZE } from '@/constants/theme'
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
    case 'EASY': return 'Facile'
    case 'MEDIUM': return 'Moyen'
    case 'HARD': return 'Difficile'
    default: return difficulty
  }
}

function getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'error' {
  switch (difficulty) {
    case 'EASY': return 'success'
    case 'MEDIUM': return 'warning'
    case 'HARD': return 'error'
    default: return 'warning'
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

  return (
    <View style={{ gap: SPACING.md }}>
      {/* Category & Difficulty Row */}
      <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }}>
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

      {/* Question Text */}
      <Text
        style={{
          color: COLORS.textPrimary,
          fontSize: FONT_SIZE.xl,
          fontWeight: '600',
          lineHeight: 30,
        }}
      >
        {question.text}
      </Text>

      {/* Optional Image */}
      {question.imageUrl && (
        <View
          style={{
            borderRadius: RADIUS.lg,
            overflow: 'hidden',
            backgroundColor: COLORS.elevated,
            height: 200,
          }}
        >
          <Image
            source={{ uri: question.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  )
}

export default QuestionCard
