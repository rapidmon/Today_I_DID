import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useLayout, COLORS } from './constants'
import { Scanlines } from './Scanlines'
import { sharedStyles } from './styles'

export function Slide4() {
  const { t } = useTranslation()
  const { screenW, mockupW } = useLayout()
  const led = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(led, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(led, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [led])

  return (
    <View style={[sharedStyles.slide, { width: screenW }]}>
      <View style={[s.housing, { width: mockupW }]}>
        {/* CRT 헤더 */}
        <View style={s.head}>
          <View style={s.headLeft}>
            <Animated.View style={[s.led, { opacity: led }]} />
            <Text style={s.brand}>TETRIS-OS v1.0</Text>
          </View>
          <View style={s.closeBtn}><Text style={s.closeText}>×</Text></View>
        </View>

        {/* CRT 스크린 */}
        <View style={s.screen}>
          <Scanlines intensity={0.025} />
          <Text style={s.screenTitle}>COMPLETED LINES</Text>

          {/* LINE #3 DOUBLE */}
          <View style={[s.line, s.lineOpen]}>
            <View style={s.lineHead}>
              <View style={s.lineLeft}>
                <Text style={[s.lineNum, s.lineNumOpen]}>#3</Text>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={s.lineLabel}>DOUBLE</Text>
                    <View style={s.badge}><Text style={s.badgeText}>x2</Text></View>
                  </View>
                  <Text style={s.lineDate}>{t('onboarding.dateMar29')}</Text>
                </View>
              </View>
              <View style={s.lineRight}>
                <Text style={s.lineScore}>+400</Text>
                <Text style={s.caretOpen}>▲</Text>
              </View>
            </View>
            <View style={s.body}>
              <View style={s.record}>
                <View style={[s.recDot, { backgroundColor: '#00F0FF' }]} />
                <Text style={s.recText}>{t('onboarding.sampleTask2')}</Text>
              </View>
              <View style={s.record}>
                <View style={[s.recDot, { backgroundColor: '#FF00E5' }]} />
                <Text style={s.recText}>{t('onboarding.sampleBlog')}</Text>
              </View>
              <View style={s.record}>
                <View style={[s.recDot, { backgroundColor: '#00FF88' }]} />
                <Text style={s.recText}>{t('onboarding.sampleRoutine')}</Text>
              </View>
            </View>
          </View>

          {/* LINE #2 */}
          <View style={[s.line, s.lineCollapsed]}>
            <View style={s.lineHead}>
              <View style={s.lineLeft}>
                <Text style={[s.lineNum, s.lineNumCollapsed]}>#2</Text>
                <View><Text style={s.lineLabel}>SINGLE</Text><Text style={s.lineDate}>{t('onboarding.dateMar28')}</Text></View>
              </View>
              <View style={s.lineRight}><Text style={s.lineScoreDim}>+100</Text><Text style={s.caretClosed}>▼</Text></View>
            </View>
          </View>

          {/* LINE #1 */}
          <View style={[s.line, s.lineCollapsed]}>
            <View style={s.lineHead}>
              <View style={s.lineLeft}>
                <Text style={[s.lineNum, s.lineNumCollapsed]}>#1</Text>
                <View><Text style={s.lineLabel}>SINGLE</Text><Text style={s.lineDate}>{t('onboarding.dateMar26')}</Text></View>
              </View>
              <View style={s.lineRight}><Text style={s.lineScoreDim}>+100</Text><Text style={s.caretClosed}>▼</Text></View>
            </View>
          </View>
        </View>

        {/* 푸터 카운터 */}
        <View style={s.footer}>
          <View style={s.footItem}>
            <Text style={[s.footVal, { color: COLORS.neonGreen }]}>4</Text>
            <Text style={s.footLabel}>LINES</Text>
          </View>
          <View style={s.footSep} />
          <View style={s.footItem}>
            <Text style={[s.footVal, { color: COLORS.neonYellow }]}>600</Text>
            <Text style={s.footLabel}>SCORE</Text>
          </View>
          <View style={s.footSep} />
          <View style={s.footItem}>
            <Text style={[s.footVal, { color: COLORS.neonCyan }]}>7</Text>
            <Text style={s.footLabel}>TASKS</Text>
          </View>
        </View>
      </View>

      {/* 카피 */}
      <View style={sharedStyles.caption}>
        <Text style={[sharedStyles.headline, { textAlign: 'left' }]}>
          {t('onboarding.slide4Title')}<Text style={sharedStyles.accentPurple}>{t('onboarding.slide4Accent')}</Text>
        </Text>
        <Text style={[sharedStyles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          {t('onboarding.slide4Hint1')}
        </Text>
        <Text style={[sharedStyles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          {t('onboarding.slide4Hint2')}
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  housing: { backgroundColor: '#2A2A3A', borderRadius: 12, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 28, elevation: 10, marginTop: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 6 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  led: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.neonGreen, shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2 },
  brand: { fontFamily: 'InterBold', fontSize: 9, color: COLORS.textMuted },
  closeBtn: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#3A3A4A', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.textMuted },
  screen: { backgroundColor: '#050515', borderWidth: 2, borderColor: '#1A1A2A', borderRadius: 6, paddingVertical: 12, paddingHorizontal: 10, overflow: 'hidden' },
  screenTitle: { fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonCyan, letterSpacing: 2, textAlign: 'center', marginBottom: 10, textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  line: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 7, marginBottom: 5, backgroundColor: 'rgba(26, 26, 53, 0.6)', borderWidth: 1 },
  lineOpen: { borderColor: 'rgba(255, 0, 229, 0.25)' },
  lineCollapsed: { borderColor: 'rgba(0, 240, 255, 0.12)' },
  lineHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lineLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  lineNum: { fontFamily: 'PressStart2P', fontSize: 13 },
  lineNumOpen: { color: COLORS.neonMagenta, textShadowColor: 'rgba(255, 0, 229, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  lineNumCollapsed: { color: 'rgba(0, 240, 255, 0.6)' },
  lineLabel: { fontFamily: 'InterBold', fontSize: 10, color: COLORS.textPrimary },
  lineDate: { fontFamily: 'Inter', fontSize: 9, color: COLORS.textMuted, marginTop: 1 },
  badge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, backgroundColor: 'rgba(255, 0, 229, 0.1)' },
  badgeText: { fontFamily: 'InterBold', fontSize: 8, color: COLORS.neonMagenta },
  lineRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lineScore: { fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonYellow, textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  lineScoreDim: { fontFamily: 'PressStart2P', fontSize: 9, color: 'rgba(255, 229, 0, 0.5)' },
  caretOpen: { fontSize: 9, color: COLORS.neonMagenta },
  caretClosed: { fontSize: 9, color: COLORS.textMuted },
  body: { marginTop: 7, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255, 0, 229, 0.15)', gap: 4 },
  record: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recDot: { width: 9, height: 9, borderRadius: 2, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopColor: 'rgba(255,255,255,0.55)', borderLeftColor: 'rgba(255,255,255,0.45)', borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomColor: 'rgba(0,0,0,0.55)', borderRightColor: 'rgba(0,0,0,0.5)' },
  recText: { fontFamily: 'Inter', fontSize: 10, color: COLORS.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 4 },
  footItem: { alignItems: 'center' },
  footVal: { fontFamily: 'PressStart2P', fontSize: 12, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  footLabel: { fontFamily: 'InterBold', fontSize: 8, color: COLORS.textMuted, letterSpacing: 1, marginTop: 2 },
  footSep: { width: 1, height: 20, backgroundColor: 'rgba(42, 42, 80, 0.5)' },
})
