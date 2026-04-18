import { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLayout } from './constants'

interface ScanlinesProps {
  intensity?: number
}

export function Scanlines({ intensity = 0.04 }: ScanlinesProps) {
  const { screenH } = useLayout()

  const rows = useMemo(() => {
    const step = 3
    const count = Math.ceil(screenH / step)
    return Array.from({ length: count }, (_, i) => (
      <View
        key={i}
        style={{
          position: 'absolute',
          top: i * step,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: `rgba(0, 240, 255, ${intensity})`,
        }}
      />
    ))
  }, [screenH, intensity])

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {rows}
    </View>
  )
}
