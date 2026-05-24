import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai } from '@/lib/openai'
import { rateLimitByPlan } from '@/lib/rate-limit'
import { EXPLANATION_PROMPT } from '@/lib/ai/prompts'
import { StreamingTextResponse } from 'ai'

interface ExplainRequestBody {
  userAnswerId: string
  questionId?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseId = request.headers.get('x-user-supabase-id')
    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const questionId = params.id

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, isPremium: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimitByPlan(user.id, 'AI_QUESTION', user.isPremium)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
          isPremiumFeature: !user.isPremium,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // Parse body
    let body: ExplainRequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { userAnswerId } = body

    if (!userAnswerId) {
      return NextResponse.json({ error: 'userAnswerId is required' }, { status: 400 })
    }

    // Fetch question with all answers
    const question = await prisma.question.findFirst({
      where: { id: questionId, isPublished: true },
      include: {
        answers: {
          select: { id: true, text: true, isCorrect: true },
        },
      },
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    const userAnswer = question.answers.find((a) => a.id === userAnswerId)
    const correctAnswer = question.answers.find((a) => a.isCorrect)

    if (!userAnswer) {
      return NextResponse.json({ error: 'Answer not found for this question' }, { status: 404 })
    }

    if (!correctAnswer) {
      return NextResponse.json({ error: 'Question has no correct answer defined' }, { status: 500 })
    }

    // Check for cached explanation
    const cached = await prisma.aIExplanation.findUnique({
      where: { questionId_language: { questionId, language: 'fr' } },
    })

    const isCorrect = userAnswer.isCorrect

    // Build the prompt
    const prompt = EXPLANATION_PROMPT
      .replace('{{QUESTION_TEXT}}', question.text)
      .replace('{{CATEGORY}}', question.category)
      .replace('{{DIFFICULTY}}', question.difficulty)
      .replace('{{USER_ANSWER}}', userAnswer.text)
      .replace('{{CORRECT_ANSWER}}', correctAnswer.text)
      .replace('{{#IS_CORRECT}}', isCorrect ? '' : '<!--')
      .replace('{{/IS_CORRECT}}', isCorrect ? '' : '-->')
      .replace('{{#IS_WRONG}}', !isCorrect ? '' : '<!--')
      .replace('{{/IS_WRONG}}', !isCorrect ? '' : '-->')
      .replace('{{BASE_EXPLANATION}}', question.explanation)

    // If we have a cached explanation and user answered correctly, return it directly (non-streaming)
    if (cached && isCorrect) {
      return NextResponse.json({
        explanation: cached.content,
        examples: cached.examples,
        tips: cached.tips,
        isCorrect,
        cached: true,
      })
    }

    // Stream the explanation from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un moniteur d\'auto-école suisse expert. Réponds toujours en JSON valide selon le format demandé. Ne mets jamais de texte avant ou après le JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      stream: true,
    })

    // Collect streamed chunks and accumulate the full response
    let fullContent = ''

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              fullContent += delta
              controller.enqueue(encoder.encode(delta))
            }
          }

          // After streaming completes, try to cache the explanation
          try {
            const parsed = JSON.parse(fullContent)
            await prisma.aIExplanation.upsert({
              where: { questionId_language: { questionId, language: 'fr' } },
              update: {
                content: parsed.explanation ?? fullContent,
                examples: parsed.examples ?? [],
                tips: parsed.tips ?? [],
                cachedAt: new Date(),
              },
              create: {
                questionId,
                language: 'fr',
                content: parsed.explanation ?? fullContent,
                examples: parsed.examples ?? [],
                tips: parsed.tips ?? [],
              },
            })
          } catch {
            // Ignore cache write failures silently
          }

          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.reset),
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('[questions/[id]/explain] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
