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
import { useRouter } from 'expo-router'
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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

// ============================================================
// FIELD COMPONENT
// ============================================================

interface FieldProps {
  label: string
  icon: string
  placeholder: string
  value: string
  onChangeText: (v: string) => void
  onBlur: () => void
  error?: string
  secureTextEntry?: boolean
  toggleSecure?: () => void
  showToggle?: boolean
  keyboardType?: 'default' | 'email-address'
  autoCapitalize?: 'none' | 'words'
  autoComplete?: 'email' | 'password' | 'name' | 'off'
}

const Field: React.FC<FieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  toggleSecure,
  showToggle = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
}) => (
  <View style={{ gap: SPACING.xs }}>
    <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>{label}</Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.elevated,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: error ? COLORS.error : COLORS.border,
        paddingHorizontal: SPACING.md,
        height: 50,
        gap: SPACING.sm,
      }}
    >
      <Feather name={icon as any} size={17} color={COLORS.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        style={{ flex: 1, color: COLORS.textPrimary, fontSize: 15 }}
      />
      {showToggle && toggleSecure && (
        <TouchableOpacity onPress={toggleSecure}>
          <Feather
            name={secureTextEntry ? 'eye' : 'eye-off'}
            size={17}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
    {error && <Text style={{ color: COLORS.error, fontSize: 12 }}>{error}</Text>}
  </View>
)

// ============================================================
// COMPONENT
// ============================================================

export default function RegisterScreen() {
  const router = useRouter()
  const { setSession, setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post<{
        data: {
          session: { access_token: string; refresh_token: string; expires_at: number }
          user: any
        }
      }>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      const { session, user } = response.data.data
      setSession({ ...session, user: { id: user.id, email: user.email } })
      setUser(user)
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Erreur', err.message ?? 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
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
              Créer un compte 🚀
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 15, lineHeight: 22 }}>
              Commencez votre préparation au permis gratuitement
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
            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Prénom"
                  icon="user"
                  placeholder="Jean"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Adresse email"
                  icon="mail"
                  placeholder="votre@email.ch"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoComplete="email"
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Mot de passe"
                  icon="lock"
                  placeholder="Minimum 8 caractères"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={!showPassword}
                  showToggle
                  toggleSecure={() => setShowPassword(!showPassword)}
                  autoComplete="password"
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Confirmer le mot de passe"
                  icon="lock"
                  placeholder="Répétez votre mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirm}
                  showToggle
                  toggleSecure={() => setShowConfirm(!showConfirm)}
                  autoComplete="off"
                />
              )}
            />

            {/* Terms notice */}
            <Text style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 17 }}>
              En créant un compte, vous acceptez nos{' '}
              <Text style={{ color: COLORS.primary }}>Conditions d'utilisation</Text> et notre{' '}
              <Text style={{ color: COLORS.primary }}>Politique de confidentialité</Text>.
            </Text>

            {/* Register Button */}
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
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Link */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={{ alignItems: 'center', paddingVertical: SPACING.sm }}
            >
              <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
                Déjà un compte ?{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
