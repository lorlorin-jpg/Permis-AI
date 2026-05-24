import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================================
// HELPERS
// ============================================================

function formatTime(seconds: number): string {
  const totalSeconds = Math.max(0, seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ============================================================
// HOOK
// ============================================================

export interface UseCountdownReturn {
  timeLeft: number
  formatted: string
  isExpired: boolean
  pause: () => void
  resume: () => void
  reset: (newSeconds?: number) => void
}

export function useCountdown(
  initialSeconds: number,
  onExpire?: () => void,
): UseCountdownReturn {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const onExpireRef = useRef(onExpire)
  const hasExpiredRef = useRef(false)

  // Keep the callback ref fresh without restarting the interval
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    hasExpiredRef.current = false
    setTimeLeft(initialSeconds)
  }, [initialSeconds])

  useEffect(() => {
    if (isPaused) return
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1
        if (next <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true
          // Call onExpire asynchronously to avoid state updates during render
          setTimeout(() => {
            onExpireRef.current?.()
          }, 0)
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, timeLeft])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])
  const reset = useCallback((newSeconds?: number) => {
    hasExpiredRef.current = false
    setTimeLeft(newSeconds ?? initialSeconds)
    setIsPaused(false)
  }, [initialSeconds])

  return {
    timeLeft,
    formatted: formatTime(timeLeft),
    isExpired: timeLeft <= 0,
    pause,
    resume,
    reset,
  }
}
