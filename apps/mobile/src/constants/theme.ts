// ============================================================
// DESIGN SYSTEM — Permis AI
// Dark theme, 8px grid, Indigo/Violet palette
// ============================================================

// ── Colors ──────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  background: '#0F0F0F',

  // Surfaces
  surface: {
    base: '#1A1A1A',      // cards, panels
    elevated: '#242424',  // elevated surfaces, inputs
    overlay: '#2E2E2E',   // tooltips, popovers
  },

  // Kept for backward-compat (used extensively across screens)
  card: '#1A1A1A',
  elevated: '#242424',
  border: '#2A2A2A',

  // Brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',
  accent: '#EC4899',

  // Semantic
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  info: '#06B6D4',

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#71717A',
    disabled: '#3F3F46',
    inverse: '#0F0F0F',
  },

  // Kept for backward-compat
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const

// ── Gradients ───────────────────────────────────────────────
export const GRADIENTS = {
  primary: ['#6366F1', '#8B5CF6'] as [string, string],
  hero: ['#6366F1', '#8B5CF6', '#EC4899'] as [string, string, string],
  success: ['#10B981', '#059669'] as [string, string],
  danger: ['#EF4444', '#DC2626'] as [string, string],
  warning: ['#F59E0B', '#D97706'] as [string, string],
  subtle: ['rgba(99,102,241,0.15)', 'transparent'] as [string, string],
} as const

// ── Spacing — 4px base, 8px grid ────────────────────────────
// Numeric index mirrors Tailwind (1 = 4px, 2 = 8px, …)
export const SPACING = {
  // Named (backward-compat)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Indexed (new — use these going forward)
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const

// ── Typography ───────────────────────────────────────────────
export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const

// ── Font Sizes (backward-compat) ─────────────────────────────
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

// ── Border Radius ────────────────────────────────────────────
export const RADIUS = {
  // Backward-compat names
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,

  // Token names (aligns with prompt spec)
  '2': 4,
  '4': 8,
  '6': 12,
  '8': 16,
  '10': 20,
  '12': 24,
} as const

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const

// ── Shadows (dark theme) ─────────────────────────────────────
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: 'rgba(255,255,255,0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(255,255,255,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(255,255,255,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: 'rgba(255,255,255,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
  },
  colored: {
    primary: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    success: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    error: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },
} as const

// ── Animations ────────────────────────────────────────────────
export const ANIMATIONS = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  springs: {
    bouncy: { damping: 8, stiffness: 300 },
    smooth: { damping: 15, stiffness: 200 },
    stiff: { damping: 20, stiffness: 400 },
  },
} as const
