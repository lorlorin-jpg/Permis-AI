import React, { useEffect, useRef } from 'react'
import { Animated, Text, StyleSheet, View } from 'react-native'
import { COLORS } from '@/constants/theme'

// ============================================================
// TYPES
// ============================================================

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
  onHide?: () => void
  /** Delay in ms before auto-dismiss. Default 3000. */
  duration?: number
}

// ============================================================
// COMPONENT
// ============================================================

export function Toast({ message, type = 'info', visible, onHide, duration = 3000 }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Slide in + fade in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      const timer = setTimeout(() => {
        // Slide out + fade out
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide?.())
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration])

  const bgColor =
    type === 'success'
      ? COLORS.success
      : type === 'error'
      ? COLORS.error
      : type === 'warning'
      ? COLORS.warning
      : COLORS.primary

  const icon =
    type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColor, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
})

export default Toast
