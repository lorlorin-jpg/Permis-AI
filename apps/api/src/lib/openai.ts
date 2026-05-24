import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// ─────────────────────────────────────────────────────────────────────────────
// Client singleton
// ─────────────────────────────────────────────────────────────────────────────

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// ─────────────────────────────────────────────────────────────────────────────
// Embedding generation
// ─────────────────────────────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.replace(/\n/g, ' ').trim(),
    encoding_format: 'float',
  })

  return response.data[0].embedding
}

// ─────────────────────────────────────────────────────────────────────────────
// Streaming chat completion
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export async function streamChatCompletion(
  messages: ChatCompletionMessageParam[],
  options: StreamChatOptions = {}
) {
  const {
    model = 'gpt-4o',
    temperature = 0.7,
    maxTokens = 1024,
    topP = 1,
    frequencyPenalty = 0,
    presencePenalty = 0,
  } = options

  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
    stream: true,
  })

  return stream
}

// ─────────────────────────────────────────────────────────────────────────────
// Explanation generation (non-streaming, cached use case)
// ─────────────────────────────────────────────────────────────────────────────

export interface ExplanationContext {
  questionText: string
  userAnswerText: string
  correctAnswerText: string
  category: string
  difficulty: string
  existingExplanation?: string
}

export async function generateExplanation(
  context: ExplanationContext
): Promise<string> {
  const {
    questionText,
    userAnswerText,
    correctAnswerText,
    category,
    difficulty,
    existingExplanation,
  } = context

  const systemPrompt = `Tu es un moniteur d'auto-école suisse expert et pédagogue.
Tu expliques les règles du Code de la Route suisse de manière claire, précise et mémorable.
Tes explications sont basées sur l'Ordonnance sur la circulation routière (OCR) et le Code de la route suisse.
Tu utilises des exemples concrets tirés de situations réelles sur les routes suisses.
Réponds toujours en français. Sois précis, bienveillant et encourageant.`

  const userPrompt = `Question : ${questionText}
Catégorie : ${category}
Difficulté : ${difficulty}

La réponse de l'utilisateur : "${userAnswerText}"
La bonne réponse : "${correctAnswerText}"

${existingExplanation ? `Explication de base : ${existingExplanation}` : ''}

Fournis une explication pédagogique complète qui :
1. Explique pourquoi la bonne réponse est correcte selon le droit suisse
2. Explique pourquoi la réponse de l'utilisateur est incorrecte (si applicable)
3. Donne un exemple concret de situation sur une route suisse
4. Fournis un conseil mnémotechnique pour retenir la règle
5. Cite la référence légale suisse si pertinent (OCR, LCR, etc.)

Format ta réponse en JSON avec cette structure :
{
  "explanation": "explication principale...",
  "examples": ["exemple 1", "exemple 2"],
  "tips": ["conseil 1", "conseil 2"],
  "legalReference": "référence légale optionnelle"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty explanation content')
  }

  return content
}
