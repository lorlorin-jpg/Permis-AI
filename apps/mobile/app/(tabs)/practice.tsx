import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Difficulty, QuestionCategory } from '@permis-ai/shared'
import { useCreateSession } from '@api/sessions'
import { useUserProgress } from '@api/progress'
import { useQuizStore } from '@store/quiz.store'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { CATEGORY_LIST, CATEGORIES } from '@/constants/categories'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Badge } from '@components/ui/Badge'

// ============================================================
// DIFFICULTY OPTIONS
// ============================================================

const DIFFICULTIES: { key: Difficulty | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: Difficulty.EASY, label: 'Facile' },
  { key: Difficulty.MEDIUM, label: 'Moyen' },
  { key: Difficulty.HARD, label: 'Difficile' },
]

// ============================================================
// COMPONENT
// ============================================================

export default function PracticeScreen() {
  const router = useRouter()
  const createSession = useCreateSession()
  const { setSession, setQuestions } = useQuizStore()
  const { data: progress } = useUserProgress()

  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'ALL'>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'ALL'>('ALL')

  const categoryProgressMap: Record<string, number> = {}
  if (progress?.categoryProgress) {
    progress.categoryProgress.forEach((cp) => {
      categoryProgressMap[cp.category] = cp.masteryScore ?? 0
    })
  }

  const handleStartSession = useCallback(async () => {
    try {
      const params: any = {
        type: selectedCategory === 'ALL' ? 'PRACTICE' : 'CATEGORY',
        questionCount: 15,
      }
      if (selectedCategory !== 'ALL') params.category = selectedCategory
      if (selectedDifficulty !== 'ALL') params.difficulty = selectedDifficulty

      const session = await createSession.mutateAsync(params)
      setSession(session)
      setQuestions(session.questions)
      router.push(`/quiz/${session.id}`)
    } catch (e) {
      console.error('Failed to create session:', e)
    }
  }, [selectedCategory, selectedDifficulty, createSession, router])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg }}>
          <Text style={{ color: COLORS.textPrimary, fontSize: 26, fontWeight: '800' }}>
            Entraînement
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>
            Choisissez votre mode de pratique
          </Text>
        </View>

        {/* Category Selector */}
        <View style={{ marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              paddingHorizontal: SPACING.lg,
              marginBottom: SPACING.sm,
            }}
          >
            Catégorie
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: SPACING.sm }}
          >
            {/* All Categories chip */}
            <TouchableOpacity
              onPress={() => setSelectedCategory('ALL')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: RADIUS.full,
                backgroundColor:
                  selectedCategory === 'ALL'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : COLORS.elevated,
                borderWidth: 1,
                borderColor:
                  selectedCategory === 'ALL' ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === 'ALL' ? '#818CF8' : COLORS.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              >
                Toutes
              </Text>
            </TouchableOpacity>

            {CATEGORY_LIST.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: RADIUS.full,
                  backgroundColor:
                    selectedCategory === cat.key
                      ? `${cat.color}22`
                      : COLORS.elevated,
                  borderWidth: 1,
                  borderColor:
                    selectedCategory === cat.key ? cat.color : COLORS.border,
                }}
              >
                <Feather
                  name={cat.icon as any}
                  size={13}
                  color={selectedCategory === cat.key ? cat.color : COLORS.textMuted}
                />
                <Text
                  style={{
                    color: selectedCategory === cat.key ? cat.color : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Difficulty Filter */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 12,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: SPACING.sm,
            }}
          >
            Difficulté
          </Text>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.key}
                onPress={() => setSelectedDifficulty(d.key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: RADIUS.md,
                  alignItems: 'center',
                  backgroundColor:
                    selectedDifficulty === d.key
                      ? 'rgba(99, 102, 241, 0.15)'
                      : COLORS.elevated,
                  borderWidth: 1,
                  borderColor:
                    selectedDifficulty === d.key ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedDifficulty === d.key
                        ? '#818CF8'
                        : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Session Config Summary */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              gap: SPACING.sm,
            }}
          >
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' }}>
              Configuration de la session
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' }}>
              <Badge
                label={
                  selectedCategory === 'ALL'
                    ? 'Toutes catégories'
                    : CATEGORIES[selectedCategory as QuestionCategory]?.label ?? selectedCategory
                }
                variant="primary"
                size="sm"
              />
              <Badge
                label={
                  selectedDifficulty === 'ALL'
                    ? 'Toutes difficultés'
                    : DIFFICULTIES.find((d) => d.key === selectedDifficulty)?.label ?? 'Toutes'
                }
                variant="secondary"
                size="sm"
              />
              <Badge label="15 questions" variant="muted" size="sm" />
            </View>
          </View>
        </View>

        {/* Start Button */}
        <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
          <TouchableOpacity
            onPress={handleStartSession}
            disabled={createSession.isPending}
            activeOpacity={0.85}
            style={{ opacity: createSession.isPending ? 0.7 : 1 }}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: 56,
                borderRadius: RADIUS.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
              }}
            >
              <Feather name="play" size={20} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                {createSession.isPending ? 'Préparation...' : 'Commencer la session'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress per Category */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 17,
              fontWeight: '700',
              marginBottom: SPACING.md,
            }}
          >
            Progression par catégorie
          </Text>

          <View style={{ gap: SPACING.sm }}>
            {CATEGORY_LIST.map((cat) => {
              const catProgress = categoryProgressMap[cat.key] ?? 0
              const pct = Math.round(catProgress * 100)

              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => {
                    setSelectedCategory(cat.key)
                  }}
                  activeOpacity={0.7}
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
                  {/* Category Icon */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${cat.color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Feather name={cat.icon as any} size={18} color={cat.color} />
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>
                        {cat.label}
                      </Text>
                      <Text style={{ color: cat.color, fontSize: 13, fontWeight: '700' }}>
                        {pct}%
                      </Text>
                    </View>
                    <ProgressBar
                      progress={catProgress}
                      height={5}
                      colors={[cat.color, cat.color]}
                    />
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
