import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useLayout, COLORS } from './constants'
import { BevelCell } from './BevelCell'
import { sharedStyles } from './styles'

export function Slide2() {
  const { t } = useTranslation()
  const { screenW, mockupW } = useLayout()
  const swipeX = useRef(new Animated.Value(0)).current
  const chipEditT = useRef(new Animated.Value(0)).current
  const tapRing = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const swipeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swipeX, { toValue: -112, duration: 900, useNativeDriver: true }),
        Animated.timing(swipeX, { toValue: -112, duration: 1200, useNativeDriver: true }),
        Animated.timing(swipeX, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(swipeX, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    )
    swipeLoop.start()

    const chipLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1600),
        Animated.timing(tapRing, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(chipEditT, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(tapRing, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.delay(1800),
        Animated.timing(chipEditT, { toValue: 0, duration: 320, useNativeDriver: true }),
      ])
    )
    chipLoop.start()

    return () => {
      swipeLoop.stop()
      chipLoop.stop()
    }
  }, [swipeX, chipEditT, tapRing])

  const normalOpacity = chipEditT.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
  const editOpacity = chipEditT
  const ringScale = tapRing.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] })
  const ringOpacity = tapRing.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.8, 0] })

  return (
    <View style={[sharedStyles.slide, { width: screenW }]}>
      <View style={[s.phoneFrame, { width: mockupW }]}>
        {/* 헤더 */}
        <View style={s.header}>
          <View style={s.brand}>
            <View style={{ flexDirection: 'row', gap: 1 }}>
              <BevelCell size={8} color="#00F0FF" />
              <BevelCell size={8} color="#FF00E5" />
            </View>
            <Text style={s.brandTitle}>TODAY I DID</Text>
          </View>
          <View style={s.scoreBadge}>
            <Text style={s.scoreText}>SCORE 1,250</Text>
          </View>
        </View>

        {/* 모드 토글 */}
        <View style={s.modeRow}>
          <View style={[s.modeBtn, s.modeBtnActive]}>
            <Text style={[s.modeText, s.modeTextActive]}>{t('home.task')}</Text>
          </View>
          <View style={s.modeBtn}>
            <Text style={s.modeText}>{t('home.routine')}</Text>
          </View>
        </View>

        {/* 입력창 */}
        <View style={s.inputRow}>
          <View style={s.input}>
            <Text style={s.inputText}>{t('onboarding.sampleTask1')}</Text>
          </View>
          <View style={s.addBtn}>
            <Text style={s.addBtnText}>ADD</Text>
          </View>
        </View>

        {/* 날짜 선택기 */}
        <View style={s.dateRow}>
          <View style={s.dateStepper}>
            <View style={s.dateArrow}><Text style={s.dateArrowText}>‹</Text></View>
            <View style={s.dateValWrap}><Text style={s.dateVal}>04</Text></View>
            <View style={s.dateArrow}><Text style={s.dateArrowText}>›</Text></View>
          </View>
          <Text style={s.dateUnit}>{t('home.month')}</Text>
          <View style={s.dateStepper}>
            <View style={s.dateArrow}><Text style={s.dateArrowText}>‹</Text></View>
            <View style={s.dateValWrap}><Text style={s.dateVal}>13</Text></View>
            <View style={s.dateArrow}><Text style={s.dateArrowText}>›</Text></View>
          </View>
          <Text style={s.dateUnit}>{t('home.day')}</Text>
          <View style={s.todayPill}>
            <Text style={s.todayPillText}>TODAY</Text>
          </View>
        </View>

        {/* 루틴 칩 */}
        <View style={s.routinesSection}>
          <Text style={s.routinesLabel}>ROUTINES</Text>
          <View style={s.chipStack}>
            <Animated.View style={[s.chip, { opacity: normalOpacity }]}>
              <Text style={s.chipText}>{t('onboarding.sampleRoutineDaily')}</Text>
              <View style={s.chipX}><Text style={s.chipXText}>×</Text></View>
              <Animated.View
                pointerEvents="none"
                style={[s.tapRing, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
              />
            </Animated.View>
            <Animated.View style={[s.chipEditing, { opacity: editOpacity }]} pointerEvents="none">
              <Text style={s.editLabel}>EDIT</Text>
              <Text style={s.chipEditingName}>{t('onboarding.sampleRoutine')}</Text>
              <View style={s.dayPickerRow}>
                {(t('days', { returnObjects: true }) as string[]).map((d, i) => {
                  const active = i === 1 || i === 3 || i === 5
                  return (
                    <View key={d} style={s.dayBtn}>
                      <Text style={[s.dayBtnText, active && s.dayBtnTextActive]}>{d}</Text>
                    </View>
                  )
                })}
              </View>
              <View style={s.editBtnRow}>
                <View style={s.saveBtn}><Text style={s.saveBtnText}>SAVE</Text></View>
                <View style={s.cancelBtn}><Text style={s.cancelBtnText}>CANCEL</Text></View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* TODAY 섹션 */}
        <View style={s.todaySection}>
          <Text style={s.todaySectionLabel}>{'<TODAY>'}</Text>
          <View style={s.dateDivider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerDt}>{t('onboarding.dateApril13')}</Text>
            <Text style={s.dividerDtKr}>{t('home.today')}</Text>
            <View style={s.dividerLine} />
          </View>

          {/* row 1: 스와이프 힌트 */}
          <View style={s.swipeContainer}>
            <View style={s.swipeActions}>
              <View style={s.swipeEdit}><Text style={s.swipeEditText}>EDIT</Text></View>
              <View style={s.swipeDel}><Text style={s.swipeDelText}>DEL</Text></View>
            </View>
            <Animated.View style={[s.row, s.rowSwipe, { transform: [{ translateX: swipeX }] }]}>
              <Text style={s.rowNum}>1</Text>
              <Text style={s.rowText}>{t('onboarding.sampleTask2')}</Text>
              <View style={s.checkbox} />
            </Animated.View>
          </View>

          <View style={s.row}>
            <Text style={[s.rowNum, s.rowNumDone]}>2</Text>
            <Text style={[s.rowText, s.rowTextDone]}>{t('onboarding.sampleTask3')}</Text>
            <View style={[s.checkbox, s.checkboxDone]}><Text style={s.checkboxCheck}>✓</Text></View>
          </View>

          <View style={s.row}>
            <Text style={[s.rowNum, s.rowNumDone]}>3</Text>
            <Text style={[s.rowText, s.rowTextDone]}>{t('onboarding.sampleTask4')}</Text>
            <View style={[s.miniBlockWrap, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
              <View style={{ flexDirection: 'row', gap: 1 }}>
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
              </View>
            </View>
          </View>

          <View style={[s.row, { borderBottomWidth: 0 }]}>
            <Text style={[s.rowNum, s.rowNumDone]}>4</Text>
            <Text style={[s.rowText, s.rowTextDone]}>{t('onboarding.sampleTask5')}</Text>
            <View style={[s.miniBlockWrap, { backgroundColor: 'rgba(255, 136, 0, 0.12)' }]}>
              <View>
                <View style={{ flexDirection: 'row', gap: 1 }}>
                  <BevelCell size={4} color="#FF8800" />
                  <BevelCell size={4} color="#FF8800" />
                </View>
                <View style={{ flexDirection: 'row', gap: 1, marginTop: 1 }}>
                  <BevelCell size={4} color="#FF8800" />
                  <BevelCell size={4} color="#FF8800" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={sharedStyles.caption}>
        <Text style={[sharedStyles.headline, { textAlign: 'left' }]}>
          {t('onboarding.slide2Title')}<Text style={sharedStyles.accentCyan}>{t('onboarding.slide2Accent')}</Text>
        </Text>
        <View style={s.hintRow}>
          <Text style={[sharedStyles.hintText, { textAlign: 'left' }]}>{t('onboarding.slide2Hint1')}</Text>
        </View>
        <Text style={[sharedStyles.hintText, { textAlign: 'left' }]}>
          {t('onboarding.slide2Hint2')}
        </Text>
        <Text style={[sharedStyles.hintText, { textAlign: 'left' }]}>{t('onboarding.slide2Hint3')}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  phoneFrame: { backgroundColor: '#0A0A1A', borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 18, overflow: 'hidden', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandTitle: { fontFamily: 'PressStart2P', fontSize: 8, color: '#FFFFFF', letterSpacing: 1.2, textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  scoreBadge: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: 'rgba(255, 229, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.3)', borderRadius: 5 },
  scoreText: { fontFamily: 'PressStart2P', fontSize: 7, color: '#FFFFFF', letterSpacing: 0.5, textShadowColor: COLORS.neonYellow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  modeRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 4 },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle },
  modeBtnActive: { backgroundColor: 'rgba(0, 240, 255, 0.15)', borderColor: 'rgba(0, 240, 255, 0.35)' },
  modeText: { fontFamily: 'InterBold', fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.3 },
  modeTextActive: { color: COLORS.neonCyan, textShadowColor: COLORS.neonCyan, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  inputRow: { flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingBottom: 6 },
  input: { flex: 1, backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7 },
  inputText: { fontFamily: 'Inter', fontSize: 10, color: COLORS.textPrimary },
  addBtn: { paddingHorizontal: 10, justifyContent: 'center', backgroundColor: 'rgba(0, 240, 255, 0.2)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.35)', borderRadius: 8 },
  addBtnText: { fontFamily: 'InterBold', fontSize: 10, color: COLORS.neonCyan, letterSpacing: 0.8, textShadowColor: COLORS.neonCyan, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 4, paddingBottom: 6, gap: 2 },
  dateStepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 5, overflow: 'hidden', height: 20 },
  dateArrow: { width: 14, height: 20, alignItems: 'center', justifyContent: 'center' },
  dateArrowText: { color: COLORS.textSecondary, fontSize: 8 },
  dateValWrap: { paddingHorizontal: 8, height: 20, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.borderSubtle },
  dateVal: { fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonCyan, textShadowColor: 'rgba(0, 240, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  dateUnit: { fontFamily: 'InterBold', fontSize: 10, color: COLORS.textSecondary },
  todayPill: { height: 20, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 240, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)', borderRadius: 5 },
  todayPillText: { fontFamily: 'PressStart2P', fontSize: 6, color: COLORS.neonCyan, textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  routinesSection: { paddingHorizontal: 10, paddingVertical: 4, paddingBottom: 6 },
  routinesLabel: { fontFamily: 'InterBold', fontSize: 8, color: COLORS.textMuted, letterSpacing: 2, marginBottom: 4 },
  chipStack: { position: 'relative', minHeight: 90 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 999, paddingLeft: 8, paddingRight: 3, paddingVertical: 3 },
  chipText: { fontFamily: 'Inter', fontSize: 10, color: COLORS.textSecondary },
  chipX: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.bgElevated, alignItems: 'center', justifyContent: 'center' },
  chipXText: { fontSize: 9, fontWeight: 'bold', color: '#FF5555' },
  tapRing: { position: 'absolute', left: 8, top: 4, width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'rgba(0, 240, 255, 0.7)', backgroundColor: 'rgba(0, 240, 255, 0.12)' },
  chipEditing: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: 'rgba(0, 240, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  editLabel: { fontFamily: 'PressStart2P', fontSize: 7, color: COLORS.neonYellow, letterSpacing: 1.5, marginBottom: 4, textShadowColor: 'rgba(255, 229, 0, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  chipEditingName: { fontFamily: 'InterBold', fontSize: 11, color: COLORS.textPrimary, marginBottom: 5 },
  dayPickerRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 6 },
  dayBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 2, paddingHorizontal: 2 },
  dayBtnText: { fontFamily: 'InterSemiBold', fontSize: 10, color: COLORS.textMuted },
  dayBtnTextActive: { color: COLORS.neonCyan, textShadowColor: 'rgba(0, 240, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  editBtnRow: { flexDirection: 'row', gap: 6 },
  saveBtn: { flex: 1, paddingVertical: 5, borderRadius: 6, backgroundColor: 'rgba(0, 240, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)', alignItems: 'center' },
  saveBtnText: { fontFamily: 'InterBold', fontSize: 9, color: COLORS.neonCyan },
  cancelBtn: { flex: 1, paddingVertical: 5, borderRadius: 6, backgroundColor: 'rgba(0, 240, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)', alignItems: 'center' },
  cancelBtnText: { fontFamily: 'InterBold', fontSize: 9, color: 'rgba(0, 240, 255, 0.7)' },
  todaySection: { marginHorizontal: 8, marginVertical: 4, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)', borderRadius: 10, backgroundColor: 'rgba(0, 240, 255, 0.02)', paddingVertical: 4 },
  todaySectionLabel: { paddingHorizontal: 10, paddingTop: 5, paddingBottom: 2, fontFamily: 'PressStart2P', fontSize: 9, letterSpacing: 1.5, color: COLORS.neonCyan, textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 2, gap: 6 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerDt: { fontFamily: 'PressStart2P', fontSize: 7, color: 'rgba(0, 240, 255, 0.6)', textShadowColor: 'rgba(0, 240, 255, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  dividerDtKr: { fontFamily: 'InterBold', fontSize: 8, color: 'rgba(0, 240, 255, 0.6)', textShadowColor: 'rgba(0, 240, 255, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  swipeContainer: { position: 'relative', overflow: 'hidden' },
  swipeActions: { position: 'absolute', top: 0, right: 0, bottom: 0, flexDirection: 'row' },
  swipeEdit: { width: 56, backgroundColor: 'rgba(0, 240, 255, 0.12)', alignItems: 'center', justifyContent: 'center' },
  swipeEditText: { fontFamily: 'PressStart2P', fontSize: 7, color: COLORS.neonCyan, textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  swipeDel: { width: 56, backgroundColor: 'rgba(255, 51, 85, 0.15)', alignItems: 'center', justifyContent: 'center' },
  swipeDelText: { fontFamily: 'PressStart2P', fontSize: 7, color: COLORS.neonRed, textShadowColor: 'rgba(255, 51, 85, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(42, 42, 80, 0.4)', gap: 8, backgroundColor: '#0A0A1A' },
  rowSwipe: {},
  rowNum: { fontFamily: 'InterBold', fontSize: 11, color: COLORS.neonCyan, minWidth: 14, textAlign: 'center', textShadowColor: 'rgba(0, 240, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  rowNumDone: { color: COLORS.textMuted, textShadowColor: 'transparent' },
  rowText: { flex: 1, fontFamily: 'Inter', fontSize: 11, color: COLORS.textPrimary },
  rowTextDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: COLORS.neonCyan },
  checkboxDone: { borderColor: COLORS.neonGreen, backgroundColor: 'rgba(0, 255, 136, 0.1)', alignItems: 'center', justifyContent: 'center' },
  checkboxCheck: { color: COLORS.neonGreen, fontSize: 11, fontWeight: 'bold' },
  miniBlockWrap: { width: 18, height: 18, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 6, marginTop: 8 },
})
