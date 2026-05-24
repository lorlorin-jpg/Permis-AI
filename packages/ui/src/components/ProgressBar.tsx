import React from 'react'

export interface ProgressBarProps {
  value: number        // 0–100
  max?: number         // defaults to 100
  label?: string
  showValue?: boolean
  color?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const colorStyles: Record<NonNullable<ProgressBarProps['color']>, string> = {
  primary: 'bg-indigo-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
}

const sizeStyles: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'primary',
  size = 'md',
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={['w-full', className].join(' ')}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-neutral-300">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-neutral-300 tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={['w-full bg-neutral-700 rounded-full overflow-hidden', sizeStyles[size]].join(' ')}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={[
            'h-full rounded-full transition-all duration-500 ease-out',
            colorStyles[color],
            animated ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
