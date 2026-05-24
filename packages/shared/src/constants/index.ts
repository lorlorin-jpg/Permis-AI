import { QuestionCategory, Difficulty, Badge } from '../types/index'

// ============================================================
// GAMIFICATION
// ============================================================

export const XP_PER_CORRECT_ANSWER = 10
export const XP_PER_STREAK_BONUS = 5
export const XP_PER_EXAM_PASSED = 100
export const XP_PER_EXAM_PERFECT = 250
export const XP_PER_BADGE_EARNED = 50

export const STREAK_BONUS_THRESHOLD = 3 // streak length before bonus kicks in
export const MAX_STREAK_MULTIPLIER = 3 // max 3× XP multiplier

/**
 * XP required to reach each level (index = level).
 * Level 1 = 0 XP, Level 2 = 100 XP, etc.
 */
export const XP_PER_LEVEL: number[] = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  1750,  // Level 6
  2750,  // Level 7
  4000,  // Level 8
  5500,  // Level 9
  7500,  // Level 10
  10000, // Level 11
  13000, // Level 12
  16500, // Level 13
  20500, // Level 14
  25000, // Level 15
]

export const MAX_LEVEL = XP_PER_LEVEL.length

/**
 * Returns the XP needed to reach the next level.
 */
export function xpToNextLevel(currentLevel: number, currentXp: number): number {
  if (currentLevel >= MAX_LEVEL) return 0
  return XP_PER_LEVEL[currentLevel] - currentXp
}

/**
 * Returns the level for a given total XP amount.
 */
export function levelForXp(totalXp: number): number {
  let level = 1
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXp >= XP_PER_LEVEL[i]) {
      level = i + 1
    } else {
      break
    }
  }
  return Math.min(level, MAX_LEVEL)
}

// ============================================================
// EXAM RULES
// ============================================================

export const EXAM_QUESTION_COUNT = 45
export const EXAM_TIME_MINUTES = 45
export const EXAM_TIME_SECONDS = EXAM_TIME_MINUTES * 60
export const PASSING_SCORE = 0.8 // 80% — 36/45 correct answers needed
export const PASSING_CORRECT_COUNT = Math.ceil(EXAM_QUESTION_COUNT * PASSING_SCORE) // 36

// ============================================================
// FREE TIER LIMITS
// ============================================================

export const MAX_FREE_EXAMS_PER_DAY = 2
export const MAX_FREE_AI_QUESTIONS_PER_DAY = 5
export const MAX_FREE_PRACTICE_QUESTIONS_PER_DAY = 50

// ============================================================
// QUESTION CATEGORIES (with French labels)
// ============================================================

export interface CategoryDefinition {
  key: QuestionCategory
  label: string          // French display name
  labelDe?: string       // German
  labelIt?: string       // Italian
  icon: string           // emoji
  description: string
  questionCount?: number // approximate
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    key: QuestionCategory.SIGNS,
    label: 'Panneaux de signalisation',
    labelDe: 'Verkehrszeichen',
    labelIt: 'Segnali stradali',
    icon: '🚸',
    description: 'Panneaux d\'interdiction, obligation, danger et indication.',
    questionCount: 150,
  },
  {
    key: QuestionCategory.PRIORITY,
    label: 'Priorités',
    labelDe: 'Vortritt',
    labelIt: 'Precedenza',
    icon: '🔀',
    description: 'Règles de priorité aux intersections, giratoires et passages piétons.',
    questionCount: 120,
  },
  {
    key: QuestionCategory.HIGHWAY,
    label: 'Autoroute',
    labelDe: 'Autobahn',
    labelIt: 'Autostrada',
    icon: '🛣️',
    description: 'Règles spécifiques à l\'autoroute, voies d\'accès et de sortie.',
    questionCount: 80,
  },
  {
    key: QuestionCategory.SPEED_LIMITS,
    label: 'Vitesses',
    labelDe: 'Geschwindigkeit',
    labelIt: 'Velocità',
    icon: '⚡',
    description: 'Limites de vitesse en localité, hors localité et sur autoroute.',
    questionCount: 90,
  },
  {
    key: QuestionCategory.ALCOHOL,
    label: 'Alcool & drogues',
    labelDe: 'Alkohol & Drogen',
    labelIt: 'Alcol & droghe',
    icon: '🍺',
    description: 'Taux légaux, effets sur la conduite et sanctions.',
    questionCount: 70,
  },
  {
    key: QuestionCategory.DISTANCES,
    label: 'Distances de sécurité',
    labelDe: 'Sicherheitsabstände',
    labelIt: 'Distanze di sicurezza',
    icon: '📏',
    description: 'Distance de freinage, d\'arrêt et de sécurité selon la vitesse.',
    questionCount: 80,
  },
  {
    key: QuestionCategory.REAL_SITUATIONS,
    label: 'Situations réelles',
    labelDe: 'Reale Situationen',
    labelIt: 'Situazioni reali',
    icon: '🛞',
    description: 'Mises en situation : comment réagir dans des cas concrets.',
    questionCount: 200,
  },
  {
    key: QuestionCategory.ECO_DRIVING,
    label: 'Éco-conduite',
    labelDe: 'Eco-Drive',
    labelIt: 'Eco-guida',
    icon: '🌿',
    description: 'Conduite économique, réduction des émissions et efficacité énergétique.',
    questionCount: 60,
  },
  {
    key: QuestionCategory.SAFETY,
    label: 'Sécurité',
    labelDe: 'Sicherheit',
    labelIt: 'Sicurezza',
    icon: '🦺',
    description: 'Ceinture de sécurité, sièges enfants, équipements obligatoires.',
    questionCount: 80,
  },
  {
    key: QuestionCategory.BEHAVIORS,
    label: 'Comportements',
    labelDe: 'Verhalten',
    labelIt: 'Comportamenti',
    icon: '🤝',
    description: 'Comportements civiques, conduite défensive et courtoisie.',
    questionCount: 70,
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<QuestionCategory, CategoryDefinition>

// ============================================================
// DIFFICULTY LABELS
// ============================================================

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Facile',
  [Difficulty.MEDIUM]: 'Moyen',
  [Difficulty.HARD]: 'Difficile',
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  [Difficulty.EASY]: '#10B981',   // success green
  [Difficulty.MEDIUM]: '#F59E0B', // warning amber
  [Difficulty.HARD]: '#EF4444',   // error red
}

// ============================================================
// BADGES
// ============================================================

export const BADGES: Badge[] = [
  // --- Streaks ---
  {
    id: 'streak_3',
    name: 'En feu !',
    description: 'Maintenez un streak de 3 jours consécutifs.',
    icon: '🔥',
    color: '#F59E0B',
    condition: { type: 'streak', value: 3 },
    xpReward: 30,
    rarity: 'COMMON',
  },
  {
    id: 'streak_7',
    name: 'Semaine parfaite',
    description: 'Maintenez un streak de 7 jours consécutifs.',
    icon: '🔥',
    color: '#EF4444',
    condition: { type: 'streak', value: 7 },
    xpReward: 75,
    rarity: 'RARE',
  },
  {
    id: 'streak_30',
    name: 'Mois de fer',
    description: 'Maintenez un streak de 30 jours consécutifs.',
    icon: '⚡',
    color: '#6366F1',
    condition: { type: 'streak', value: 30 },
    xpReward: 300,
    rarity: 'EPIC',
  },
  // --- Total questions ---
  {
    id: 'questions_50',
    name: 'Premier pas',
    description: 'Répondez à vos 50 premières questions.',
    icon: '🎯',
    color: '#10B981',
    condition: { type: 'total_questions', value: 50 },
    xpReward: 25,
    rarity: 'COMMON',
  },
  {
    id: 'questions_250',
    name: 'Studieux',
    description: 'Répondez à 250 questions au total.',
    icon: '📚',
    color: '#8B5CF6',
    condition: { type: 'total_questions', value: 250 },
    xpReward: 75,
    rarity: 'RARE',
  },
  {
    id: 'questions_1000',
    name: 'Expert théorique',
    description: 'Répondez à 1 000 questions au total.',
    icon: '🏆',
    color: '#F59E0B',
    condition: { type: 'total_questions', value: 1000 },
    xpReward: 200,
    rarity: 'EPIC',
  },
  {
    id: 'questions_5000',
    name: 'Maître du code',
    description: 'Répondez à 5 000 questions — vous connaissez le code mieux que vos examinateurs !',
    icon: '👑',
    color: '#EC4899',
    condition: { type: 'total_questions', value: 5000 },
    xpReward: 1000,
    rarity: 'LEGENDARY',
  },
  // --- Exam results ---
  {
    id: 'exam_first_pass',
    name: 'Reçu !',
    description: 'Réussissez votre premier examen blanc.',
    icon: '🎓',
    color: '#10B981',
    condition: { type: 'exam_passed', value: 1 },
    xpReward: 100,
    rarity: 'COMMON',
  },
  {
    id: 'exam_5_pass',
    name: 'Sur la bonne voie',
    description: 'Réussissez 5 examens blancs.',
    icon: '🚦',
    color: '#6366F1',
    condition: { type: 'exam_passed', value: 5 },
    xpReward: 150,
    rarity: 'RARE',
  },
  {
    id: 'exam_perfect',
    name: 'Perfection suisse',
    description: 'Obtenez 100% à un examen blanc. Chapeau !',
    icon: '💎',
    color: '#EC4899',
    condition: { type: 'exam_perfect', value: 1 },
    xpReward: 250,
    rarity: 'LEGENDARY',
  },
  // --- Levels ---
  {
    id: 'level_5',
    name: 'Apprenti conducteur',
    description: 'Atteignez le niveau 5.',
    icon: '🌟',
    color: '#F59E0B',
    condition: { type: 'level', value: 5 },
    xpReward: 50,
    rarity: 'COMMON',
  },
  {
    id: 'level_10',
    name: 'Conducteur confirmé',
    description: 'Atteignez le niveau 10.',
    icon: '⭐',
    color: '#8B5CF6',
    condition: { type: 'level', value: 10 },
    xpReward: 150,
    rarity: 'RARE',
  },
  {
    id: 'level_15',
    name: 'Maître de la route',
    description: 'Atteignez le niveau maximum. Vous êtes une légende.',
    icon: '🌠',
    color: '#6366F1',
    condition: { type: 'level', value: 15 },
    xpReward: 500,
    rarity: 'LEGENDARY',
  },
  // --- Consecutive correct ---
  {
    id: 'combo_10',
    name: 'Combo x10',
    description: 'Répondez correctement à 10 questions d\'affilée.',
    icon: '🎯',
    color: '#10B981',
    condition: { type: 'consecutive_correct', value: 10 },
    xpReward: 50,
    rarity: 'COMMON',
  },
  {
    id: 'combo_25',
    name: 'Combo x25',
    description: 'Répondez correctement à 25 questions d\'affilée.',
    icon: '🎯',
    color: '#6366F1',
    condition: { type: 'consecutive_correct', value: 25 },
    xpReward: 150,
    rarity: 'EPIC',
  },
]

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.id, b])) as Record<string, Badge>

// ============================================================
// SPEED LIMITS (Swiss legal values)
// ============================================================

export const SPEED_LIMITS = {
  IN_TOWN: 50,           // km/h — zone urbaine (LCR Art. 27)
  RURAL: 80,             // km/h — hors localité
  EXPRESSWAY: 100,       // km/h — semi-autoroute
  HIGHWAY: 120,          // km/h — autoroute
  RESIDENTIAL_ZONE: 20,  // km/h — zone résidentielle (30 if zone 30)
  ZONE_30: 30,           // km/h — zone 30
} as const

// ============================================================
// ALCOHOL LIMITS (Switzerland — LCR Art. 55)
// ============================================================

export const ALCOHOL_LIMITS = {
  STANDARD_DRIVER_BAC: 0.5,  // g/L blood — standard
  NOVICE_DRIVER_BAC: 0.1,    // g/L blood — first 3 years + professional drivers
  ZERO_TOLERANCE_BAC: 0.0,   // g/L blood — commercial passenger transport
} as const

// ============================================================
// MISCELLANEOUS APP CONSTANTS
// ============================================================

export const APP_NAME = 'Permis AI'
export const APP_SLUG = 'permis-ai'
export const APP_VERSION = '1.0.0'
export const SUPPORT_EMAIL = 'support@permis-ai.ch'

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code']
