import { View, Text, StyleSheet } from 'react-native'

interface NeonTextProps {
  text: string
  color: string
  fontSize: number
  fontFamily?: string
  letterSpacing?: number
  style?: object
}

// 3층 텍스트 중첩으로 강한 네온 글로우 효과
export const NeonText = ({ text, color, fontSize, fontFamily = 'PressStart2P', letterSpacing = 1, style }: NeonTextProps) => (
  <View style={[styles.container, style]}>
    {/* 3층: 넓은 외부 글로우 */}
    <Text style={[styles.base, {
      fontFamily, fontSize, letterSpacing,
      color: 'transparent',
      textShadowColor: color + '4D',
      textShadowRadius: 30,
    }]}>
      {text}
    </Text>
    {/* 2층: 중간 글로우 */}
    <Text style={[styles.base, styles.overlay, {
      fontFamily, fontSize, letterSpacing,
      color: 'transparent',
      textShadowColor: color + '99',
      textShadowRadius: 14,
    }]}>
      {text}
    </Text>
    {/* 1층: 밝은 코어 */}
    <Text style={[styles.base, styles.overlay, {
      fontFamily, fontSize, letterSpacing,
      color: '#FFFFFF',
      textShadowColor: color,
      textShadowRadius: 6,
    }]}>
      {text}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  container: { position: 'relative' },
  base: {
    textShadowOffset: { width: 0, height: 0 },
  },
  overlay: {
    position: 'absolute', top: 0, left: 0,
  },
})
