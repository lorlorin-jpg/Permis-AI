import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'
import { useAuthStore } from '@store/auth.store'
import apiClient from '@api/client'

// ============================================================
// SCHEMA
// ============================================================

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
})

type LoginForm = z.infer<typeof loginSchema>

// ============================================================
// COMPONENT
// ============================================================

export default function LoginScreen() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<{
        data: {
          session: { access_token: string; refresh_token: string; expires_at: number }
          user: any
        }
      }>('/auth/login', data)

      const { session, user } = response.data.data
      setSession({
        ...session,
        user: { id: user.id, email: user.email },
      })
      setUser(user)
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Erreur de connexion', err.message ?? 'Vérifiez vos identifiants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    Alert.alert('Bientôt disponible', 'La connexion Google sera disponible prochainement.')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: SPACING.lg }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.card,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: SPACING.xl,
            }}
          >
            <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={{ marginBottom: SPACING.xl }}>
            <Text
              style={{ color: COLORS.textPrimary, fontSize: 30, fontWeight: '800', marginBottom: 8 }}
            >
              Bon retour 👋
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Connectez-vous pour reprendre votre progression
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={{
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              borderWidth: 1,
              borderColor: COLORS.border,
              gap: SPACING.md,
              marginBottom: SPACING.lg,
            }}
          >
            {/* Email */}
            <View style={{ gap: SPACING.xs }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>
                Adresse email
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.elevated,
                      borderRadius: RADIUS.md,
                      borderWidth: 1,
                      borderColor: errors.email ? COLORS.error : COLORS.border,
                      paddingHorizontal: SPACING.md,
                      height: 50,
                      gap: SPACING.sm,
                    }}
                  >
                    <Feather name="mail" size={17} color={COLORS.textMuted} />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="votre@email.ch"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      style={{ flex: 1, color: COLORS.textPrimary, fontSize: 15 }}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={{ color: COLORS.error, fontSize: 12 }}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={{ gap: SPACING.xs }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>
                Mot de passe
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: COLORS.elevated,
                      borderRadius: RADIUS.md,
                      borderWidth: 1,
                      borderColor: errors.password ? COLORS.error : COLORS.border,
                      paddingHorizontal: SPACING.md,
                      height: 50,
                      gap: SPACING.sm,
                    }}
                  >
                    <Feather name="lock" size={17} color={COLORS.textMuted} />
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      style={{ flex: 1, color: COLORS.textPrimary, fontSize: 15 }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={17}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text style={{ color: COLORS.error, fontSize: 12 }}>{errors.password.message}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '500' }}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 52,
                  borderRadius: RADIUS.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.md,
              marginBottom: SPACING.lg,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </Animated.View>

          {/* Google Login */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <TouchableOpacity
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
              style={{
                height: 52,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.card,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
                marginBottom: SPACING.xl,
              }}
            >
              <Text style={{ fontSize: 18 }}>🔍</Text>
              <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' }}>
                Continuer avec Google
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Pas encore de compte ?{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                  Créer un compte
                </Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
