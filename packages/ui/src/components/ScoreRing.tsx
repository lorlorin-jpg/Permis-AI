import React from 'react'

export interface ScoreRingProps {
  score: number       // 0–1 (e.g., 0.85 = 85%)
  size?: number       // diameter in px (default 120)
  strokeWidth?: number
  label?: string
  sublabel?: string
  className?: string
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className = '',
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedScore = Math.min(1, Math.max(0, score))
  const dashOffset = circumference * (1 - clampedScore)
  const percentage = Math.round(clampedScore * 100)

  // Color based on score (matches semantic palette)
  const strokeColor =
    clampedScore >= 0.8
      ? '#10B981' // success
      : clampedScore >= 0.6
        ? '#F59E0B' // warning
        : '#EF4444' // error

  const displayLabel = label ?? `${percentage}%`

  return (
    <div className={['relative inline-flex items-center justify-center', className].join(' ')}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-label={`Score: ${percentage}%`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold text-white leading-none"
          style={{ fontSize: size * 0.18 }}
        >
          {displayLabel}
        </span>
        {sublabel && (
          <span
            className="text-neutral-400 leading-none mt-1"
            style={{ fontSize: size * 0.1 }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
