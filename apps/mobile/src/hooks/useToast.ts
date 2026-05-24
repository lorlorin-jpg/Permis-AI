import { useState, useCallback } from 'react'

// ============================================================
// TYPES
// ============================================================

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

// ============================================================
// HOOK
// ============================================================

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  })

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Reset then show (handles rapid successive calls)
    setToast({ message: '', type, visible: false })
    // Small tick ensures animation re-triggers if same message fires twice
    requestAnimationFrame(() => {
      setToast({ message, type, visible: true })
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast])
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast])
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast])

  return { toast, showToast, hideToast, showSuccess, showError, showWarning }
}
