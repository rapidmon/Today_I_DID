import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'
import { useLayout, COLORS } from './constants'
import { BevelCell } from './BevelCell'
import { sharedStyles } from './styles'

const ROWS = 12
const COLS = 10
const CELL = 13

// 낙하 T블록
const FALLING: [number, number, string][] = [
  [4, 4, '#CC00FF'], [5, 3, '#CC00FF'], [5, 4, '#CC00FF'], [5, 5, '#CC00FF'],
]

const STACKED: [number, number, string][] = [
  [8, 5, '#00CC00'], [8, 6, '#00CC00'],
  [9, 3, '#FF8800'], [9, 4, '#00CC00'], [9, 5, '#00CC00'], [9, 8, '#0088FF'],
  [10, 0, '#FF0000'], [10, 1, '#FF0000'], [10, 3, '#FF8800'], [10, 4, '#FF8800'],
  [10, 5, '#FFDD00'], [10, 6, '#FFDD00'], [10, 7, '#0088FF'], [10, 8, '#0088FF'], [10, 9, '#0088FF'],
  [11, 0, '#FF0000'], [11, 1, '#FF00AA'], [11, 2, '#FF00AA'], [11, 3, '#FF8800'],
  [11, 4, '#CC00FF'], [11, 5, '#FFDD00'], [11, 6, '#FFDD00'], [11, 7, '#0088FF'],
  [11, 8, '#00CC00'], [11, 9, '#00CC00'],
]

function buildBoard(): (string | null)[][] {
  const board: (string | null)[][] = Array.from({ length: ROWS }, () =>
    new Array(COLS).fill(null)
  )
  FALLING.forEach(([r, c, col]) => { board[r][c] = col })
  STACKED.forEach(([r, c, col]) => { board[r][c] = col })
  return board
}

export function Slide3() {
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
            <View style={s.nextBox}>
              <Text style={s.nextLabel}>NEXT</Text>
              <View style={{ flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
              </View>
            </View>
            <View style={s.scoreBox}>
              <Text style={s.scoreLabel}>SCORE</Text>
              <Text style={s.scoreVal}>1,250</Text>
            </View>
            <View style={s.todoBox}>
              <Text style={s.todoLabel}>TODO</Text>
              <View style={s.todoItem}><View style={s.todoDot} /><Text style={s.todoText} numberOfLines={1}>{t('onboarding.sampleTsShort')}</Text></View>
              <View style={s.todoItem}><View style={s.todoDot} /><Text style={s.todoText} numberOfLines={1}>{t('onboarding.sampleRoutine')}</Text></View>
              <View style={s.todoItem}><View style={s.todoDot} /><Text style={s.todoText} numberOfLines={1}>{t('onboarding.sampleBlogShort')}</Text></View>
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
          {t('onboarding.slide3Title')}<Text style={sharedStyles.accentYellow}>{t('onboarding.slide3Accent')}</Text>
        </Text>
        <Text style={[sharedStyles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          {t('onboarding.slide3Hint1')}
        </Text>
        <Text style={[sharedStyles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          {t('onboarding.slide3Hint2')}
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  widget: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 26, 0.95)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.18)', shadowColor: COLORS.neonCyan, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 8, marginTop: 10 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7, paddingVertical: 6, backgroundColor: 'rgba(0, 240, 255, 0.05)', borderBottomWidth: 1, borderBottomColor: 'rgba(0, 240, 255, 0.1)' },
  newPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: 'rgba(42, 42, 80, 0.4)', borderWidth: 1, borderColor: 'rgba(85, 85, 119, 0.3)' },
  newText: { fontFamily: 'PressStart2P', fontSize: 7, color: 'rgba(136, 136, 170, 0.7)', letterSpacing: 0.8 },
  widgetTitle: { fontFamily: 'PressStart2P', fontSize: 8, letterSpacing: 1.5, color: 'rgba(0, 240, 255, 0.8)', textShadowColor: 'rgba(0, 240, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pctText: { fontFamily: 'InterBold', fontSize: 9, color: 'rgba(255, 229, 0, 0.6)' },
  sunBox: { width: 18, height: 18, borderRadius: 5, backgroundColor: 'rgba(255, 229, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.2)', alignItems: 'center', justifyContent: 'center' },
  sunText: { fontSize: 10, color: COLORS.neonYellow },
  main: { flexDirection: 'row', gap: 4, padding: 4 },
  board: { padding: 2, backgroundColor: 'rgba(10, 10, 26, 0.6)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.08)', borderRadius: 4 },
  side: { flex: 1, minWidth: 0, gap: 4 },
  nextBox: { backgroundColor: 'rgba(26, 26, 53, 0.8)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 4, alignItems: 'center' },
  nextLabel: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 1.2, color: 'rgba(0, 240, 255, 0.6)', marginBottom: 4 },
  scoreBox: { backgroundColor: 'rgba(26, 26, 53, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.1)', borderRadius: 6, padding: 4, alignItems: 'center' },
  scoreLabel: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 1.2, color: 'rgba(255, 229, 0, 0.6)' },
  scoreVal: { fontFamily: 'PressStart2P', fontSize: 9, color: COLORS.neonYellow, textShadowColor: COLORS.neonYellow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6, marginTop: 2 },
  todoBox: { flex: 1, backgroundColor: 'rgba(26, 26, 53, 0.8)', borderWidth: 1, borderColor: 'rgba(255, 0, 229, 0.15)', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 4 },
  todoLabel: { fontFamily: 'PressStart2P', fontSize: 7, letterSpacing: 1.2, color: 'rgba(255, 0, 229, 0.6)', textAlign: 'center', marginBottom: 4 },
  todoItem: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  todoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255, 0, 229, 0.7)' },
  todoText: { fontFamily: 'Inter', fontSize: 9, color: 'rgba(136, 136, 170, 0.95)', flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(0, 240, 255, 0.03)', borderTopWidth: 1, borderTopColor: 'rgba(0, 240, 255, 0.08)' },
  ctrl: { width: 36, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 240, 255, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.2)' },
  ctrlDown: { backgroundColor: 'rgba(0, 255, 136, 0.08)', borderColor: 'rgba(0, 255, 136, 0.2)' },
  ctrlRot: { backgroundColor: 'rgba(255, 229, 0, 0.08)', borderColor: 'rgba(255, 229, 0, 0.2)' },
  ctrlText: { fontSize: 12, color: COLORS.neonCyan },
})
