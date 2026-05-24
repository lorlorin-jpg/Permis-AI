import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/openai'
import type { QuestionCategory } from '@prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SimilarQuestion {
  id: string
  text: string
  explanation: string
  category: QuestionCategory
  difficulty: string
  similarity: number
}

export interface RAGContext {
  questions: SimilarQuestion[]
  contextString: string
  totalTokensEstimate: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Cosine similarity (computed in JS since pgvector may not be available)
// ─────────────────────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) return 0
  return dot / denominator
}

// ─────────────────────────────────────────────────────────────────────────────
// Search similar questions by embedding similarity
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search for questions similar to a natural language query using vector similarity.
 *
 * @param query  - Natural language search query
 * @param limit  - Maximum number of results to return
 * @param categoryFilter - Optional category to filter results
 * @param minSimilarity  - Minimum cosine similarity threshold (0–1)
 */
export async function searchSimilarQuestions(
  query: string,
  limit: number = 5,
  categoryFilter?: QuestionCategory,
  minSimilarity: number = 0.6
): Promise<SimilarQuestion[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query)

  // Fetch questions with embeddings
  const questions = await prisma.question.findMany({
    where: {
      isPublished: true,
      ...(categoryFilter ? { category: categoryFilter } : {}),
      // Only fetch questions that have embeddings stored
      NOT: { embeddings: { isEmpty: true } },
    },
    select: {
      id: true,
      text: true,
      explanation: true,
      category: true,
      difficulty: true,
      embeddings: true,
    },
    take: 500, // Cap the scan to avoid memory issues
  })

  // Compute similarity scores
  const scored = questions
    .map((q) => ({
      id: q.id,
      text: q.text,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty,
      similarity: cosineSimilarity(queryEmbedding, q.embeddings),
    }))
    .filter((q) => q.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return scored
}

// ─────────────────────────────────────────────────────────────────────────────
// Build context string from a list of question IDs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch questions by IDs and build a formatted context string for the LLM.
 *
 * @param questionIds - Array of question IDs to include
 */
export async function buildContext(questionIds: string[]): Promise<string> {
  if (questionIds.length === 0) return ''

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds }, isPublished: true },
    include: {
      answers: {
        select: { text: true, isCorrect: true },
      },
    },
  })

  const contextParts = questions.map((q, index) => {
    const correctAnswer = q.answers.find((a) => a.isCorrect)
    return [
      `[Question ${index + 1}]`,
      `Catégorie : ${q.category}`,
      `Difficulté : ${q.difficulty}`,
      `Question : ${q.text}`,
      `Bonne réponse : ${correctAnswer?.text ?? 'N/A'}`,
      `Explication : ${q.explanation}`,
    ].join('\n')
  })

  return contextParts.join('\n\n---\n\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Get relevant Swiss driving rules for a topic
// ─────────────────────────────────────────────────────────────────────────────

// Curated rule database — in production this would be stored in Postgres
const SWISS_DRIVING_RULES: Record<string, string[]> = {
  SIGNS: [
    'Les panneaux suisses suivent les normes de la Convention de Vienne.',
    'Les panneaux sur fond jaune sont temporaires (travaux, déviations).',
    "La croix blanche sur fond rouge est le symbole de la Suisse — utilisée sur certains panneaux d'information.",
    "Les panneaux d'interdiction sont ronds avec bordure rouge.",
    "Les panneaux d'obligation sont ronds avec fond bleu.",
    'Les panneaux de danger sont triangulaires avec bordure rouge.',
    'Les panneaux d\'indication sont carrés ou rectangulaires avec fond bleu ou vert.',
  ],
  PRIORITY: [
    'Règle générale : priorité à droite à tous les carrefours non réglementés (Art. 36 LCR).',
    'Les routes signalées par un panneau "route principale" bénéficient de la priorité.',
    "Les véhicules sur route principale ont priorité sur ceux venant d'une route secondaire.",
    'Les tramways ont toujours la priorité sur les autres véhicules.',
    "Les piétons sur les passages piétons ont la priorité — s'arrêter si nécessaire.",
    "Dans les giratoires, priorité aux véhicules déjà dans le giratoire (sauf indication contraire).",
    'Les véhicules d\'urgence (gyrophare + sirène) ont priorité absolue.',
  ],
  HIGHWAY: [
    'Vitesse maximale sur autoroute : 120 km/h (Art. 4a OCR).',
    'Vignette autoroutière obligatoire — valable du 1er décembre au 31 janvier de l\'année suivante.',
    'Interdite aux véhicules dont la vitesse maximale est inférieure à 45 km/h.',
    'Dépassement uniquement à gauche sur autoroute.',
    'Distance de sécurité minimale : 2 secondes (ou distance = vitesse / 2 en mètres).',
    'Arrêt sur la bande d\'arrêt d\'urgence uniquement en cas de nécessité absolue.',
    "En cas d'accident ou panne : triangle de signalisation à 100m minimum, gilet jaune obligatoire.",
    'Vitesse minimale recommandée pour maintenir la fluidité du trafic.',
  ],
  SPEED_LIMITS: [
    'En localité : 50 km/h (Art. 4a OCR).',
    'Zone 30 : 30 km/h, priorité aux piétons et cyclistes.',
    'Zone de rencontre : 20 km/h, priorité aux piétons.',
    'Hors localité (route principale) : 80 km/h.',
    'Semi-autoroute (double chaussée) : 100 km/h.',
    'Autoroute : 120 km/h.',
    'Par mauvais temps (neige, verglas, pluie forte) : réduire la vitesse.',
    'Conducteurs en période probatoire : infractions à la vitesse peuvent annuler le permis à l\'essai.',
  ],
  ALCOHOL: [
    'Taux d\'alcoolémie maximum pour conducteurs ordinaires : 0.50‰ (Art. 55 LCR).',
    'Conducteurs à l\'essai (permis < 3 ans) : 0.10‰ (tolérance zéro en pratique).',
    'Conducteurs professionnels (transport public, taxi, camion) : 0.10‰.',
    'Sanctions : amende, retrait de permis, voire emprisonnement selon le taux et les circonstances.',
    'Drogues et médicaments altérant la conduite : interdits au même titre que l\'alcool.',
    'Refus de test d\'alcoolémie : assimilé à un résultat positif et sanctionné sévèrement.',
  ],
  DISTANCES: [
    'Règle des 2 secondes pour la distance de sécurité en temps normal.',
    'Par mauvais temps : appliquer la règle des 4 secondes.',
    'En tunnel : doubler la distance de sécurité habituelle.',
    'Distance de sécurité = vitesse (km/h) / 2 en mètres (ex: 80 km/h → 40m minimum).',
    'Dépassement : prévoir un espace suffisant pour dépasser et se rabattre sans danger.',
    "Distance latérale avec cyclistes : minimum 1.5 mètre en agglomération, 2 mètres hors agglomération.",
  ],
  REAL_SITUATIONS: [
    'Croisement en côte : le véhicule descendant doit céder la place (Art. 35 OCR).',
    'Tunnels : allumer les feux, maintenir la distance, rouler lentement.',
    'Passages à niveau : s\'arrêter à temps si le signal clignote, ne jamais slalomer entre les barrières.',
    'Verglas/neige : équiper le véhicule (chaînes ou pneus hiver), réduire fortement la vitesse.',
    'Éblouissement par le soleil : utiliser le pare-soleil, adapter la vitesse.',
    'Pluie intense : risque d\'aquaplaning — lever le pied, pas de freinage brusque.',
    'Brouillard : feux de brouillard si visibilité < 50m, vitesse réduite, distance accrue.',
  ],
  ECO_DRIVING: [
    'Anticipation : prévoir les situations pour éviter freinages et accélérations brusques.',
    'Vitesse constante : utiliser le régulateur de vitesse sur autoroute pour réduire la consommation.',
    'Montée en régime progressive : passer les vitesses tôt pour rester dans les bas régimes.',
    'Moteur éteint lors d\'arrêts > 1 minute (si équipé du stop-start ou manuellement).',
    'Pression des pneus : une pression correcte réduit la consommation et améliore la sécurité.',
    'Clim avec modération : l\'air conditionné augmente la consommation de 5 à 20%.',
    'Planification d\'itinéraire : éviter les embouteillages réduit la consommation et le stress.',
  ],
  SAFETY: [
    'Ceinture de sécurité obligatoire pour tous les passagers, toutes places (Art. 3a OCR).',
    'Enfants jusqu\'à 12 ans ou 150 cm : siège auto homologué obligatoire.',
    'Casque de moto : obligatoire pour conducteur et passager de deux-roues motorisés.',
    'Téléphone au volant : interdit sans système mains-libres (Art. 3 OCR).',
    'Fatigue au volant : autant de risque que l\'alcool — faire des pauses toutes les 2 heures.',
    'Surcharge du véhicule : risque de perte de contrôle, sanction légale.',
  ],
  BEHAVIORS: [
    'Comportement courtois : s\'il s\'agit d\'une règle non-claire, la courtoisie l\'emporte.',
    'Signaux lumineux d\'avertissement : usage réglementé, pas pour exprimer l\'impatience.',
    'Klaxon : uniquement pour avertir d\'un danger immédiat, interdit la nuit en agglomération.',
    'Cédez le passage : obligation absolue de s\'arrêter si nécessaire.',
    'Arrêt et stationnement : respecter les règles de distance (bouches d\'incendie, passages piétons, etc.).',
    'Marche arrière : interdite sur autoroute et voie rapide, dangereuse sans vérification des angles morts.',
  ],
}

/**
 * Get curated Swiss driving rules relevant to a specific topic or category.
 *
 * @param topic - Category name or free-text topic to look up
 */
export async function getRelevantRules(topic: string): Promise<string[]> {
  const upperTopic = topic.toUpperCase() as keyof typeof SWISS_DRIVING_RULES

  // Direct category match
  if (SWISS_DRIVING_RULES[upperTopic]) {
    return SWISS_DRIVING_RULES[upperTopic]
  }

  // Fuzzy match: find the most relevant category
  const topicLower = topic.toLowerCase()
  const keywords: Record<string, keyof typeof SWISS_DRIVING_RULES> = {
    panneau: 'SIGNS',
    signal: 'SIGNS',
    priorité: 'PRIORITY',
    giratoire: 'PRIORITY',
    autoroute: 'HIGHWAY',
    vitesse: 'SPEED_LIMITS',
    limite: 'SPEED_LIMITS',
    alcool: 'ALCOHOL',
    alcoolémie: 'ALCOHOL',
    distance: 'DISTANCES',
    sécurité: 'DISTANCES',
    tunnel: 'REAL_SITUATIONS',
    situation: 'REAL_SITUATIONS',
    écologique: 'ECO_DRIVING',
    consommation: 'ECO_DRIVING',
    ceinture: 'SAFETY',
    enfant: 'SAFETY',
    comportement: 'BEHAVIORS',
    stationnement: 'BEHAVIORS',
  }

  for (const [keyword, category] of Object.entries(keywords)) {
    if (topicLower.includes(keyword)) {
      return SWISS_DRIVING_RULES[category]
    }
  }

  // Return a broad set of general rules if no match found
  return [
    ...SWISS_DRIVING_RULES.PRIORITY.slice(0, 2),
    ...SWISS_DRIVING_RULES.SPEED_LIMITS.slice(0, 2),
    ...SWISS_DRIVING_RULES.SAFETY.slice(0, 2),
    ...SWISS_DRIVING_RULES.ALCOHOL.slice(0, 1),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Full RAG pipeline: query → similar questions → build context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full RAG pipeline: search similar questions for a query and build the context.
 *
 * @param query    - User's question or topic
 * @param limit    - Max similar questions to retrieve
 * @param category - Optional category filter
 */
export async function buildRAGContext(
  query: string,
  limit: number = 5,
  category?: QuestionCategory
): Promise<RAGContext> {
  const [similarQuestions, relevantRules] = await Promise.all([
    searchSimilarQuestions(query, limit, category),
    getRelevantRules(category ?? query),
  ])

  const questionIds = similarQuestions.map((q) => q.id)
  const questionContext = await buildContext(questionIds)

  const rulesContext =
    relevantRules.length > 0
      ? `## Règles applicables\n${relevantRules.map((r) => `- ${r}`).join('\n')}`
      : ''

  const contextString = [rulesContext, questionContext].filter(Boolean).join('\n\n')

  // Rough token estimate: ~4 chars per token
  const totalTokensEstimate = Math.ceil(contextString.length / 4)

  return {
    questions: similarQuestions,
    contextString,
    totalTokensEstimate,
  }
}
