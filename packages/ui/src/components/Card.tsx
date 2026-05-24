import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  padded?: boolean
  bordered?: boolean
}

export function Card({
  elevated = false,
  padded = true,
  bordered = true,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl',
        elevated ? 'bg-neutral-800' : 'bg-neutral-900',
        padded ? 'p-4 md:p-6' : '',
        bordered ? 'border border-neutral-700/50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4 mb-4', className].join(' ')}>
      <div>
        <h3 className="text-white font-semibold text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-neutral-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
