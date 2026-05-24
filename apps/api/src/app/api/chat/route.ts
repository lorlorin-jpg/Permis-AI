import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { rateLimitByPlan } from '@/lib/rate-limit'
import { DRIVING_INSTRUCTOR_PROMPT } from '@/lib/ai/prompts'
import { buildRAGContext } from '@/lib/ai/rag'
import { logger } from '@/lib/logger'

// ── Zod validation schema ─────────────────────────────────────────────────────
const ChatBodySchema = z.object({
  message: z
    .string()
    .min(1, 'message is required')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
  context: z
    .object({
      questionId: z.string().cuid().optional(),
      sessionId: z.string().cuid().optional(),
    })
    .optional(),
})

// ── Prompt-injection sanitisation ─────────────────────────────────────────────
function sanitizeUserMessage(message: string): string {
  const dangerous = [
    /ignore\s+(previous|all)\s+instructions/gi,
    /system\s+prompt/gi,
    /you\s+are\s+now/gi,
    /forget\s+(your|all)\s+(instructions|rules)/gi,
    /jailbreak/gi,
    /DAN\s+mode/gi,
    /act\s+as\s+(?!a\s+driving)/gi,          // "act as X" but not "act as a driving instructor"
    /pretend\s+(you\s+are|to\s+be)/gi,
    /disregard\s+(previous|all|your)/gi,
    /override\s+(system|instructions|rules)/gi,
  ]
  let sanitized = message.trim().slice(0, 2000)
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, '[FILTERED]')
  }
  return sanitized
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, isPremium: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limit
    const rl = await rateLimitByPlan(user.id, 'CHAT', user.isPremium)
    if (!rl.success) {
      return NextResponse.json(
        {
          error: 'Chat rate limit exceeded',
          remaining: rl.remaining,
          reset: rl.reset,
          isPremiumFeature: !user.isPremium,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rl.remaining),
            'X-RateLimit-Reset': String(rl.reset),
          },
        }
      )
    }

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parseResult = ChatBodySchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      )
    }

    const { message: rawMessage, context } = parseResult.data

    // Sanitise against prompt-injection attempts
    const message = sanitizeUserMessage(rawMessage)

    // Validate contextual IDs belong to this user (IDOR prevention)
    if (context?.sessionId) {
      const sessionOwned = await prisma.examSession.findFirst({
        where: { id: context.sessionId, userId: user.id },
        select: { id: true },
      })
      if (!sessionOwned) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }
    }

    // Fetch last 10 messages scoped to this user (IDOR prevention: userId filter is mandatory)
    const history = await prisma.chatMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { role: true, content: true },
    })
    const sortedHistory = history.reverse()

    // ── Build RAG context ──────────────────────────────────────────────────────
    let ragContextStr = ''

    if (context?.questionId) {
      // If a specific question is referenced, build context from it
      try {
        const question = await prisma.question.findFirst({
          // isPublished guard prevents leaking unpublished question content
          where: { id: context.questionId, isPublished: true },
          include: {
            answers: { select: { text: true, isCorrect: true } },
          },
        })
        if (question) {
          const correctAns = question.answers.find((a) => a.isCorrect)
          ragContextStr =
            `## Question en cours\n` +
            `Catégorie: ${question.category}\n` +
            `Question: ${question.text}\n` +
            `Bonne réponse: ${correctAns?.text ?? 'N/A'}\n` +
            `Explication: ${question.explanation}`
        }
      } catch (err) {
        logger.warn('[chat] Failed to build question context', { questionId: context.questionId, error: String(err) })
      }
    } else {
      // General RAG search based on the user's message
      try {
        const rag = await buildRAGContext(message, 3)
        if (rag.totalTokensEstimate < 2000) {
          ragContextStr = rag.contextString
        }
      } catch (err) {
        logger.warn('[chat] RAG context build failed — proceeding without context', { error: String(err) })
      }
    }

    // ── Build message array ────────────────────────────────────────────────────
    const systemContent = ragContextStr
      ? `${DRIVING_INSTRUCTOR_PROMPT}\n\n## Contexte pertinent\n${ragContextStr}`
      : DRIVING_INSTRUCTOR_PROMPT

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemContent },
      ...sortedHistory.map((m) => ({
        role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    // Persist sanitized user message before streaming starts
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: 'USER',
        content: message,
        context: context ?? null,
      },
    })

    // ── Stream response ────────────────────────────────────────────────────────
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.6,
      max_tokens: 800,
      stream: true,
    })

    // Native streaming via ReadableStream (no deprecated `ai` package dependency)
    let fullContent = ''
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              // Emit as SSE data frame so mobile clients can parse it
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
            }
          }
          // Signal end-of-stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

          // Persist assistant message after stream completes
          try {
            await prisma.chatMessage.create({
              data: {
                userId: user.id,
                role: 'ASSISTANT',
                content: fullContent,
                context: context ?? null,
              },
            })
          } catch (err) {
            logger.error('[chat] Failed to persist assistant message', err)
          }
        } catch (err) {
          logger.error('[chat] Streaming error', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset),
      },
    })
  } catch (error) {
    console.error('[chat] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
