import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { COLORS, RADIUS, SPACING } from '@/constants/theme'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CategoryDefinition } from '@/constants/categories'

// ============================================================
// TYPES
// ============================================================

export interface CategoryCardProps {
  category: CategoryDefinition
  progress?: number // 0 to 1
  onPress: () => void
}

// ============================================================
// COMPONENT
// ============================================================

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  progress = 0,
  onPress,
}) => {
  const progressPercent = Math.round(progress * 100)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.sm,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: RADIUS.md,
          backgroundColor: `${category.color}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={category.icon as any} size={20} color={category.color} />
      </View>

      {/* Label */}
      <View style={{ gap: 2 }}>
        <Text
          style={{
            color: COLORS.textPrimary,
            fontSize: 14,
            fontWeight: '600',
          }}
          numberOfLines={1}
        >
          {category.label}
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: 11,
          }}
        >
          {category.questionCount} questions
        </Text>
      </View>

      {/* Progress */}
      <View style={{ gap: 4 }}>
        <ProgressBar
          progress={progress}
          height={4}
          colors={[category.color, category.color]}
          animated
        />
        <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>
          {progressPercent}% maîtrisé
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default CategoryCard
