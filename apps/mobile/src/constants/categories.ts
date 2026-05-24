import { QuestionCategory } from '@permis-ai/shared'

export interface CategoryDefinition {
  key: QuestionCategory
  label: string
  icon: string
  color: string
  description: string
  questionCount: number
}

export const CATEGORIES: Record<QuestionCategory, CategoryDefinition> = {
  [QuestionCategory.SIGNS]: {
    key: QuestionCategory.SIGNS,
    label: 'Panneaux',
    icon: 'triangle-alert',
    color: '#F59E0B',
    description: 'Panneaux de signalisation routière',
    questionCount: 150,
  },
  [QuestionCategory.PRIORITY]: {
    key: QuestionCategory.PRIORITY,
    label: 'Priorités',
    icon: 'git-merge',
    color: '#6366F1',
    description: 'Règles de priorité aux intersections',
    questionCount: 120,
  },
  [QuestionCategory.HIGHWAY]: {
    key: QuestionCategory.HIGHWAY,
    label: 'Autoroute',
    icon: 'navigation',
    color: '#8B5CF6',
    description: "Règles spécifiques à l'autoroute",
    questionCount: 80,
  },
  [QuestionCategory.SPEED_LIMITS]: {
    key: QuestionCategory.SPEED_LIMITS,
    label: 'Vitesses',
    icon: 'gauge',
    color: '#EC4899',
    description: 'Limites de vitesse',
    questionCount: 90,
  },
  [QuestionCategory.ALCOHOL]: {
    key: QuestionCategory.ALCOHOL,
    label: 'Alcool',
    icon: 'wine',
    color: '#EF4444',
    description: 'Alcool & drogues au volant',
    questionCount: 70,
  },
  [QuestionCategory.DISTANCES]: {
    key: QuestionCategory.DISTANCES,
    label: 'Distances',
    icon: 'ruler',
    color: '#10B981',
    description: 'Distances de sécurité',
    questionCount: 80,
  },
  [QuestionCategory.REAL_SITUATIONS]: {
    key: QuestionCategory.REAL_SITUATIONS,
    label: 'Situations',
    icon: 'map',
    color: '#06B6D4',
    description: 'Situations réelles de conduite',
    questionCount: 200,
  },
  [QuestionCategory.ECO_DRIVING]: {
    key: QuestionCategory.ECO_DRIVING,
    label: 'Éco-conduite',
    icon: 'leaf',
    color: '#22C55E',
    description: 'Conduite économique et écologique',
    questionCount: 60,
  },
  [QuestionCategory.SAFETY]: {
    key: QuestionCategory.SAFETY,
    label: 'Sécurité',
    icon: 'shield',
    color: '#F97316',
    description: 'Sécurité passive et active',
    questionCount: 80,
  },
  [QuestionCategory.BEHAVIORS]: {
    key: QuestionCategory.BEHAVIORS,
    label: 'Comportements',
    icon: 'users',
    color: '#A855F7',
    description: 'Comportements au volant',
    questionCount: 70,
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
