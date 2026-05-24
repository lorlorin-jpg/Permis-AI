// ─────────────────────────────────────────────────────────────────────────────
// Shared Zod schemas for API request validation
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Enums (must match Prisma schema and @permis-ai/shared)
// ─────────────────────────────────────────────────────────────────────────────

export const QuestionCategorySchema = z.enum([
  'SIGNS',
  'PRIORITY',
  'HIGHWAY',
  'SPEED_LIMITS',
  'ALCOHOL',
  'DISTANCES',
  'REAL_SITUATIONS',
  'ECO_DRIVING',
  'SAFETY',
  'BEHAVIORS',
])

export const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])

export const SessionTypeSchema = z.enum(['PRACTICE', 'EXAM', 'REVIEW', 'AI_GUIDED'])

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

// ─────────────────────────────────────────────────────────────────────────────
// Questions
// ─────────────────────────────────────────────────────────────────────────────

export const GetQuestionsQuerySchema = PaginationSchema.extend({
  category: QuestionCategorySchema.optional(),
  difficulty: DifficultySchema.optional(),
  sessionType: z.string().optional(),
})

export const ExplainQuestionBodySchema = z.object({
  userAnswerId: z.string().min(1, 'userAnswerId is required'),
  questionId: z.string().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────────────────────

export const CreateSessionBodySchema = z.object({
  type: SessionTypeSchema,
  categories: z.array(QuestionCategorySchema).optional(),
  questionCount: z.number().int().min(1).max(100).optional(),
})

export const SubmitAnswerBodySchema = z.object({
  questionId: z.string().min(1, 'questionId is required'),
  answerId: z.string().min(1, 'answerId is required'),
  timeSpent: z.number().min(0).max(3600).default(0),
})

export const GetSessionsQuerySchema = PaginationSchema.extend({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  type: SessionTypeSchema.optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────────────────────────────────────

export const ChatBodySchema = z.object({
  message: z
    .string()
    .min(1, 'message is required')
    .max(2000, 'Message must be at most 2000 characters')
    .trim(),
  context: z
    .object({
      questionId: z.string().optional(),
      sessionId: z.string().optional(),
    })
    .optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// User
// ─────────────────────────────────────────────────────────────────────────────

export const UpdateUserBodySchema = z.object({
  name: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url('avatarUrl must be a valid URL').optional().nullable(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Stripe
// ─────────────────────────────────────────────────────────────────────────────

export const CreateCheckoutBodySchema = z.object({
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// AI question generation
// ─────────────────────────────────────────────────────────────────────────────

export const GenerateQuestionsBodySchema = z.object({
  category: QuestionCategorySchema,
  difficulty: DifficultySchema,
  count: z.number().int().min(1).max(10).default(5),
  publish: z.boolean().default(false),
})

// ─────────────────────────────────────────────────────────────────────────────
// Spec aliases — shorter names matching the CTO audit requirements
// ─────────────────────────────────────────────────────────────────────────────

/** Alias: SubmitAnswerSchema → SubmitAnswerBodySchema */
export const SubmitAnswerSchema = SubmitAnswerBodySchema

/** Alias: CreateSessionSchema → CreateSessionBodySchema */
export const CreateSessionSchema = CreateSessionBodySchema

/** Alias: ChatMessageSchema → ChatBodySchema */
export const ChatMessageSchema = ChatBodySchema

/** Alias: ExplainSchema → ExplainQuestionBodySchema */
export const ExplainSchema = ExplainQuestionBodySchema

/** Alias: UpdateUserSchema → UpdateUserBodySchema */
export const UpdateUserSchema = UpdateUserBodySchema

// ─────────────────────────────────────────────────────────────────────────────
// Helper: parse or return 400 error response
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }))
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Validation error', details: issues },
        { status: 400 },
      ),
    }
  }
  return { success: true, data: result.data }
}
