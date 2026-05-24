// ============================================================
// ENUMS
// ============================================================

export enum QuestionCategory {
  SIGNS = 'SIGNS',
  PRIORITY = 'PRIORITY',
  HIGHWAY = 'HIGHWAY',
  SPEED_LIMITS = 'SPEED_LIMITS',
  ALCOHOL = 'ALCOHOL',
  DISTANCES = 'DISTANCES',
  REAL_SITUATIONS = 'REAL_SITUATIONS',
  ECO_DRIVING = 'ECO_DRIVING',
  SAFETY = 'SAFETY',
  BEHAVIORS = 'BEHAVIORS',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum UserRole {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  TRIALING = 'TRIALING',
  NONE = 'NONE',
}

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

// ============================================================
// CORE ENTITIES
// ============================================================

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: UserRole
  // Gamification
  xp: number
  level: number
  streak: number
  longestStreak: number
  lastActivityAt: Date | null
  // Stats
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  totalExamsTaken: number
  totalExamsPassed: number
  // Subscription
  subscriptionStatus: SubscriptionStatus
  subscriptionEndsAt: Date | null
  stripeCustomerId: string | null
  // Metadata
  createdAt: Date
  updatedAt: Date
  // Relations
  progress?: UserProgress[]
  badges?: UserBadge[]
}

export interface Answer {
  id: string
  text: string
  isCorrect: boolean
  // Optional detailed explanation for why this answer is correct/incorrect
  rationale?: string
}

export interface QuestionMetadata {
  source?: string // e.g., "VCS Art. 32" (Swiss road traffic law article)
  year?: number
  isOfficial?: boolean
  timesAnswered?: number
  correctRate?: number
  reportCount?: number
}

export interface Question {
  id: string
  text: string
  imageUrl: string | null
  answers: Answer[]
  correctAnswerId: string
  explanation: string
  category: QuestionCategory
  difficulty: Difficulty
  tags: string[]
  metadata: QuestionMetadata
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================
// SESSION & EXAM
// ============================================================

export interface SessionAnswer {
  questionId: string
  answeredId: string
  isCorrect: boolean
  timeSpentMs: number
  answeredAt: Date
}

export interface Session {
  id: string
  userId: string
  type: 'PRACTICE' | 'EXAM' | 'CATEGORY'
  status: SessionStatus
  category: QuestionCategory | null // null = all categories (exam mode)
  questions: Question[]
  answers: SessionAnswer[]
  // Results (populated when status = COMPLETED)
  score: number | null // 0–1 (e.g., 0.85 = 85%)
  passed: boolean | null
  totalQuestions: number
  correctCount: number
  timeSpentMs: number | null
  xpEarned: number
  startedAt: Date
  completedAt: Date | null
}

export interface ExamResult {
  sessionId: string
  score: number // 0–1
  passed: boolean
  totalQuestions: number
  correctCount: number
  wrongCount: number
  timeSpentMs: number
  xpEarned: number
  categoryBreakdown: CategoryScore[]
  wrongQuestions: QuestionWithUserAnswer[]
}

export interface CategoryScore {
  category: QuestionCategory
  total: number
  correct: number
  score: number // 0–1
}

export interface QuestionWithUserAnswer {
  question: Question
  userAnswerId: string
  isCorrect: boolean
}

// ============================================================
// USER PROGRESS
// ============================================================

export interface UserProgress {
  id: string
  userId: string
  category: QuestionCategory
  // Cumulative stats
  totalAnswered: number
  totalCorrect: number
  masteryScore: number // 0–1, computed from recent performance
  lastPracticed: Date | null
  // Spaced repetition
  nextReviewAt: Date | null
  reviewInterval: number // days
}

export interface OverallStats {
  userId: string
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  globalAccuracy: number // 0–1
  totalExamsTaken: number
  totalExamsPassed: number
  examPassRate: number // 0–1
  currentStreak: number
  longestStreak: number
  totalXp: number
  level: number
  xpToNextLevel: number
  categoryProgress: UserProgress[]
  weakestCategories: QuestionCategory[]
  strongestCategories: QuestionCategory[]
  averageExamScore: number
}

// ============================================================
// AI ASSISTANT
// ============================================================

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
  // Optional: links to a question context
  questionId?: string
  isStreaming?: boolean
}

export interface ChatConversation {
  id: string
  userId: string
  messages: ChatMessage[]
  questionContext?: Question
  createdAt: Date
  updatedAt: Date
}

export interface AIExplanation {
  questionId: string
  question: Question
  explanation: string
  legalReference: string | null // e.g. "LCR Art. 27, OCR Art. 74"
  examples: string[]
  mnemonicTip: string | null
  relatedCategories: QuestionCategory[]
  generatedAt: Date
  model: string // e.g. "gpt-4o"
  tokensUsed?: number
}

export interface AIUsageQuota {
  userId: string
  date: string // ISO date string "2024-01-15"
  questionsAsked: number
  maxAllowed: number
  resetsAt: Date
}

// ============================================================
// BADGES & ACHIEVEMENTS
// ============================================================

export type BadgeConditionType =
  | 'streak'
  | 'total_questions'
  | 'category_mastery'
  | 'exam_passed'
  | 'exam_perfect'
  | 'level'
  | 'total_xp'
  | 'speed_answer'
  | 'consecutive_correct'

export interface BadgeCondition {
  type: BadgeConditionType
  value: number
  category?: QuestionCategory
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string // emoji or icon name
  color: string // hex color
  condition: BadgeCondition
  xpReward: number
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
}

export interface UserBadge {
  badgeId: string
  badge: Badge
  userId: string
  earnedAt: Date
  isNew: boolean // flag until user acknowledges it
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number // current progress (0..target)
  target: number
  completed: boolean
  completedAt: Date | null
  xpReward: number
}

// ============================================================
// SUBSCRIPTION & PAYMENTS
// ============================================================

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceMonthly: number | null
  priceAnnual: number | null
  currency: 'CHF'
  stripePriceIdMonthly: string | null
  stripePriceIdAnnual: string | null
  features: string[]
  isPopular: boolean
}

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: SubscriptionStatus
  plan: 'PREMIUM'
  interval: 'monthly' | 'annual'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
  trialEnd: Date | null
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================================
// MISC / UTILITY TYPES
// ============================================================

export type ID = string

export type DateString = string // ISO 8601

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
