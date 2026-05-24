import React, { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'

const { width, height } = Dimensions.get('window')

// ============================================================
// FEATURE HIGHLIGHTS
// ============================================================

const FEATURES = [
  {
    icon: 'zap' as const,
    color: '#6366F1',
    title: 'Quiz intelligent',
    description: 'Adapté à votre niveau avec spaced repetition',
  },
  {
    icon: 'message-circle' as const,
    color: '#8B5CF6',
    title: 'Coach IA',
    description: 'Explications détaillées en français, allemand ou italien',
  },
  {
    icon: 'bar-chart-2' as const,
    color: '#EC4899',
    title: 'Analyse personnalisée',
    description: 'Identifiez vos lacunes et progressez efficacement',
  },
]

// ============================================================
// COMPONENT
// ============================================================

export default function OnboardingScreen() {
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={{ height: height * 0.45, position: 'relative' }}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Decorative circles */}
          <View
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />

          <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {/* Logo */}
            <Animated.View
              entering={FadeIn.delay(100).duration(600)}
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.lg,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              }}
            >
              <Text style={{ fontSize: 40 }}>🚗</Text>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(200).duration(600)}
              style={{
                fontSize: 36,
                fontWeight: '800',
                color: '#FFFFFF',
                letterSpacing: -0.5,
              }}
            >
              Permis AI
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(350).duration(600)}
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.82)',
                marginTop: SPACING.sm,
                textAlign: 'center',
                paddingHorizontal: SPACING.xl,
                lineHeight: 24,
              }}
            >
              Maîtrisez la théorie suisse{'\n'}avec l'intelligence artificielle
            </Animated.Text>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: SPACING.lg, gap: SPACING.lg }}>
          {/* Features */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ gap: SPACING.md }}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.delay(500 + index * 100).duration(500)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: SPACING.md,
                  backgroundColor: COLORS.card,
                  borderRadius: RADIUS.lg,
                  padding: SPACING.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: `${feature.color}22`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Feather name={feature.icon} size={20} color={feature.color} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 15,
                      fontWeight: '600',
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 13,
                      lineHeight: 19,
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* CTA Buttons */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            style={{ gap: SPACING.md, paddingBottom: SPACING.xl }}
          >
            {/* Primary CTA */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 32,
                  borderRadius: RADIUS.xl,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: SPACING.sm,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                    fontWeight: '700',
                  }}
                >
                  Commencer gratuitement
                </Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary CTA */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
              style={{ alignItems: 'center', paddingVertical: SPACING.sm }}
            >
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 15,
                  fontWeight: '500',
                }}
              >
                J'ai déjà un compte{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  )
}
