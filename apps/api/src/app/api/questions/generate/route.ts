import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { openai, generateEmbedding } from '@/lib/openai'
import { QUESTION_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { GenerateQuestionsBodySchema, parseBody } from '@/lib/validation'
import { logger } from '@/lib/logger'
import type { QuestionCategory, Difficulty } from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/questions/generate
//
// Admin-only endpoint: generate new questions using GPT-4o, optionally persist
// them to the database and enrich them with vector embeddings.
//
// Requires: x-user-role = 'admin' (set by middleware from JWT)
// ─────────────────────────────────────────────────────────────────────────────

interface GeneratedAnswer {
  text: string
  isCorrect: boolean
}

interface GeneratedQuestion {
  text: string
  category: QuestionCategory
  difficulty: Difficulty
  explanation: string
  tags: string[]
  answers: GeneratedAnswer[]
}

interface GenerationResult {
  questions: GeneratedQuestion[]
}

export async function POST(request: NextRequest) {
  const log = logger.child({ route: 'POST /api/questions/generate' })

  try {
    const supabaseId = request.headers.get('x-user-supabase-id')

    if (!supabaseId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up user in DB to get the application role (Supabase JWT role is 'authenticated', not ADMIN/PREMIUM)
    const requestingUser = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, role: true },
    })

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only admins can generate questions — check DB role, not JWT role
    if (requestingUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 })
    }

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = parseBody(GenerateQuestionsBodySchema, rawBody)
    if (!parsed.success) return parsed.response

    const { category, difficulty, count, publish } = parsed.data

    log.info('Generating questions', { category, difficulty, count, publish })

    // Build prompt
    const prompt = QUESTION_GENERATION_PROMPT
      .replace(/{{CATEGORY}}/g, category)
      .replace(/{{DIFFICULTY}}/g, difficulty)
      .replace(/{{COUNT}}/g, String(count))

    // Call OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            "Tu es un expert en rédaction de questions pour l'examen du permis de conduire suisse. " +
            'Réponds UNIQUEMENT avec du JSON valide selon le format demandé. ' +
            'Assure-toi que chaque question a exactement 4 réponses dont une seule est correcte.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const raw = aiResponse.choices[0]?.message?.content
    if (!raw) {
      log.error('OpenAI returned empty content for question generation')
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 })
    }

    let generation: GenerationResult
    try {
      generation = JSON.parse(raw)
    } catch {
      log.error('Failed to parse AI response', undefined, { raw: raw.slice(0, 500) })
      return NextResponse.json({ error: 'AI response was not valid JSON' }, { status: 502 })
    }

    const aiQuestions = generation?.questions
    if (!Array.isArray(aiQuestions) || aiQuestions.length === 0) {
      return NextResponse.json(
        { error: 'AI did not return a valid questions array' },
        { status: 502 },
      )
    }

    // Validate structure of each question
    const validQuestions = aiQuestions.filter((q) => {
      if (!q.text || !q.explanation || !Array.isArray(q.answers)) return false
      const correctAnswers = q.answers.filter((a: GeneratedAnswer) => a.isCorrect)
      return correctAnswers.length === 1 && q.answers.length >= 2
    })

    if (validQuestions.length === 0) {
      return NextResponse.json(
        { error: 'None of the generated questions passed validation' },
        { status: 422 },
      )
    }

    if (!publish) {
      // Dry-run: return generated questions without persisting
      return NextResponse.json({
        generated: validQuestions.length,
        questions: validQuestions,
        persisted: false,
        message: 'Dry-run mode — set publish=true to save questions to the database',
      })
    }

    // Persist questions with embeddings
    const savedQuestions = []

    for (const q of validQuestions) {
      try {
        // Generate embedding for the question text
        let embeddings: number[] = []
        try {
          embeddings = await generateEmbedding(q.text)
        } catch (embErr) {
          log.warn('Failed to generate embedding for question', { error: String(embErr) })
        }

        const saved = await prisma.question.create({
          data: {
            text: q.text,
            explanation: q.explanation,
            category: q.category ?? category,
            difficulty: q.difficulty ?? difficulty,
            tags: q.tags ?? [],
            isAIGenerated: true,
            isPublished: true,
            embeddings,
            answers: {
              create: (q.answers as GeneratedAnswer[]).map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          },
          include: {
            answers: { select: { id: true, text: true, isCorrect: true } },
          },
        })

        savedQuestions.push(saved)
      } catch (saveErr) {
        log.error('Failed to save generated question', saveErr, { questionText: q.text.slice(0, 80) })
        // Continue saving others
      }
    }

    log.info('Questions generated and saved', { saved: savedQuestions.length, category, difficulty })

    return NextResponse.json(
      {
        generated: validQuestions.length,
        persisted: savedQuestions.length,
        questions: savedQuestions,
      },
      { status: 201 },
    )
  } catch (error) {
    log.error('Unexpected error in question generation', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
