import Svg, { Defs, Pattern, Rect, RadialGradient, Stop } from 'react-native-svg'
import { StyleSheet, View } from 'react-native'

interface CrtOverlayProps {
  width: number
  height: number
}

// CRT 모니터 효과: 스캔라인 + 비네트
export const CrtOverlay = ({ width, height }: CrtOverlayProps) => (
  <View style={styles.container} pointerEvents="none">
    <Svg width={width} height={height}>
      <Defs>
        {/* 스캔라인 패턴: 2px 어두운 줄 + 2px 밝은 줄 반복 */}
        <Pattern id="scanlines" width={1} height={4} patternUnits="userSpaceOnUse">
          <Rect width={1} height={2} fill="rgba(0,0,0,0.15)" />
          <Rect y={2} width={1} height={2} fill="rgba(0,0,0,0.02)" />
        </Pattern>

        {/* 비네트: 중앙 투명 → 가장자리 어두움 */}
        <RadialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="black" stopOpacity={0} />
          <Stop offset="70%" stopColor="black" stopOpacity={0} />
          <Stop offset="90%" stopColor="black" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="black" stopOpacity={0.35} />
        </RadialGradient>
      </Defs>

      {/* 스캔라인 적용 */}
      <Rect width={width} height={height} fill="url(#scanlines)" />

      {/* 비네트 적용 */}
      <Rect width={width} height={height} fill="url(#vignette)" />
    </Svg>
  </View>
)

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
})
