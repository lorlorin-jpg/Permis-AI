import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { ChatRole } from '@permis-ai/shared'
import { useSendMessageStream } from '@api/chat'
import { useAuthStore } from '@store/auth.store'
import { COLORS, SPACING, RADIUS } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

interface Message {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  isStreaming?: boolean
}

// ============================================================
// SUGGESTED PROMPTS
// ============================================================

const SUGGESTED_PROMPTS = [
  'Explique la priorité de droite',
  'Différence arrêt/stationnement',
  'Règles en giratoire',
  'Taux alcoolémie suisse',
  'Panneaux de danger',
  'Distances de sécurité',
]

// ============================================================
// MESSAGE BUBBLE
// ============================================================

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === ChatRole.USER

  return (
    <View
      style={{
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
      }}
    >
      {/* Avatar (AI only) */}
      {!isUser && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 16 }}>🧠</Text>
        </View>
      )}

      {/* Bubble */}
      <View
        style={{
          maxWidth: '78%',
          backgroundColor: isUser ? COLORS.primary : COLORS.card,
          borderRadius: RADIUS.xl,
          borderBottomRightRadius: isUser ? 4 : RADIUS.xl,
          borderBottomLeftRadius: isUser ? RADIUS.xl : 4,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm + 2,
          borderWidth: isUser ? 0 : 1,
          borderColor: COLORS.border,
        }}
      >
        <Text
          style={{
            color: isUser ? '#FFFFFF' : COLORS.textPrimary,
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {message.content}
          {message.isStreaming && (
            <Text style={{ color: isUser ? 'rgba(255,255,255,0.6)' : COLORS.primary }}>▌</Text>
          )}
        </Text>
      </View>
    </View>
  )
}

// ============================================================
// COMPONENT
// ============================================================

export default function ChatScreen() {
  const { user } = useAuthStore()
  const isPremium = useAuthStore((s) => s.isPremium())
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const streamMutation = useSendMessageStream()

  // Free user quota
  const [questionsUsed, setQuestionsUsed] = useState(0)
  const MAX_FREE_QUESTIONS = 5

  const remainingQuestions = MAX_FREE_QUESTIONS - questionsUsed
  const canSend = isPremium || remainingQuestions > 0

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming || !canSend) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: ChatRole.USER,
        content: content.trim(),
        timestamp: new Date(),
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: ChatRole.ASSISTANT,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMessage, aiMessage])
      setInput('')
      setIsStreaming(true)
      if (!isPremium) setQuestionsUsed((q) => q + 1)

      scrollToBottom()

      streamMutation.mutate(
        {
          content: content.trim(),
          onChunk: (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessage.id ? { ...m, content: m.content + chunk } : m,
              ),
            )
            scrollToBottom()
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessage.id ? { ...m, isStreaming: false } : m,
              ),
            )
            setIsStreaming(false)
          },
        },
        {
          onError: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMessage.id
                  ? {
                      ...m,
                      content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
                      isStreaming: false,
                    }
                  : m,
              ),
            )
            setIsStreaming(false)
          },
        },
      )
    },
    [isStreaming, canSend, isPremium, streamMutation, scrollToBottom],
  )

  const handleSend = () => {
    sendMessage(input)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  const showSuggestions = messages.length === 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.md,
            paddingHorizontal: SPACING.lg,
            paddingVertical: SPACING.md,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22 }}>🧠</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' }}>
              Coach IA
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
              Spécialiste permis suisse
            </Text>
          </View>

          {/* Usage indicator (free users) */}
          {!isPremium && (
            <View
              style={{
                backgroundColor:
                  remainingQuestions <= 1
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(99, 102, 241, 0.12)',
                borderRadius: RADIUS.full,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor:
                  remainingQuestions <= 1
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(99, 102, 241, 0.25)',
              }}
            >
              <Text
                style={{
                  color: remainingQuestions <= 1 ? COLORS.error : '#818CF8',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {remainingQuestions}/{MAX_FREE_QUESTIONS} restantes
              </Text>
            </View>
          )}
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingTop: SPACING.md, paddingBottom: SPACING.sm }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            showSuggestions ? (
              <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg }}>
                {/* Welcome message */}
                <View
                  style={{
                    backgroundColor: COLORS.card,
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    marginBottom: SPACING.lg,
                    gap: SPACING.sm,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>👋</Text>
                  <Text style={{ color: COLORS.textPrimary, fontSize: 17, fontWeight: '700' }}>
                    Bonjour{user?.name ? `, ${user.name.split(' ')[0]}` : ''} !
                  </Text>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Je suis votre coach IA spécialisé dans le code de la route suisse. Posez-moi vos questions !
                  </Text>
                </View>

                {/* Suggested Prompts */}
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: SPACING.sm,
                  }}
                >
                  Questions fréquentes
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      onPress={() => handleSuggestedPrompt(prompt)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: RADIUS.full,
                        backgroundColor: COLORS.elevated,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                      }}
                    >
                      <Text style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' }}>
                        {prompt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
        />

        {/* Upgrade prompt if out of questions */}
        {!isPremium && !canSend && (
          <View
            style={{
              marginHorizontal: SPACING.lg,
              marginBottom: SPACING.sm,
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.25)',
            }}
          >
            <Text style={{ fontSize: 18 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '600' }}>
                Limite atteinte
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                Passez à Premium pour des questions illimitées
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={{ color: '#A78BFA', fontSize: 13, fontWeight: '600' }}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: SPACING.sm,
            paddingHorizontal: SPACING.lg,
            paddingTop: SPACING.sm,
            paddingBottom: Math.max(insets.bottom, SPACING.md),
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            backgroundColor: COLORS.background,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
              paddingHorizontal: SPACING.md,
              paddingVertical: Platform.OS === 'ios' ? 10 : 8,
              minHeight: 44,
              justifyContent: 'center',
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                canSend
                  ? 'Posez votre question...'
                  : 'Limite atteinte — passez à Premium'
              }
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={1000}
              editable={canSend && !isStreaming}
              style={{
                color: COLORS.textPrimary,
                fontSize: 15,
                lineHeight: 22,
                maxHeight: 120,
              }}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isStreaming || !canSend}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor:
                input.trim() && !isStreaming && canSend
                  ? COLORS.primary
                  : COLORS.elevated,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isStreaming ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Feather
                name="send"
                size={17}
                color={input.trim() && canSend ? '#FFFFFF' : COLORS.textMuted}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
