import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { rateLimitByPlan } from '@/lib/rate-limit'
import { DRIVING_INSTRUCTOR_PROMPT } from '@/lib/ai/prompts'
import { buildRAGContext } from '@/lib/ai/rag'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import type { QuestionCategory } from '@prisma/client'

interface ChatBody {
  message: string
  context?: {
    questionId?: string
    sessionId?: string
  }
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

    let body: ChatBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { message, context } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Fetch last 10 messages for conversation history
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
      } catch {
        // Non-critical
      }
    } else {
      // General RAG search based on the user's message
      try {
        const rag = await buildRAGContext(message, 3)
        if (rag.totalTokensEstimate < 2000) {
          ragContextStr = rag.contextString
        }
      } catch {
        // Non-critical — proceed without RAG
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
      { role: 'user', content: message.trim() },
    ]

    // Persist user message before streaming starts
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: 'USER',
        content: message.trim(),
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

    const stream = OpenAIStream(response, {
      onCompletion: async (completion) => {
        // Persist assistant response after streaming completes
        try {
          await prisma.chatMessage.create({
            data: {
              userId: user.id,
              role: 'ASSISTANT',
              content: completion,
              context: context ?? null,
            },
          })
        } catch (err) {
          console.error('[chat] Failed to persist assistant message:', err)
        }
      },
    })

    return new StreamingTextResponse(stream, {
      headers: {
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset),
      },
    })
  } catch (error) {
    console.error('[chat] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
