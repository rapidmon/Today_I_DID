import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'
import { useLayout, COLORS } from './constants'
import { BevelCell } from './BevelCell'
import { sharedStyles } from './styles'

const ROWS = 12
const COLS = 10
const CELL = 13
const PENALTY = '#5A5A72'

const FALLING: [number, number, string][] = [
  [3, 3, '#CC00FF'], [3, 4, '#CC00FF'], [3, 5, '#CC00FF'],
  [4, 4, '#CC00FF'],
]

const PLACED: [number, number, string][] = [
  [8, 5, '#FF8800'], [8, 6, '#FF8800'],
]

const PENALTY_ROWS: [number, number][] = [
  // row 9 — hole at col 4
  [9, 0], [9, 1], [9, 2], [9, 3], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9],
  // row 10 — hole at col 2
  [10, 0], [10, 1], [10, 3], [10, 4], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9],
  // row 11 — hole at col 7
  [11, 0], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 8], [11, 9],
]

function buildBoard(): (string | null)[][] {
  const board: (string | null)[][] = Array.from({ length: ROWS }, () =>
    new Array(COLS).fill(null)
  )
  FALLING.forEach(([r, c, col]) => { board[r][c] = col })
  PLACED.forEach(([r, c, col]) => { board[r][c] = col })
  PENALTY_ROWS.forEach(([r, c]) => { board[r][c] = PENALTY })
  return board
}

export function Slide4() {
  const { t } = useTranslation()
  const { screenW, mockupW } = useLayout()
  const board = useMemo(buildBoard, [])

  return (
    <View style={[sharedStyles.slide, { width: screenW }]}>
      <View style={[s.widget, { width: mockupW }]}>
        {/* 상단 바 */}
        <View style={s.topbar}>
          <View style={s.newPill}><Text style={s.newText}>NEW</Text></View>
          <Text style={s.widgetTitle}>TODAY I DID</Text>
          <View style={s.topbarRight}>
            <Text style={s.pctText}>70%</Text>
            <View style={s.sunBox}><Text style={s.sunText}>☀</Text></View>
          </View>
        </View>

        {/* 메인: 보드 + 사이드 */}
        <View style={s.main}>
          <View style={s.board}>
            {board.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 1, marginBottom: ri < ROWS - 1 ? 1 : 0 }}>
                {row.map((cell, ci) =>
                  cell ? (
                    <BevelCell key={ci} size={CELL} color={cell} />
                  ) : (
                    <View key={ci} style={{ width: CELL, height: CELL, backgroundColor: 'rgba(42, 42, 80, 0.3)', borderRadius: 1 }} />
                  )
                )}
              </View>
            ))}
          </View>

          <View style={s.side}>
            <View style={s.missedBox}>
              <Text style={s.missedLabel}>MISSED</Text>
              <View style={s.missedItem}>
                <View style={s.missedDot} />
                <Text style={s.missedText} numberOfLines={1}>{t('onboarding.sampleTask1')}</Text>
              </View>
              <View style={s.missedItem}>
                <View style={s.missedDot} />
                <Text style={s.missedText} numberOfLines={1}>{t('onboarding.sampleTask3')}</Text>
              </View>
            </View>

            <View style={s.penaltyBox}>
              <Text style={s.penaltyLabel}>PENALTY</Text>
              <View style={s.penaltyValRow}>
                <Text style={s.penaltyArrow}>↑</Text>
                <Text style={s.penaltyVal}>3</Text>
              </View>
            </View>

            <View style={s.warnBox}>
              <Text style={s.warnText}>FULL ={'>'} OVER</Text>
            </View>
          </View>
        </View>

        {/* 하단 컨트롤 */}
        <View style={s.controls}>
          <View style={s.ctrl}><Text style={s.ctrlText}>◀</Text></View>
          <View style={s.ctrl}><Text style={s.ctrlText}>▶</Text></View>
          <View style={{ width: 4 }} />
          <View style={[s.ctrl, s.ctrlDown]}><Text style={[s.ctrlText, { color: COLORS.neonGreen }]}>▼</Text></View>
          <View style={{ width: 4 }} />
          <View style={[s.ctrl, s.ctrlRot]}><Text style={[s.ctrlText, { color: COLORS.neonYellow }]}>↻</Text></View>
        </View>
      </View>

      {/* 카피 */}
      <View style={sharedStyles.caption}>
        <Text style={[sharedStyles.headline, { textAlign: 'left' }]}>
          {t('onboarding.slide4Title')}<Text style={sharedStyles.accentRed}>{t('onboarding.slide4Accent')}</Text>
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
  widget: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 26, 0.95)', borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.2)', shadowColor: COLORS.neonRed, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8, marginTop: 10 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7, paddingVertical: 6, backgroundColor: 'rgba(255, 51, 85, 0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 51, 85, 0.12)' },
  newPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: 'rgba(42, 42, 80, 0.4)', borderWidth: 1, borderColor: 'rgba(85, 85, 119, 0.3)' },
  newText: { fontFamily: 'PressStart2P', fontSize: 7, color: 'rgba(136, 136, 170, 0.7)', letterSpacing: 0.8 },
  widgetTitle: { fontFamily: 'PressStart2P', fontSize: 8, letterSpacing: 1.5, color: 'rgba(255, 51, 85, 0.75)', textShadowColor: 'rgba(255, 51, 85, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pctText: { fontFamily: 'InterBold', fontSize: 9, color: 'rgba(255, 229, 0, 0.6)' },
  sunBox: { width: 18, height: 18, borderRadius: 5, backgroundColor: 'rgba(255, 229, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.2)', alignItems: 'center', justifyContent: 'center' },
  sunText: { fontSize: 10, color: COLORS.neonYellow },
  main: { flexDirection: 'row', gap: 4, padding: 4 },
  board: { padding: 2, backgroundColor: 'rgba(10, 10, 26, 0.6)', borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.12)', borderRadius: 4 },
  side: { flex: 1, minWidth: 0, gap: 4 },
  missedBox: { flex: 1, backgroundColor: 'rgba(26, 26, 53, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.3)', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 4 },
  missedLabel: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 1.2, color: COLORS.neonRed, textAlign: 'center', marginBottom: 5, textShadowColor: 'rgba(255, 51, 85, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  missedItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  missedDot: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.2, borderColor: COLORS.neonRed, backgroundColor: 'transparent' },
  missedText: { fontFamily: 'Inter', fontSize: 9, color: 'rgba(255, 200, 210, 0.85)', flex: 1, textDecorationLine: 'line-through', textDecorationColor: 'rgba(255, 51, 85, 0.6)' },
  penaltyBox: { backgroundColor: 'rgba(26, 26, 53, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.25)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 4, alignItems: 'center' },
  penaltyLabel: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 1.2, color: 'rgba(255, 51, 85, 0.7)' },
  penaltyValRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  penaltyArrow: { fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonRed, textShadowColor: 'rgba(255, 51, 85, 0.7)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 },
  penaltyVal: { fontFamily: 'PressStart2P', fontSize: 11, color: COLORS.neonRed, textShadowColor: 'rgba(255, 51, 85, 0.7)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  warnBox: { backgroundColor: 'rgba(255, 51, 85, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 51, 85, 0.35)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 4, alignItems: 'center' },
  warnText: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 0.8, color: COLORS.neonRed, textShadowColor: 'rgba(255, 51, 85, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255, 51, 85, 0.03)', borderTopWidth: 1, borderTopColor: 'rgba(255, 51, 85, 0.1)' },
  ctrl: { width: 36, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 240, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.2)' },
  ctrlDown: { backgroundColor: 'rgba(0, 255, 136, 0.08)', borderColor: 'rgba(0, 255, 136, 0.2)' },
  ctrlRot: { backgroundColor: 'rgba(255, 229, 0, 0.08)', borderColor: 'rgba(255, 229, 0, 0.2)' },
  ctrlText: { fontSize: 12, color: COLORS.neonCyan },
})
