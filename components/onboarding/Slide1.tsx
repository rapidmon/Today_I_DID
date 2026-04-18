import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useLayout, COLORS } from './constants'
import { Scanlines } from './Scanlines'
import { BevelCell } from './BevelCell'
import { sharedStyles } from './styles'

// 하단 플레이필드 (10x3)
const PF_ROWS: (string | null)[][] = [
  [null, null, null, null, '#00F0FF', null, null, null, null, null],
  ['#FFE500', '#FFE500', null, '#00FF88', '#00F0FF', '#00F0FF', null, '#FF3355', null, null],
  ['#FFE500', '#FFE500', '#8B5CF6', '#00FF88', '#00FF88', '#00F0FF', '#FF8800', '#FF3355', '#FF3355', '#FF00E5'],
]

// L블록 (변환 시연용)
const L_BLOCK: (string | null)[] = [
  '#FF8800', null,
  '#FF8800', null,
  '#FF8800', '#FF8800',
]

export function Slide1() {
  const { t } = useTranslation()
  const { screenW, mockupW } = useLayout()
  const blink = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0.2, duration: 400, useNativeDriver: true }),
      ])
    )
    blinkLoop.start()
    return () => blinkLoop.stop()
  }, [blink])

  return (
    <View style={[sharedStyles.slide, { width: screenW }]}>
      <Scanlines intensity={0.035} />

      <View style={[s.hero, { width: mockupW }]}>
        <View style={s.topbar}>
          <Text style={s.topbarText}>
            HIGH SCORE <Text style={s.topbarHs}>999999</Text>
          </Text>
          <Text style={s.topbarText}>
            CREDIT <Text style={s.topbarCr}>01</Text>
          </Text>
        </View>

        <View style={s.titleWrap}>
          <Text style={s.titleLine1}>TODAY</Text>
          <Text style={s.titleLine2}>I DID</Text>
          <Animated.Text style={[s.tagline, { opacity: blink }]}>
            - PRESS START -
          </Animated.Text>
        </View>

        <View style={s.convertDemo}>
          <View style={s.convertChip}>
            <Text style={s.convertChipText}>{t('onboarding.sampleTask1')}</Text>
          </View>
          <Text style={s.convertArrow}>{'>>'}</Text>
          <View style={s.convertBlockGrid}>
            {L_BLOCK.map((c, i) =>
              c ? (
                <BevelCell key={i} size={10} color={c} />
              ) : (
                <View key={i} style={{ width: 10, height: 10 }} />
              )
            )}
          </View>
        </View>

        <View style={s.stackWrap}>
          <View style={s.stackBorder}>
            {PF_ROWS.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 2, marginBottom: ri < PF_ROWS.length - 1 ? 2 : 0 }}>
                {row.map((cell, ci) =>
                  cell ? (
                    <BevelCell key={ci} size={20} color={cell} />
                  ) : (
                    <BevelCell key={ci} size={20} empty />
                  )
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.caption}>
        <Text style={sharedStyles.headline}>
          {t('onboarding.slide1Title')}<Text style={sharedStyles.accentCyan}>{t('onboarding.slide1Accent')}</Text>{t('onboarding.slide1TitleEnd')}
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  hero: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  topbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 18,
  },
  topbarText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  topbarHs: {
    color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  topbarCr: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  titleWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 22,
  },
  titleLine1: {
    fontFamily: 'PressStart2P',
    fontSize: 26,
    letterSpacing: 4,
    color: '#FFFFFF',
    lineHeight: 26,
    textShadowColor: COLORS.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  titleLine2: {
    fontFamily: 'PressStart2P',
    fontSize: 26,
    letterSpacing: 4,
    color: '#FFFFFF',
    lineHeight: 26,
    marginTop: 8,
    textShadowColor: COLORS.neonMagenta,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  tagline: {
    marginTop: 10,
    fontFamily: 'PressStart2P',
    fontSize: 7,
    letterSpacing: 2,
    color: COLORS.neonGreen,
    textShadowColor: 'rgba(0, 255, 136, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  convertDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    borderRadius: 10,
    marginBottom: 24,
  },
  convertChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 5,
  },
  convertChipText: {
    fontFamily: 'InterSemiBold',
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  convertArrow: {
    fontFamily: 'PressStart2P',
    fontSize: 11,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  convertBlockGrid: {
    width: 21,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  stackWrap: {
    position: 'relative',
    paddingBottom: 6,
    marginBottom: 8,
  },
  stackBorder: {
    padding: 6,
    backgroundColor: 'rgba(10, 10, 26, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 8,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  caption: {
    paddingHorizontal: 28,
    paddingBottom: 8,
    paddingTop: 50,
    width: '100%',
    alignItems: 'stretch',
  },
})
