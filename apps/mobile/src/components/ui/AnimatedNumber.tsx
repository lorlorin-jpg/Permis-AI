import React, { useEffect, useRef } from 'react'
import { Animated, Text, TextStyle } from 'react-native'

interface AnimatedNumberProps {
  value: number
  duration?: number
  style?: TextStyle
  prefix?: string
  suffix?: string
  decimals?: number
}

export function AnimatedNumber({ value, duration = 800, style, prefix = '', suffix = '', decimals = 0 }: AnimatedNumberProps) {
  const animValue = useRef(new Animated.Value(0)).current
  const prevValue = useRef(0)
  const [displayed, setDisplayed] = React.useState(value)

  useEffect(() => {
    const from = prevValue.current
    animValue.setValue(from)

    const listener = animValue.addListener(({ value: v }) => {
      setDisplayed(Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals))
    })

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start(() => {
      prevValue.current = value
    })

    return () => animValue.removeListener(listener)
  }, [value])

  return (
    <Text style={style}>
      {prefix}{decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed)}{suffix}
    </Text>
  )
}
