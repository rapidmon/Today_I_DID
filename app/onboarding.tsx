import { useEffect, useRef, useState, type ReactElement } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS } from '@/constants/homeStyles'
import { setHasSeenOnboarding } from '@/lib/onboardingStorage'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

// 모든 슬라이드의 앱 목업과 캡션이 동일한 좌우 여백을 사용하도록 공통 폭 정의
// 캡션: paddingHorizontal: 28 → 콘텐츠 폭 = SCREEN_W - 56
const CAPTION_PADDING_H = 28
const MOCKUP_W = SCREEN_W - CAPTION_PADDING_H * 2

const TOTAL_SLIDES = 4

export default function OnboardingScreen() {
  const router = useRouter()
  const scrollRef = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    const next = Math.round(x / SCREEN_W)
    if (next !== page) setPage(next)
  }

  const goNext = () => {
    if (page < TOTAL_SLIDES - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_W, animated: true })
    }
  }

  const finish = async () => {
    await setHasSeenOnboarding()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        <Slide1 />
        <Slide2 />
        <Slide3 />
        <Slide4 />
      </ScrollView>

      {/* 하단 인디케이터 + CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>
        {page < TOTAL_SLIDES - 1 ? (
          <TouchableOpacity style={styles.cta} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.ctaText}>NEXT ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cta, styles.ctaPrimary]}
            onPress={finish}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaPrimaryText}>시작하기</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

// ===================================================================
// 공통: CRT 스캔라인 오버레이
// ===================================================================

function Scanlines({ intensity = 0.04 }: { intensity?: number }) {
  // 2px 간격 가로 라인을 View로 반복해 그림
  const rows: ReactElement[] = []
  const step = 3
  const count = Math.ceil(SCREEN_H / step)
  for (let i = 0; i < count; i++) {
    rows.push(
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
    )
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {rows}
    </View>
  )
}

// ===================================================================
// 3D 베벨 셀 (테트리스 블록 한 칸)
// ===================================================================

interface BevelCellProps {
  size: number
  color?: string
  empty?: boolean
}

function BevelCell({ size, color, empty }: BevelCellProps) {
  if (empty) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: 'rgba(42, 42, 80, 0.5)',
          borderStyle: 'dashed',
          borderRadius: 2,
        }}
      />
    )
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? '#00F0FF',
        borderRadius: 2,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: 'rgba(255,255,255,0.55)',
        borderLeftColor: 'rgba(255,255,255,0.45)',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: 'rgba(0,0,0,0.55)',
        borderRightColor: 'rgba(0,0,0,0.5)',
      }}
    />
  )
}

// ===================================================================
// SLIDE 1: 아케이드 타이틀 히어로
// ===================================================================

function Slide1() {
  // PRESS START 블링크
  const blink = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 0.2, duration: 400, useNativeDriver: true }),
      ])
    )
    blinkLoop.start()

    return () => {
      blinkLoop.stop()
    }
  }, [blink])

  // 하단 플레이필드 (10x3)
  const PF_ROWS: (string | null)[][] = [
    // row 1: 거의 빈 + 시안 하나
    [null, null, null, null, '#00F0FF', null, null, null, null, null],
    // row 2
    ['#FFE500', '#FFE500', null, '#00FF88', '#00F0FF', '#00F0FF', null, '#FF3355', null, null],
    // row 3: 꽉 참
    ['#FFE500', '#FFE500', '#8B5CF6', '#00FF88', '#00FF88', '#00F0FF', '#FF8800', '#FF3355', '#FF3355', '#FF00E5'],
  ]

  // L블록 (변환 시연용) - 2열 x 3행 (우측 아래 꺾임)
  const L_BLOCK: (string | null)[] = [
    '#FF8800', null,
    '#FF8800', null,
    '#FF8800', '#FF8800',
  ]

  return (
    <View style={styles.slide}>
      <Scanlines intensity={0.035} />

      {/* 히어로: 내부 요소들이 MOCKUP_W 폭에 정렬됨 */}
      <View style={slide1Styles.hero}>
        {/* 상단 HIGH SCORE / CREDIT 바 */}
        <View style={slide1Styles.topbar}>
          <Text style={slide1Styles.topbarText}>
            HIGH SCORE <Text style={slide1Styles.topbarHs}>999999</Text>
          </Text>
          <Text style={slide1Styles.topbarText}>
            CREDIT <Text style={slide1Styles.topbarCr}>01</Text>
          </Text>
        </View>

        {/* 타이틀 */}
        <View style={slide1Styles.titleWrap}>
          <Text style={slide1Styles.titleLine1}>TODAY</Text>
          <Text style={slide1Styles.titleLine2}>I DID</Text>
          <Animated.Text style={[slide1Styles.tagline, { opacity: blink }]}>
            - PRESS START -
          </Animated.Text>
        </View>

        {/* 변환 시연: 모닝 러닝 5km -> L블록 */}
        <View style={slide1Styles.convertDemo}>
          <View style={slide1Styles.convertChip}>
            <Text style={slide1Styles.convertChipText}>모닝 러닝 5km</Text>
          </View>
          <Text style={slide1Styles.convertArrow}>{'>>'}</Text>
          <View style={slide1Styles.convertBlockGrid}>
            {L_BLOCK.map((c, i) =>
              c ? (
                <BevelCell key={i} size={10} color={c} />
              ) : (
                <View key={i} style={{ width: 10, height: 10 }} />
              )
            )}
          </View>
        </View>

        {/* 하단 미니 플레이필드 10x3 */}
        <View style={slide1Styles.stackWrap}>
          <View style={slide1Styles.stackBorder}>
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

      {/* 카피 */}
      <View style={slide1Styles.caption}>
        <Text style={styles.headline}>
          오늘 한 일이 <Text style={styles.accentCyan}>블록</Text>이 됩니다
        </Text>
      </View>
    </View>
  )
}

// ===================================================================
// SLIDE 2: 홈 화면 미니 목업
// ===================================================================

function Slide2() {
  // 스와이프 힌트용 카드 X 오프셋
  const swipeX = useRef(new Animated.Value(0)).current
  // 루틴 칩 탭: 0 = 일반, 1 = 편집 상태
  const chipEditT = useRef(new Animated.Value(0)).current
  // 탭 링 펄스 (칩 위에 나타났다 사라지는 원)
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
        // 일반 상태 유지
        Animated.delay(1600),
        // 탭 링 펄스
        Animated.timing(tapRing, { toValue: 1, duration: 380, useNativeDriver: true }),
        // 편집 상태로 전환
        Animated.parallel([
          Animated.timing(chipEditT, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(tapRing, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        // 편집 상태 유지
        Animated.delay(1800),
        // 일반 상태로 복귀
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
    <View style={styles.slide}>
      <View style={slide2Styles.phoneFrame}>
        {/* 헤더 */}
        <View style={slide2Styles.header}>
          <View style={slide2Styles.brand}>
            <View style={{ flexDirection: 'row', gap: 1 }}>
              <BevelCell size={8} color="#00F0FF" />
              <BevelCell size={8} color="#FF00E5" />
            </View>
            <Text style={slide2Styles.brandTitle}>TODAY I DID</Text>
          </View>
          <View style={slide2Styles.scoreBadge}>
            <Text style={slide2Styles.scoreText}>SCORE 1,250</Text>
          </View>
        </View>

        {/* 모드 토글 */}
        <View style={slide2Styles.modeRow}>
          <View style={[slide2Styles.modeBtn, slide2Styles.modeBtnActive]}>
            <Text style={[slide2Styles.modeText, slide2Styles.modeTextActive]}>할 일</Text>
          </View>
          <View style={slide2Styles.modeBtn}>
            <Text style={slide2Styles.modeText}>루틴</Text>
          </View>
        </View>

        {/* 입력창 */}
        <View style={slide2Styles.inputRow}>
          <View style={slide2Styles.input}>
            <Text style={slide2Styles.inputText}>모닝 러닝 5km</Text>
          </View>
          <View style={slide2Styles.addBtn}>
            <Text style={slide2Styles.addBtnText}>ADD</Text>
          </View>
        </View>

        {/* 날짜 선택기 */}
        <View style={slide2Styles.dateRow}>
          <View style={slide2Styles.dateStepper}>
            <View style={slide2Styles.dateArrow}>
              <Text style={slide2Styles.dateArrowText}>‹</Text>
            </View>
            <View style={slide2Styles.dateValWrap}>
              <Text style={slide2Styles.dateVal}>04</Text>
            </View>
            <View style={slide2Styles.dateArrow}>
              <Text style={slide2Styles.dateArrowText}>›</Text>
            </View>
          </View>
          <Text style={slide2Styles.dateUnit}>월</Text>
          <View style={slide2Styles.dateStepper}>
            <View style={slide2Styles.dateArrow}>
              <Text style={slide2Styles.dateArrowText}>‹</Text>
            </View>
            <View style={slide2Styles.dateValWrap}>
              <Text style={slide2Styles.dateVal}>13</Text>
            </View>
            <View style={slide2Styles.dateArrow}>
              <Text style={slide2Styles.dateArrowText}>›</Text>
            </View>
          </View>
          <Text style={slide2Styles.dateUnit}>일</Text>
          <View style={slide2Styles.todayPill}>
            <Text style={slide2Styles.todayPillText}>TODAY</Text>
          </View>
        </View>

        {/* 루틴 칩 (탭 애니메이션) */}
        <View style={slide2Styles.routinesSection}>
          <Text style={slide2Styles.routinesLabel}>ROUTINES</Text>
          <View style={slide2Styles.chipStack}>
            {/* 일반 상태 */}
            <Animated.View style={[slide2Styles.chip, { opacity: normalOpacity }]}>
              <Text style={slide2Styles.chipText}>운동하기 매일</Text>
              <View style={slide2Styles.chipX}>
                <Text style={slide2Styles.chipXText}>×</Text>
              </View>
              {/* 탭 링 펄스 (칩 위에 오버레이) */}
              <Animated.View
                pointerEvents="none"
                style={[
                  slide2Styles.tapRing,
                  { opacity: ringOpacity, transform: [{ scale: ringScale }] },
                ]}
              />
            </Animated.View>

            {/* 편집 상태 (실제 앱 routineEditContainer와 동일 구조) */}
            <Animated.View
              style={[slide2Styles.chipEditing, { opacity: editOpacity }]}
              pointerEvents="none"
            >
              <Text style={slide2Styles.editLabel}>EDIT</Text>
              <Text style={slide2Styles.chipEditingName}>운동하기</Text>
              <View style={slide2Styles.dayPickerRow}>
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => {
                  // 월·수·금 활성 (실제 앱에서 days 배열 기준: 1, 3, 5)
                  const active = i === 1 || i === 3 || i === 5
                  return (
                    <View key={d} style={slide2Styles.dayBtn}>
                      <Text
                        style={[slide2Styles.dayBtnText, active && slide2Styles.dayBtnTextActive]}
                      >
                        {d}
                      </Text>
                    </View>
                  )
                })}
              </View>
              <View style={slide2Styles.editBtnRow}>
                <View style={slide2Styles.saveBtn}>
                  <Text style={slide2Styles.saveBtnText}>SAVE</Text>
                </View>
                <View style={slide2Styles.cancelBtn}>
                  <Text style={slide2Styles.cancelBtnText}>CANCEL</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* TODAY 섹션 */}
        <View style={slide2Styles.todaySection}>
          <Text style={slide2Styles.todaySectionLabel}>{'<TODAY>'}</Text>

          <View style={slide2Styles.dateDivider}>
            <View style={slide2Styles.dividerLine} />
            <Text style={slide2Styles.dividerDt}>4월 13일</Text>
            <Text style={slide2Styles.dividerDtKr}>{'<오늘>'}</Text>
            <View style={slide2Styles.dividerLine} />
          </View>

          {/* row 1: pending + 스와이프 힌트 */}
          <View style={slide2Styles.swipeContainer}>
            {/* 뒤의 액션 영역 (EDIT/DEL) */}
            <View style={slide2Styles.swipeActions}>
              <View style={slide2Styles.swipeEdit}>
                <Text style={slide2Styles.swipeEditText}>EDIT</Text>
              </View>
              <View style={slide2Styles.swipeDel}>
                <Text style={slide2Styles.swipeDelText}>DEL</Text>
              </View>
            </View>
            {/* 앞의 카드 (슬라이딩) */}
            <Animated.View
              style={[
                slide2Styles.row,
                slide2Styles.rowSwipe,
                { transform: [{ translateX: swipeX }] },
              ]}
            >
              <Text style={slide2Styles.rowNum}>1</Text>
              <Text style={slide2Styles.rowText}>TypeScript 강의 듣기</Text>
              <View style={slide2Styles.checkbox} />
            </Animated.View>
          </View>

          {/* row 2: completed */}
          <View style={slide2Styles.row}>
            <Text style={[slide2Styles.rowNum, slide2Styles.rowNumDone]}>2</Text>
            <Text style={[slide2Styles.rowText, slide2Styles.rowTextDone]}>
              알고리즘 문제 풀기
            </Text>
            <View style={[slide2Styles.checkbox, slide2Styles.checkboxDone]}>
              <Text style={slide2Styles.checkboxCheck}>✓</Text>
            </View>
          </View>

          {/* row 3: I블록 */}
          <View style={slide2Styles.row}>
            <Text style={[slide2Styles.rowNum, slide2Styles.rowNumDone]}>3</Text>
            <Text style={[slide2Styles.rowText, slide2Styles.rowTextDone]}>
              디자인 시안 검토하기
            </Text>
            <View style={[slide2Styles.miniBlockWrap, { backgroundColor: 'rgba(0, 240, 255, 0.1)' }]}>
              <View style={{ flexDirection: 'row', gap: 1 }}>
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
                <BevelCell size={3} color="#00F0FF" />
              </View>
            </View>
          </View>

          {/* row 4: O블록 */}
          <View style={[slide2Styles.row, { borderBottomWidth: 0 }]}>
            <Text style={[slide2Styles.rowNum, slide2Styles.rowNumDone]}>4</Text>
            <Text style={[slide2Styles.rowText, slide2Styles.rowTextDone]}>이메일 정리</Text>
            <View style={[slide2Styles.miniBlockWrap, { backgroundColor: 'rgba(255, 136, 0, 0.12)' }]}>
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

      {/* 카피 (왼쪽 정렬) */}
      <View style={slide2Styles.caption}>
        <Text style={[styles.headline, { textAlign: 'left' }]}>
          적으면, <Text style={styles.accentCyan}>블록이 생깁니다</Text>
        </Text>
        <View style={slide2Styles.hintRow}>
          <Text style={[slide2Styles.hintText, { textAlign: 'left' }]}>할 일은 왼쪽으로 밀어 수정 / 삭제</Text>
        </View>
        <Text style={[slide2Styles.hintText, { textAlign: 'left' }]}>
          '루틴' 모드로 전환하면 요일을 골라 매주 반복
        </Text>
        <Text style={[slide2Styles.hintText, { textAlign: 'left' }]}>루틴은 칩을 탭해 요일 수정, ×로 삭제</Text>
      </View>
    </View>
  )
}

// ===================================================================
// SLIDE 3: 위젯 목업
// ===================================================================

function Slide3() {
  // 10x12 보드 맵 (HTML 스크립트와 동일)
  const ROWS = 12
  const COLS = 10
  const board: (string | null)[][] = Array.from({ length: ROWS }, () =>
    new Array(COLS).fill(null)
  )

  // 낙하 T블록
  const falling: [number, number, string][] = [
    [4, 4, '#CC00FF'],
    [5, 3, '#CC00FF'],
    [5, 4, '#CC00FF'],
    [5, 5, '#CC00FF'],
  ]

  const stacked: [number, number, string][] = [
    [8, 5, '#00CC00'],
    [8, 6, '#00CC00'],
    [9, 3, '#FF8800'],
    [9, 4, '#00CC00'],
    [9, 5, '#00CC00'],
    [9, 8, '#0088FF'],
    [10, 0, '#FF0000'],
    [10, 1, '#FF0000'],
    [10, 3, '#FF8800'],
    [10, 4, '#FF8800'],
    [10, 5, '#FFDD00'],
    [10, 6, '#FFDD00'],
    [10, 7, '#0088FF'],
    [10, 8, '#0088FF'],
    [10, 9, '#0088FF'],
    [11, 0, '#FF0000'],
    [11, 1, '#FF00AA'],
    [11, 2, '#FF00AA'],
    [11, 3, '#FF8800'],
    [11, 4, '#CC00FF'],
    [11, 5, '#FFDD00'],
    [11, 6, '#FFDD00'],
    [11, 7, '#0088FF'],
    [11, 8, '#00CC00'],
    [11, 9, '#00CC00'],
  ]

  falling.forEach(([r, c, col]) => {
    board[r][c] = col
  })
  stacked.forEach(([r, c, col]) => {
    board[r][c] = col
  })

  const CELL = 13

  return (
    <View style={styles.slide}>
      <View style={slide3Styles.widget}>
        {/* 상단 바 */}
        <View style={slide3Styles.topbar}>
          <View style={slide3Styles.newPill}>
            <Text style={slide3Styles.newText}>NEW</Text>
          </View>
          <Text style={slide3Styles.widgetTitle}>TODAY I DID</Text>
          <View style={slide3Styles.topbarRight}>
            <Text style={slide3Styles.pctText}>70%</Text>
            <View style={slide3Styles.sunBox}>
              <Text style={slide3Styles.sunText}>☀</Text>
            </View>
          </View>
        </View>

        {/* 메인: 보드 + 사이드 */}
        <View style={slide3Styles.main}>
          <View style={slide3Styles.board}>
            {board.map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 1, marginBottom: ri < ROWS - 1 ? 1 : 0 }}>
                {row.map((cell, ci) =>
                  cell ? (
                    <BevelCell key={ci} size={CELL} color={cell} />
                  ) : (
                    <View
                      key={ci}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: 'rgba(42, 42, 80, 0.3)',
                        borderRadius: 1,
                      }}
                    />
                  )
                )}
              </View>
            ))}
          </View>

          <View style={slide3Styles.side}>
            <View style={slide3Styles.nextBox}>
              <Text style={slide3Styles.nextLabel}>NEXT</Text>
              <View style={{ flexDirection: 'row', gap: 1, justifyContent: 'center' }}>
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
                <BevelCell size={9} color="#0088FF" />
              </View>
            </View>

            <View style={slide3Styles.scoreBox}>
              <Text style={slide3Styles.scoreLabel}>SCORE</Text>
              <Text style={slide3Styles.scoreVal}>1,250</Text>
            </View>

            <View style={slide3Styles.todoBox}>
              <Text style={slide3Styles.todoLabel}>TODO</Text>
              <View style={slide3Styles.todoItem}>
                <View style={slide3Styles.todoDot} />
                <Text style={slide3Styles.todoText} numberOfLines={1}>TS 강의 듣기</Text>
              </View>
              <View style={slide3Styles.todoItem}>
                <View style={slide3Styles.todoDot} />
                <Text style={slide3Styles.todoText} numberOfLines={1}>운동하기</Text>
              </View>
              <View style={slide3Styles.todoItem}>
                <View style={slide3Styles.todoDot} />
                <Text style={slide3Styles.todoText} numberOfLines={1}>블로그 포스팅...</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 하단 컨트롤 */}
        <View style={slide3Styles.controls}>
          <View style={slide3Styles.ctrl}>
            <Text style={slide3Styles.ctrlText}>◀</Text>
          </View>
          <View style={slide3Styles.ctrl}>
            <Text style={slide3Styles.ctrlText}>▶</Text>
          </View>
          <View style={{ width: 4 }} />
          <View style={[slide3Styles.ctrl, slide3Styles.ctrlDown]}>
            <Text style={[slide3Styles.ctrlText, { color: COLORS.neonGreen }]}>▼</Text>
          </View>
          <View style={{ width: 4 }} />
          <View style={[slide3Styles.ctrl, slide3Styles.ctrlRot]}>
            <Text style={[slide3Styles.ctrlText, { color: COLORS.neonYellow }]}>↻</Text>
          </View>
        </View>
      </View>

      {/* 카피 */}
      <View style={slide1Styles.caption}>
        <Text style={[styles.headline, { textAlign: 'left' }]}>
          홈화면에서 <Text style={styles.accentYellow}>바로 플레이</Text>
        </Text>
        <Text style={[slide2Styles.hintRow, { textAlign: 'left', color: COLORS.textSecondary }]}>
          위젯 버튼을 눌러 블록을 움직이고 줄을 지우세요.
        </Text>
        <Text style={[slide2Styles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          턴제라 원할 때만 진행됩니다.
        </Text>
      </View>
    </View>
  )
}

// ===================================================================
// SLIDE 4: 성취 CRT 모달
// ===================================================================

function Slide4() {
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
    <View style={styles.slide}>
      <View style={slide4Styles.housing}>
        {/* CRT 헤더 */}
        <View style={slide4Styles.head}>
          <View style={slide4Styles.headLeft}>
            <Animated.View style={[slide4Styles.led, { opacity: led }]} />
            <Text style={slide4Styles.brand}>TETRIS-OS v1.0</Text>
          </View>
          <View style={slide4Styles.closeBtn}>
            <Text style={slide4Styles.closeText}>×</Text>
          </View>
        </View>

        {/* CRT 스크린 */}
        <View style={slide4Styles.screen}>
          <Scanlines intensity={0.025} />

          <Text style={slide4Styles.screenTitle}>COMPLETED LINES</Text>

          {/* LINE #3 펼침 DOUBLE */}
          <View style={[slide4Styles.line, slide4Styles.lineOpen]}>
            <View style={slide4Styles.lineHead}>
              <View style={slide4Styles.lineLeft}>
                <Text style={[slide4Styles.lineNum, slide4Styles.lineNumOpen]}>#3</Text>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={slide4Styles.lineLabel}>DOUBLE</Text>
                    <View style={slide4Styles.badge}>
                      <Text style={slide4Styles.badgeText}>x2</Text>
                    </View>
                  </View>
                  <Text style={slide4Styles.lineDate}>3월 29일</Text>
                </View>
              </View>
              <View style={slide4Styles.lineRight}>
                <Text style={slide4Styles.lineScore}>+400</Text>
                <Text style={slide4Styles.caretOpen}>▲</Text>
              </View>
            </View>
            <View style={slide4Styles.body}>
              <View style={slide4Styles.record}>
                <View style={[slide4Styles.recDot, { backgroundColor: '#00F0FF' }]} />
                <Text style={slide4Styles.recText}>TypeScript 강의 듣기</Text>
              </View>
              <View style={slide4Styles.record}>
                <View style={[slide4Styles.recDot, { backgroundColor: '#FF00E5' }]} />
                <Text style={slide4Styles.recText}>블로그 포스팅 작성</Text>
              </View>
              <View style={slide4Styles.record}>
                <View style={[slide4Styles.recDot, { backgroundColor: '#00FF88' }]} />
                <Text style={slide4Styles.recText}>운동하기</Text>
              </View>
            </View>
          </View>

          {/* LINE #2 접힘 */}
          <View style={[slide4Styles.line, slide4Styles.lineCollapsed]}>
            <View style={slide4Styles.lineHead}>
              <View style={slide4Styles.lineLeft}>
                <Text style={[slide4Styles.lineNum, slide4Styles.lineNumCollapsed]}>#2</Text>
                <View>
                  <Text style={slide4Styles.lineLabel}>SINGLE</Text>
                  <Text style={slide4Styles.lineDate}>3월 28일</Text>
                </View>
              </View>
              <View style={slide4Styles.lineRight}>
                <Text style={slide4Styles.lineScoreDim}>+100</Text>
                <Text style={slide4Styles.caretClosed}>▼</Text>
              </View>
            </View>
          </View>

          {/* LINE #1 접힘 */}
          <View style={[slide4Styles.line, slide4Styles.lineCollapsed]}>
            <View style={slide4Styles.lineHead}>
              <View style={slide4Styles.lineLeft}>
                <Text style={[slide4Styles.lineNum, slide4Styles.lineNumCollapsed]}>#1</Text>
                <View>
                  <Text style={slide4Styles.lineLabel}>SINGLE</Text>
                  <Text style={slide4Styles.lineDate}>3월 26일</Text>
                </View>
              </View>
              <View style={slide4Styles.lineRight}>
                <Text style={slide4Styles.lineScoreDim}>+100</Text>
                <Text style={slide4Styles.caretClosed}>▼</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 푸터 카운터 */}
        <View style={slide4Styles.footer}>
          <View style={slide4Styles.footItem}>
            <Text style={[slide4Styles.footVal, { color: COLORS.neonGreen }]}>4</Text>
            <Text style={slide4Styles.footLabel}>LINES</Text>
          </View>
          <View style={slide4Styles.footSep} />
          <View style={slide4Styles.footItem}>
            <Text style={[slide4Styles.footVal, { color: COLORS.neonYellow }]}>600</Text>
            <Text style={slide4Styles.footLabel}>SCORE</Text>
          </View>
          <View style={slide4Styles.footSep} />
          <View style={slide4Styles.footItem}>
            <Text style={[slide4Styles.footVal, { color: COLORS.neonCyan }]}>7</Text>
            <Text style={slide4Styles.footLabel}>TASKS</Text>
          </View>
        </View>
      </View>

      {/* 카피 */}
      <View style={slide1Styles.caption}>
        <Text style={[styles.headline, { textAlign: 'left' }]}>
          줄을 지우면 <Text style={styles.accentPurple}>성취가 됩니다</Text>
        </Text>
        <Text style={[slide2Styles.hintRow, { textAlign: 'left', color: COLORS.textSecondary }]}>
          사라진 블록의 기록들이 남아
        </Text>
        <Text style={[slide2Styles.hintText, { textAlign: 'left', color: COLORS.textSecondary }]}>
          오늘의 당신을 증명해줍니다.
        </Text>
      </View>
    </View>
  )
}

// ===================================================================
// 스타일
// ===================================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  slide: {
    width: SCREEN_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  headline: {
    fontFamily: 'InterBold',
    fontSize: 22,
    color: COLORS.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 6,
  },
  accentCyan: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  accentYellow: {
    color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  accentPurple: {
    color: '#A78BFA',
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  alignLeft: {
    textAlign: 'left',
  },

  // 하단
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: COLORS.bgPrimary,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(136, 136, 170, 0.35)',
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.neonCyan,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaPrimary: {
    backgroundColor: 'rgba(0, 240, 255, 0.22)',
    borderColor: 'rgba(0, 240, 255, 0.6)',
  },
  ctaText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    letterSpacing: 1,
    color: COLORS.neonCyan,
  },
  ctaPrimaryText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    letterSpacing: 1,
    color: COLORS.neonCyan,
  },
})

// ===================================================================
// SLIDE 1 전용 스타일
// ===================================================================

const slide1Styles = StyleSheet.create({
  // 히어로 컨테이너: 좌우 패딩을 캡션과 동일하게 맞춰 모든 내부 요소가 MOCKUP_W 범위 내에 정렬
  hero: {
    width: MOCKUP_W,
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

// ===================================================================
// SLIDE 2 전용 스타일
// ===================================================================

const slide2Styles = StyleSheet.create({
  phoneFrame: {
    width: MOCKUP_W,
    backgroundColor: '#0A0A1A',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 229, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 0, 0.3)',
    borderRadius: 5,
  },
  scoreText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: COLORS.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
  modeText: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.3,
  },
  modeTextActive: {
    color: COLORS.neonCyan,
    textShadowColor: COLORS.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  inputText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  addBtn: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    borderRadius: 8,
  },
  addBtnText: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: COLORS.neonCyan,
    letterSpacing: 0.8,
    textShadowColor: COLORS.neonCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingBottom: 6,
    gap: 2,
  },
  dateStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 5,
    overflow: 'hidden',
    height: 20,
  },
  dateArrow: {
    width: 14,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowText: {
    color: COLORS.textSecondary,
    fontSize: 8,
  },
  dateValWrap: {
    paddingHorizontal: 8,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  dateVal: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  dateUnit: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  todayPill: {
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 5,
  },
  todayPillText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  routinesSection: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingBottom: 6,
  },
  routinesLabel: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  chipStack: {
    position: 'relative',
    minHeight: 90,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 999,
    paddingLeft: 8,
    paddingRight: 3,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  chipX: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipXText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5555',
  },
  tapRing: {
    position: 'absolute',
    left: 8,
    top: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.7)',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  chipEditing: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  editLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: COLORS.neonYellow,
    letterSpacing: 1.5,
    marginBottom: 4,
    textShadowColor: 'rgba(255, 229, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  chipEditingName: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  dayPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  dayBtnText: {
    fontFamily: 'InterSemiBold',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  dayBtnTextActive: {
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'InterBold',
    fontSize: 9,
    color: COLORS.neonCyan,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'InterBold',
    fontSize: 9,
    color: 'rgba(0, 240, 255, 0.7)',
  },
  todaySection: {
    marginHorizontal: 8,
    marginVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.02)',
    paddingVertical: 4,
  },
  todaySectionLabel: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 2,
    fontFamily: 'PressStart2P',
    fontSize: 9,
    letterSpacing: 1.5,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    gap: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  dividerDt: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: 'rgba(0, 240, 255, 0.6)',
    textShadowColor: 'rgba(0, 240, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  dividerDtKr: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: 'rgba(0, 240, 255, 0.6)',
    textShadowColor: 'rgba(0, 240, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  swipeEdit: {
    width: 56,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeEditText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  swipeDel: {
    width: 56,
    backgroundColor: 'rgba(255, 51, 85, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeDelText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: COLORS.neonRed,
    textShadowColor: 'rgba(255, 51, 85, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 80, 0.4)',
    gap: 8,
    backgroundColor: '#0A0A1A',
  },
  rowSwipe: {},
  rowNum: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: COLORS.neonCyan,
    minWidth: 14,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  rowNumDone: {
    color: COLORS.textMuted,
    textShadowColor: 'transparent',
  },
  rowText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  rowTextDone: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
  },
  checkboxDone: {
    borderColor: COLORS.neonGreen,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    color: COLORS.neonGreen,
    fontSize: 11,
    fontWeight: 'bold',
  },
  miniBlockWrap: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    paddingHorizontal: 28,
    paddingTop: 50,
    paddingBottom: 4,
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
  hintRow: {
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    marginTop: 8,
  },
  hintArrow: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: COLORS.neonCyan,
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  hintText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
})

// ===================================================================
// SLIDE 3 전용 스타일
// ===================================================================

const slide3Styles = StyleSheet.create({
  widget: {
    width: MOCKUP_W,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
    marginTop: 10,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.1)',
  },
  newPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(42, 42, 80, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(85, 85, 119, 0.3)',
  },
  newText: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: 'rgba(136, 136, 170, 0.7)',
    letterSpacing: 0.8,
  },
  widgetTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    letterSpacing: 1.5,
    color: 'rgba(0, 240, 255, 0.8)',
    textShadowColor: 'rgba(0, 240, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  topbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pctText: {
    fontFamily: 'InterBold',
    fontSize: 9,
    color: 'rgba(255, 229, 0, 0.6)',
  },
  sunBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 229, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunText: {
    fontSize: 10,
    color: COLORS.neonYellow,
  },
  main: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  board: {
    padding: 2,
    backgroundColor: 'rgba(10, 10, 26, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 4,
  },
  side: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  nextBox: {
    backgroundColor: 'rgba(26, 26, 53, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  nextLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    letterSpacing: 1.2,
    color: 'rgba(0, 240, 255, 0.6)',
    marginBottom: 4,
  },
  scoreBox: {
    backgroundColor: 'rgba(26, 26, 53, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 0, 0.1)',
    borderRadius: 6,
    padding: 4,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    letterSpacing: 1.2,
    color: 'rgba(255, 229, 0, 0.6)',
  },
  scoreVal: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: COLORS.neonYellow,
    textShadowColor: COLORS.neonYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginTop: 2,
  },
  todoBox: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 53, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 229, 0.15)',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  todoLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    letterSpacing: 1.2,
    color: 'rgba(255, 0, 229, 0.6)',
    textAlign: 'center',
    marginBottom: 4,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  todoDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 0, 229, 0.7)',
  },
  todoText: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: 'rgba(136, 136, 170, 0.95)',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 240, 255, 0.08)',
  },
  ctrl: {
    width: 36,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  ctrlDown: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  ctrlRot: {
    backgroundColor: 'rgba(255, 229, 0, 0.08)',
    borderColor: 'rgba(255, 229, 0, 0.2)',
  },
  ctrlText: {
    fontSize: 12,
    color: COLORS.neonCyan,
  },
})

// ===================================================================
// SLIDE 4 전용 스타일
// ===================================================================

const slide4Styles = StyleSheet.create({
  housing: {
    width: MOCKUP_W,
    backgroundColor: '#2A2A3A',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 10,
    marginTop: 10,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  led: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neonGreen,
    shadowColor: COLORS.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  brand: {
    fontFamily: 'InterBold',
    fontSize: 9,
    color: COLORS.textMuted,
  },
  closeBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#3A3A4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  screen: {
    backgroundColor: '#050515',
    borderWidth: 2,
    borderColor: '#1A1A2A',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  screenTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: COLORS.neonCyan,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  line: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginBottom: 5,
    backgroundColor: 'rgba(26, 26, 53, 0.6)',
    borderWidth: 1,
  },
  lineOpen: {
    borderColor: 'rgba(255, 0, 229, 0.25)',
  },
  lineCollapsed: {
    borderColor: 'rgba(0, 240, 255, 0.12)',
  },
  lineHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  lineNum: {
    fontFamily: 'PressStart2P',
    fontSize: 13,
  },
  lineNumOpen: {
    color: COLORS.neonMagenta,
    textShadowColor: 'rgba(255, 0, 229, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  lineNumCollapsed: {
    color: 'rgba(0, 240, 255, 0.6)',
  },
  lineLabel: {
    fontFamily: 'InterBold',
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  lineDate: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 0, 229, 0.1)',
  },
  badgeText: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: COLORS.neonMagenta,
  },
  lineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  lineScore: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: COLORS.neonYellow,
    textShadowColor: 'rgba(255, 229, 0, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  lineScoreDim: {
    fontFamily: 'PressStart2P',
    fontSize: 9,
    color: 'rgba(255, 229, 0, 0.5)',
  },
  caretOpen: {
    fontSize: 9,
    color: COLORS.neonMagenta,
  },
  caretClosed: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  body: {
    marginTop: 7,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 0, 229, 0.15)',
    gap: 4,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomColor: 'rgba(0,0,0,0.55)',
    borderRightColor: 'rgba(0,0,0,0.5)',
  },
  recText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
  },
  footItem: {
    alignItems: 'center',
  },
  footVal: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  footLabel: {
    fontFamily: 'InterBold',
    fontSize: 8,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  footSep: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(42, 42, 80, 0.5)',
  },
})
