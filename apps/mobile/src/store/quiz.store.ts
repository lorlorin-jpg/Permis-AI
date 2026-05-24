import { create } from 'zustand'
import { Question, Session, QuestionCategory } from '@permis-ai/shared'

export type AnswerState = 'default' | 'selected' | 'correct' | 'wrong'

export interface QuestionAnswerResult {
  questionId: string
  selectedAnswerId: string
  correctAnswerId: string
  isCorrect: boolean
  timeSpentMs: number
  answeredAt: Date
}

interface QuizStore {
  // Session state
  currentSession: Session | null
  questions: Question[]
  currentQuestionIndex: number

  // Answer tracking
  answers: Map<string, QuestionAnswerResult>
  selectedAnswerId: string | null // currently highlighted answer (before submit)
  isCurrentAnswerSubmitted: boolean

  // Timer
  timeRemaining: number | null // seconds
  sessionStartTime: number | null
  questionStartTime: number | null

  // UI state
  showExplanationSheet: boolean
  isSessionComplete: boolean
  xpEarned: number

  // Actions
  setSession: (session: Session) => void
  setQuestions: (questions: Question[]) => void
  selectAnswer: (answerId: string) => void
  submitAnswer: () => QuestionAnswerResult | null
  nextQuestion: () => void
  setTimeRemaining: (seconds: number) => void
  decrementTimer: () => void
  showExplanation: () => void
  hideExplanation: () => void
  completeSession: () => void
  reset: () => void

  // Computed
  getCurrentQuestion: () => Question | null
  getAnswerForCurrentQuestion: () => QuestionAnswerResult | null
  getProgress: () => { current: number; total: number; percentage: number }
  getScore: () => { correct: number; total: number; percentage: number }
}

export const useQuizStore = create<QuizStore>()((set, get) => ({
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  selectedAnswerId: null,
  isCurrentAnswerSubmitted: false,
  timeRemaining: null,
  sessionStartTime: null,
  questionStartTime: null,
  showExplanationSheet: false,
  isSessionComplete: false,
  xpEarned: 0,

  setSession: (session) =>
    set({
      currentSession: session,
      questions: session.questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      selectedAnswerId: null,
      isCurrentAnswerSubmitted: false,
      sessionStartTime: Date.now(),
      questionStartTime: Date.now(),
      isSessionComplete: false,
      xpEarned: 0,
    }),

  setQuestions: (questions) => set({ questions }),

  selectAnswer: (answerId) => {
    const { isCurrentAnswerSubmitted } = get()
    if (isCurrentAnswerSubmitted) return
    set({ selectedAnswerId: answerId })
  },

  submitAnswer: () => {
    const {
      selectedAnswerId,
      questions,
      currentQuestionIndex,
      answers,
      questionStartTime,
      isCurrentAnswerSubmitted,
    } = get()

    if (!selectedAnswerId || isCurrentAnswerSubmitted) return null

    const question = questions[currentQuestionIndex]
    if (!question) return null

    const isCorrect = selectedAnswerId === question.correctAnswerId
    const timeSpentMs = questionStartTime ? Date.now() - questionStartTime : 0

    const result: QuestionAnswerResult = {
      questionId: question.id,
      selectedAnswerId,
      correctAnswerId: question.correctAnswerId,
      isCorrect,
      timeSpentMs,
      answeredAt: new Date(),
    }

    const newAnswers = new Map(answers)
    newAnswers.set(question.id, result)

    // Calculate XP earned so far
    const correctCount = Array.from(newAnswers.values()).filter((a) => a.isCorrect).length
    const xpEarned = correctCount * 10

    set({
      answers: newAnswers,
      isCurrentAnswerSubmitted: true,
      xpEarned,
    })

    return result
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get()
    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= questions.length) {
      set({ isSessionComplete: true })
      return
    }

    set({
      currentQuestionIndex: nextIndex,
      selectedAnswerId: null,
      isCurrentAnswerSubmitted: false,
      showExplanationSheet: false,
      questionStartTime: Date.now(),
    })
  },

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  decrementTimer: () => {
    const { timeRemaining } = get()
    if (timeRemaining === null) return
    if (timeRemaining <= 0) {
      set({ isSessionComplete: true, timeRemaining: 0 })
      return
    }
    set({ timeRemaining: timeRemaining - 1 })
  },

  showExplanation: () => set({ showExplanationSheet: true }),
  hideExplanation: () => set({ showExplanationSheet: false }),

  completeSession: () => set({ isSessionComplete: true }),

  reset: () =>
    set({
      currentSession: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      selectedAnswerId: null,
      isCurrentAnswerSubmitted: false,
      timeRemaining: null,
      sessionStartTime: null,
      questionStartTime: null,
      showExplanationSheet: false,
      isSessionComplete: false,
      xpEarned: 0,
    }),

  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get()
    return questions[currentQuestionIndex] ?? null
  },

  getAnswerForCurrentQuestion: () => {
    const { answers, questions, currentQuestionIndex } = get()
    const question = questions[currentQuestionIndex]
    if (!question) return null
    return answers.get(question.id) ?? null
  },

  getProgress: () => {
    const { currentQuestionIndex, questions } = get()
    const total = questions.length
    const current = currentQuestionIndex + 1
    return {
      current,
      total,
      percentage: total > 0 ? current / total : 0,
    }
  },

  getScore: () => {
    const { answers } = get()
    const total = answers.size
    const correct = Array.from(answers.values()).filter((a) => a.isCorrect).length
    return {
      correct,
      total,
      percentage: total > 0 ? correct / total : 0,
    }
  },
}))
