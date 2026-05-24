import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'premium'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-700 text-neutral-200',
  success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  info: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  premium: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-violet-300 border border-violet-500/30',
}

export interface BadgeProps {
  label: string
  variant?: BadgeVariant
  icon?: React.ReactNode
  className?: string
}

export function Badge({ label, variant = 'default', icon, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <span className="shrink-0 w-3.5 h-3.5">{icon}</span>}
      {label}
    </span>
  )
}
