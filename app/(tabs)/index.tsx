import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  AppState,
  Animated,
  AccessibilityInfo,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/gameStore'
import { useTaskStore } from '@/stores/taskStore'
import { getColorHex, getRandomColorId } from '@/lib/colorMapper'
import { BLOCK_TYPES, BLOCK_TYPE_COLORS } from '@/constants/tetris'
import widgetBridge from '@/lib/widgetBridge'
import type { Task, Routine, DayOfWeek } from '@/types/record'
import type { QueuedBlock, GameHistory, GameHistoryAchievement } from '@/types/game'
import { useHistoryStore } from '@/stores/historyStore'
import { homeStyles as styles } from '@/constants/homeStyles'
import { MiniBlock } from '@/components/ui/MiniBlock'
import { RefreshIcon, StarIcon, ClipboardIcon, SkullIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons'

const today = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const

const getTodayDayOfWeek = (): DayOfWeek => {
  return new Date().getDay() as DayOfWeek
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const tasks = useTaskStore((s) => s.tasks)
  const routines = useTaskStore((s) => s.routines)
  const addTask = useTaskStore((s) => s.addTask)
  const updateTask = useTaskStore((s) => s.updateTask)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const setTasks = useTaskStore((s) => s.setTasks)
  const addRoutine = useTaskStore((s) => s.addRoutine)
  const updateRoutine = useTaskStore((s) => s.updateRoutine)
  const removeRoutine = useTaskStore((s) => s.removeRoutine)
  const genId = useTaskStore((s) => s.genId)
  const addHistory = useHistoryStore((s) => s.addHistory)

  const [todayStr, setTodayStr] = useState(() => today())
  const [achievements, setAchievements] = useState<GameHistoryAchievement[]>([])
  const [inputText, setInputText] = useState('')
  const [inputMode, setInputMode] = useState<'task' | 'routine'>('task')
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([0, 1, 2, 3, 4, 5, 6])
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate())
  const [popupVisible, setPopupVisible] = useState(false)
  const [expandedAchId, setExpandedAchId] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  // 수정 모드
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editMonth, setEditMonth] = useState(1)
  const [editDay, setEditDay] = useState(1)
  // 루틴 수정 모드
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null)
  const [editRoutineDays, setEditRoutineDays] = useState<DayOfWeek[]>([])
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set())
  const historySavedRef = useRef(false)
  const addBlock = useGameStore((s) => s.addBlock)
  const addPenalties = useGameStore((s) => s.addPenalties)
  const applyDailyBonusStore = useGameStore((s) => s.applyDailyBonus)
  const resetGame = useGameStore((s) => s.resetGame)
  const syncScore = useGameStore((s) => s.syncScore)
  const gameScore = useGameStore((s) => s.gameState.score)

  // 날짜 선택기: 현재 년도 고정, 과거 날짜 선택 불가
  const currentYear = new Date().getFullYear()
  const [todayMonth, todayDay] = useMemo(() => {
    const [, m, d] = todayStr.split('-').map(Number)
    return [m, d]
  }, [todayStr])

  const selectedDateStr = useMemo(() => {
    return `${currentYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  }, [currentYear, selectedMonth, selectedDay])

  const isSelectedToday = selectedDateStr === todayStr

  // 과거 날짜 체크: 선택된 날짜가 오늘 이전인지
  const isPastDate = useCallback((month: number, day: number) => {
    return month < todayMonth || (month === todayMonth && day < todayDay)
  }, [todayMonth, todayDay])

  const changeMonth = useCallback((delta: number) => {
    setSelectedMonth(prev => {
      const next = prev + delta
      if (next < 1 || next > 12) return prev
      // 과거 월로 이동 불가
      if (next < todayMonth) return prev
      return next
    })
    // 월 변경 시 1일로 초기화 (과거면 오늘 일자로)
    setSelectedDay(() => {
      // 새 월을 직접 계산 (stale closure 방지)
      const newMonth = (() => {
        const next = selectedMonth + delta
        if (next < 1 || next > 12 || next < todayMonth) return selectedMonth
        return next
      })()
      if (newMonth === todayMonth) return todayDay
      return 1
    })
  }, [selectedMonth, todayMonth, todayDay])

  const changeDay = useCallback((delta: number) => {
    setSelectedDay(prev => {
      const maxDay = new Date(currentYear, selectedMonth, 0).getDate()
      const minDay = selectedMonth === todayMonth ? todayDay : 1
      const next = prev + delta
      if (next < minDay || next > maxDay) return prev
      return next
    })
  }, [selectedMonth, currentYear, todayMonth, todayDay])

  const resetToToday = useCallback(() => {
    setSelectedMonth(todayMonth)
    setSelectedDay(todayDay)
  }, [todayMonth, todayDay])

  // 날짜 선택기 경계 상태 (버튼 비활성화용)
  const canMonthLeft = selectedMonth > todayMonth
  const canMonthRight = selectedMonth < 12
  const selectedMaxDay = new Date(currentYear, selectedMonth, 0).getDate()
  const selectedMinDay = selectedMonth === todayMonth ? todayDay : 1
  const canDayLeft = selectedDay > selectedMinDay
  const canDayRight = selectedDay < selectedMaxDay

  // 모달 fade 애니메이션
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  const openModal = useCallback(() => {
    setPopupVisible(true)
    fadeAnim.setValue(0)
    scaleAnim.setValue(0.9)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, scaleAnim])

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setPopupVisible(false))
  }, [fadeAnim, scaleAnim])

  // 위젯 상태 동기화 + 게임오버 시 히스토리 저장
  useEffect(() => {
    const checkWidgetState = async () => {
      try {
        const gameOver = await widgetBridge.isGameOver()
        const widgetScore = await widgetBridge.getScore()
        const achJson = await widgetBridge.getAchievements()
        const raw = JSON.parse(achJson)
        const parsed: GameHistoryAchievement[] = Array.isArray(raw) ? raw : []

        if (__DEV__) console.log('[위젯 동기화]', { gameOver, widgetScore, achCount: parsed.length, historySaved: historySavedRef.current })

        // 게임 오버 최초 감지 → 히스토리 저장
        if (gameOver && !historySavedRef.current) {
          const currentTasks = useTaskStore.getState().tasks
          const completedTasks = currentTasks
            .filter(t => t.status === 'completed' && t.blockType && t.colorId !== null)
            .map(t => ({
              content: t.content,
              blockType: t.blockType!,
              colorId: t.colorId!,
              completedAt: t.completedAt ?? Date.now(),
            }))

          const history: GameHistory = {
            id: useTaskStore.getState().genId('history'),
            endedAt: Date.now(),
            finalScore: widgetScore,
            totalLineClears: parsed.reduce((sum, a) => sum + a.lineCount, 0),
            completedTasks,
            achievements: parsed,
          }
          if (__DEV__) console.log('[히스토리 저장]', { id: history.id, score: history.finalScore, tasks: completedTasks.length })
          useHistoryStore.getState().addHistory(history)
          if (__DEV__) console.log('[히스토리 저장 완료] 전체 개수:', useHistoryStore.getState().histories.length)

          // 완료된 태스크를 archived로 변경
          useTaskStore.getState().setTasks(prev => prev.map(t =>
            t.status === 'completed' ? { ...t, status: 'archived' as const } : t
          ))

          historySavedRef.current = true
          AccessibilityInfo.announceForAccessibility('게임 오버. 기록이 저장되었습니다.')
        }

        // 위젯 리셋 감지 → 앱 게임 리셋 + 성취 초기화
        if (!gameOver && historySavedRef.current) {
          resetGame()
          historySavedRef.current = false
          setIsGameOver(false)
          syncScore(0)
          setAchievements([])
          return
        }

        setIsGameOver(gameOver)
        syncScore(widgetScore)
        setAchievements(parsed)
      } catch (e) {
        if (__DEV__) console.warn('위젯 동기화 실패:', e)
      }
    }

    checkWidgetState()

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const newToday = today()
        setTodayStr(newToday)
        // 날짜가 바뀌었으면 날짜 선택기도 오늘로 리셋
        const [, m, d] = newToday.split('-').map(Number)
        setSelectedMonth(m)
        setSelectedDay(d)
        checkWidgetState()
      }
    })

    return () => sub.remove()
  }, [resetGame, syncScore])

  // 매일 루틴에서 오늘의 할 일 자동 생성 + 전날 미완료 페널티 체크
  // 하나의 setTasks로 배치 처리하여 리렌더링 1회로 줄임
  useEffect(() => {
    const todayStr = today()
    const [y, m, d] = todayStr.split('-').map(Number)
    const yesterday = new Date(y, m - 1, d - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`

    setTasks(prev => {
      let result = prev

      // 1) 루틴에서 오늘 할 일 생성 (요일 체크)
      const todayDay = getTodayDayOfWeek()
      const todayRoutineTasks = result.filter(t => t.date === todayStr && t.isRoutine)
      const missingRoutines = routines.filter(
        r => r.active
          && (r.days ?? [0, 1, 2, 3, 4, 5, 6]).includes(todayDay)
          && !todayRoutineTasks.some(t => t.routineId === r.id)
      )
      if (missingRoutines.length > 0) {
        const newTasks = missingRoutines.map(r => ({
          id: genId('task'),
          content: r.content,
          date: todayStr,
          status: 'pending' as const,
          isRoutine: true,
          routineId: r.id,
          blockType: null,
          colorId: null,
          createdAt: Date.now(),
          completedAt: null,
        }))
        result = [...newTasks, ...result]
      }

      // 2) 전날 미완료 → 페널티
      const pendingYesterday = result.filter(
        t => t.date === yesterdayStr && t.status === 'pending'
      )
      if (pendingYesterday.length > 0) {
        result = result.map(t =>
          t.date === yesterdayStr && t.status === 'pending'
            ? { ...t, status: 'failed' as const }
            : t
        )
        addPenalties(pendingYesterday.length)
      }

      return result
    })
  }, [routines, addPenalties, setTasks, genId])

  // 할 일 추가
  const handleAddTask = useCallback(() => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    let routineId: string | null = null
    if (inputMode === 'routine') {
      const newRoutine: Routine = {
        id: genId('routine'),
        content: trimmed,
        active: true,
        days: [...selectedDays],
        createdAt: Date.now(),
      }
      addRoutine(newRoutine)
      routineId = newRoutine.id
      setSelectedDays([0, 1, 2, 3, 4, 5, 6])
    }

    const taskDate = inputMode === 'task' ? selectedDateStr : today()
    const newTask: Task = {
      id: genId('task'),
      content: trimmed,
      date: taskDate,
      status: 'pending',
      isRoutine: inputMode === 'routine',
      routineId,
      blockType: null,
      colorId: null,
      createdAt: Date.now(),
      completedAt: null,
    }
    addTask(newTask)
    setInputText('')
  }, [inputText, inputMode, selectedDays, selectedDateStr, genId, addRoutine, addTask])

  // setTimeout cleanup용 ref
  const completionTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  useEffect(() => {
    return () => {
      completionTimersRef.current.forEach(timer => clearTimeout(timer))
      completionTimersRef.current.clear()
    }
  }, [])

  // 할 일 완료
  const handleComplete = useCallback((taskId: string) => {
    if (isGameOver) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    // 오늘 날짜의 할 일만 완료 가능
    if (task.date !== todayStr) return

    const randomBlock = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    const colorId = getRandomColorId()

    const queuedBlock: QueuedBlock = {
      type: randomBlock,
      colorId,
      sourceRecordId: taskId,
    }
    addBlock(queuedBlock, task.content)

    updateTask(taskId, {
      status: 'completed',
      blockType: randomBlock,
      colorId,
      completedAt: Date.now(),
    })

    // 체크 표시 → 1초 후 미니블록으로 전환
    setRecentlyCompleted(prev => new Set(prev).add(taskId))
    const timer = setTimeout(() => {
      setRecentlyCompleted(prev => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
      completionTimersRef.current.delete(taskId)
    }, 1000)
    completionTimersRef.current.set(taskId, timer)

    applyDailyBonusStore(todayStr)
  }, [tasks, addBlock, updateTask, applyDailyBonusStore, todayStr, isGameOver])

  // 루틴 삭제
  const handleDeleteRoutine = useCallback((routineId: string) => {
    Alert.alert('루틴 삭제', '이 루틴을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => removeRoutine(routineId),
      },
    ])
  }, [removeRoutine])

  // 루틴 수정 시작
  const startEditingRoutine = useCallback((routine: Routine) => {
    setEditingRoutineId(routine.id)
    setEditRoutineDays([...(routine.days ?? [0, 1, 2, 3, 4, 5, 6])])
  }, [])

  // 루틴 수정 저장
  const saveRoutineEdit = useCallback(() => {
    if (!editingRoutineId) return
    updateRoutine(editingRoutineId, { days: editRoutineDays })
    setEditingRoutineId(null)
  }, [editingRoutineId, editRoutineDays, updateRoutine])

  // 루틴 수정 취소
  const cancelRoutineEdit = useCallback(() => {
    setEditingRoutineId(null)
  }, [])

  // 수정 모드 시작
  const startEditing = useCallback((task: Task) => {
    if (task.status === 'failed') return
    const [, m, d] = task.date.split('-').map(Number)
    setEditingTaskId(task.id)
    setEditText(task.content)
    setEditMonth(m)
    setEditDay(d)
  }, [])

  // 수정 저장
  const saveEdit = useCallback(() => {
    if (!editingTaskId || !editText.trim()) return
    const currentYear = new Date().getFullYear()
    const newDate = `${currentYear}-${String(editMonth).padStart(2, '0')}-${String(editDay).padStart(2, '0')}`
    updateTask(editingTaskId, { content: editText.trim(), date: newDate })
    setEditingTaskId(null)
  }, [editingTaskId, editText, editMonth, editDay, updateTask])

  // 수정 취소
  const cancelEdit = useCallback(() => {
    setEditingTaskId(null)
  }, [])

  // 수정 중 삭제
  const handleDeleteTask = useCallback(() => {
    if (!editingTaskId) return
    Alert.alert('할 일 삭제', '이 할 일을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteTask(editingTaskId)
          setEditingTaskId(null)
        },
      },
    ])
  }, [editingTaskId, deleteTask])

  // 수정 모드 날짜 변경 (오늘 이전 불가)
  const changeEditMonth = useCallback((delta: number) => {
    const [, todayM, todayD] = todayStr.split('-').map(Number)
    setEditMonth(prev => {
      const next = prev + delta
      if (next < 1 || next > 12 || next < todayM) return prev
      return next
    })
    setEditDay(prev => {
      const currentYear = new Date().getFullYear()
      const newMonth = (() => {
        const next = editMonth + delta
        if (next < 1 || next > 12 || next < todayM) return editMonth
        return next
      })()
      if (newMonth === todayM) return Math.max(prev, todayD)
      return 1
    })
  }, [editMonth, todayStr])

  const changeEditDay = useCallback((delta: number) => {
    const [, todayM, todayD] = todayStr.split('-').map(Number)
    const currentYear = new Date().getFullYear()
    const maxDay = new Date(currentYear, editMonth, 0).getDate()
    const minDay = editMonth === todayM ? todayD : 1
    setEditDay(prev => {
      const next = prev + delta
      if (next < minDay || next > maxDay) return prev
      return next
    })
  }, [editMonth, todayStr])

  // 수정 모드 날짜 경계 상태
  const canEditMonthLeft = editMonth > todayMonth
  const canEditMonthRight = editMonth < 12
  const editMaxDay = new Date(currentYear, editMonth, 0).getDate()
  const editMinDay = editMonth === todayMonth ? todayDay : 1
  const canEditDayLeft = editDay > editMinDay
  const canEditDayRight = editDay < editMaxDay

  // 자정 체크: 날짜가 바뀌면 수정 모드 자동 종료
  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = today()
      if (nowStr !== todayStr) {
        setTodayStr(nowStr)
        const [, m, d] = nowStr.split('-').map(Number)
        setSelectedMonth(m)
        setSelectedDay(d)
        // 수정 모드 강제 종료
        if (editingTaskId) {
          setEditingTaskId(null)
        }
      }
    }, 10000) // 10초마다 체크
    return () => clearInterval(interval)
  }, [todayStr, editingTaskId])

  // archived 제외한 모든 할 일을 날짜별로 그룹핑 (최신 날짜 먼저)
  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'archived'), [tasks])
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const t of activeTasks) {
      if (!groups[t.date]) groups[t.date] = []
      groups[t.date].push(t)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [activeTasks])

  const formatDateHeader = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-')
    return `${Number(m)}월 ${Number(d)}일`
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* 미니 테트리스 블록 아이콘 */}
          <View style={styles.headerBlockIcon}>
            <View style={[styles.headerBlock, { backgroundColor: '#00F0FF' }]} />
            <View style={[styles.headerBlock, { backgroundColor: '#FF00E5' }]} />
          </View>
          <Text style={styles.title}>TODAY I DID</Text>
        </View>
        <View style={styles.headerRight}>
          {isGameOver && (
            <View style={styles.gameOverBadge}>
              <Text style={styles.gameOverText}>GAME OVER</Text>
            </View>
          )}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>SCORE {gameScore}</Text>
          </View>
        </View>
      </View>

      {/* 입력 모드 토글 */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, inputMode === 'task' && styles.modeButtonActive]}
          onPress={() => setInputMode('task')}
          accessibilityLabel="할 일 모드"
          accessibilityRole="button"
        >
          <Text style={[styles.modeText, inputMode === 'task' && styles.modeTextActive]}>할 일</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, inputMode === 'routine' && styles.modeButtonActive]}
          onPress={() => setInputMode('routine')}
          accessibilityLabel="루틴 모드"
          accessibilityRole="button"
        >
          <Text style={[styles.modeText, inputMode === 'routine' && styles.modeTextActive]}>루틴</Text>
        </Pressable>
      </View>

      {/* 입력 */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={inputMode === 'task'
              ? (isSelectedToday ? '오늘 할 일을 적어주세요...' : `${selectedMonth}월 ${selectedDay}일 할 일을 적어주세요...`)
              : '매일 반복할 일을 적어주세요...'}
            placeholderTextColor="#555577"
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addButton, (!inputText.trim() || isGameOver) && styles.addButtonDisabled]}
            onPress={handleAddTask}
            disabled={!inputText.trim() || isGameOver}
            accessibilityLabel="추가"
            accessibilityRole="button"
          >
            <Text style={styles.addButtonText}>{isGameOver ? 'OVER' : 'ADD'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* 날짜 선택 (할 일 모드일 때) */}
      {inputMode === 'task' && (
        <View style={styles.datePickerRow}>
          {/* 월 선택 */}
          <View style={styles.datePickerGroup}>
            <View style={styles.datePickerBlock}>
              <Pressable
                style={[styles.datePickerArrow, styles.datePickerArrowLeft, !canMonthLeft && { opacity: 0.2 }]}
                onPress={() => changeMonth(-1)}
                disabled={!canMonthLeft}
                accessibilityLabel="이전 월"
              >
                <ChevronLeftIcon size={10} color="#8888AA" />
              </Pressable>
              <View style={styles.datePickerValue}>
                <Text style={styles.datePickerValueText}>
                  {String(selectedMonth).padStart(2, '0')}
                </Text>
              </View>
              <Pressable
                style={[styles.datePickerArrow, styles.datePickerArrowRight, !canMonthRight && { opacity: 0.2 }]}
                onPress={() => changeMonth(1)}
                disabled={!canMonthRight}
                accessibilityLabel="다음 월"
              >
                <ChevronRightIcon size={10} color="#8888AA" />
              </Pressable>
            </View>
            <Text style={styles.datePickerLabel}>월</Text>
          </View>

          {/* 일 선택 */}
          <View style={styles.datePickerGroup}>
            <View style={styles.datePickerBlock}>
              <Pressable
                style={[styles.datePickerArrow, styles.datePickerArrowLeft, !canDayLeft && { opacity: 0.2 }]}
                onPress={() => changeDay(-1)}
                disabled={!canDayLeft}
                accessibilityLabel="이전 일"
              >
                <ChevronLeftIcon size={10} color="#8888AA" />
              </Pressable>
              <View style={styles.datePickerValue}>
                <Text style={styles.datePickerValueText}>
                  {String(selectedDay).padStart(2, '0')}
                </Text>
              </View>
              <Pressable
                style={[styles.datePickerArrow, styles.datePickerArrowRight, !canDayRight && { opacity: 0.2 }]}
                onPress={() => changeDay(1)}
                disabled={!canDayRight}
                accessibilityLabel="다음 일"
              >
                <ChevronRightIcon size={10} color="#8888AA" />
              </Pressable>
            </View>
            <Text style={styles.datePickerLabel}>일</Text>
          </View>

          {/* 오늘 복귀 버튼 */}
          <Pressable
            style={[styles.datePickerTodayButton, isSelectedToday && { opacity: 0.3 }]}
            onPress={resetToToday}
            disabled={isSelectedToday}
            accessibilityLabel="오늘 날짜로 복귀"
          >
            <RefreshIcon size={12} color="#00F0FF" />
            <Text style={styles.datePickerTodayText}>TODAY</Text>
          </Pressable>
        </View>
      )}

      {/* 요일 선택 (루틴 모드일 때만) */}
      {inputMode === 'routine' && (
        <View style={styles.dayRow}>
          {DAY_LABELS.map((label, i) => {
            const day = i as DayOfWeek
            const isSelected = selectedDays.includes(day)
            return (
              <Pressable
                key={day}
                style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                onPress={() => {
                  setSelectedDays(prev =>
                    prev.includes(day)
                      ? prev.filter(d => d !== day)
                      : [...prev, day].sort()
                  )
                }}
                accessibilityLabel={`${label}요일 ${isSelected ? '해제' : '선택'}`}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{label}</Text>
              </Pressable>
            )
          })}
        </View>
      )}

      {/* 루틴 목록 (있을 때만) */}
      {routines.length > 0 && (
        <View style={styles.routineSection}>
          <Text style={styles.sectionLabel}>ROUTINES</Text>
          <View style={styles.routineList}>
            {routines.map(r => {
              const isEditingThis = editingRoutineId === r.id
              if (isEditingThis) {
                return (
                  <View key={r.id} style={styles.routineEditContainer}>
                    <Text style={styles.editLabel}>EDIT</Text>
                    <Text style={styles.routineEditName}>{r.content}</Text>
                    <View style={styles.dayRow}>
                      {DAY_LABELS.map((label, i) => {
                        const day = i as DayOfWeek
                        const isSelected = editRoutineDays.includes(day)
                        return (
                          <Pressable
                            key={day}
                            style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                            onPress={() => {
                              setEditRoutineDays(prev =>
                                prev.includes(day)
                                  ? prev.filter(d => d !== day)
                                  : [...prev, day].sort()
                              )
                            }}
                          >
                            <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{label}</Text>
                          </Pressable>
                        )
                      })}
                    </View>
                    <View style={styles.editButtonRow}>
                      <Pressable style={styles.editSaveButton} onPress={saveRoutineEdit}>
                        <Text style={styles.editSaveText}>SAVE</Text>
                      </Pressable>
                      <Pressable style={styles.editCancelButton} onPress={cancelRoutineEdit}>
                        <Text style={styles.editCancelText}>CANCEL</Text>
                      </Pressable>
                      <Pressable style={styles.editDeleteButton} onPress={() => {
                        setEditingRoutineId(null)
                        handleDeleteRoutine(r.id)
                      }}>
                        <SkullIcon size={14} color="#FF3355" />
                      </Pressable>
                    </View>
                  </View>
                )
              }
              return (
                <Pressable
                  key={r.id}
                  style={styles.routineChip}
                  onLongPress={() => startEditingRoutine(r)}
                >
                  <Text style={styles.routineChipText}>
                    {r.content} {(r.days ?? [0,1,2,3,4,5,6]).length === 7
                      ? '매일'
                      : (r.days ?? []).map(d => DAY_LABELS[d]).join('·')}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteRoutine(r.id)}
                    accessibilityLabel={`루틴 삭제: ${r.content}`}
                    style={styles.routineDeleteButton}
                  >
                    <Text style={styles.routineDeleteText}>✕</Text>
                  </Pressable>
                </Pressable>
              )
            })}
          </View>
        </View>
      )}

      {/* 할 일 리스트 — 날짜별 그룹핑 */}
      {activeTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <ClipboardIcon size={40} color="#555577" />
          <Text style={styles.emptyText}>오늘 할 일이 없어요</Text>
          <Text style={styles.emptySubText}>할 일을 추가하고 완료하면 블록이 생성돼요!</Text>
        </View>
      ) : (
        <FlatList
          data={groupedByDate}
          keyExtractor={([date]) => date}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: [date, dateTasks] }) => (
            <View>
              {/* 날짜 헤더 */}
              <View style={styles.dateHeader}>
                <View style={styles.dateLine} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.dateText}>{formatDateHeader(date)}</Text>
                  {date === todayStr && <Text style={styles.dateTodayLabel}>&lt;오늘&gt;</Text>}
                </View>
                <View style={styles.dateLine} />
              </View>

              {/* 해당 날짜의 할 일들 */}
              {dateTasks.map((item, index) => {
                const canComplete = item.status === 'pending' && item.date === todayStr
                const isEditing = editingTaskId === item.id
                const canEdit = item.status !== 'failed' && item.status !== 'archived' && item.status !== 'completed'

                // 수정 모드 UI
                if (isEditing) {
                  return (
                    <View key={item.id} style={styles.editContainer}>
                      <Text style={styles.editLabel}>EDIT</Text>
                      <TextInput
                        style={styles.editInput}
                        value={editText}
                        onChangeText={setEditText}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={saveEdit}
                      />
                      {/* 날짜 선택 */}
                      <View style={styles.editDateRow}>
                        <View style={styles.editDateGroup}>
                          <View style={styles.datePickerBlock}>
                            <Pressable
                              style={[styles.datePickerArrow, styles.datePickerArrowLeft, !canEditMonthLeft && { opacity: 0.2 }]}
                              onPress={() => changeEditMonth(-1)}
                              disabled={!canEditMonthLeft}
                            >
                              <ChevronLeftIcon size={10} color="#8888AA" />
                            </Pressable>
                            <View style={styles.datePickerValue}>
                              <Text style={styles.datePickerValueText}>
                                {String(editMonth).padStart(2, '0')}
                              </Text>
                            </View>
                            <Pressable
                              style={[styles.datePickerArrow, styles.datePickerArrowRight, !canEditMonthRight && { opacity: 0.2 }]}
                              onPress={() => changeEditMonth(1)}
                              disabled={!canEditMonthRight}
                            >
                              <ChevronRightIcon size={10} color="#8888AA" />
                            </Pressable>
                          </View>
                          <Text style={styles.datePickerLabel}>월</Text>
                        </View>
                        <View style={styles.editDateGroup}>
                          <View style={styles.datePickerBlock}>
                            <Pressable
                              style={[styles.datePickerArrow, styles.datePickerArrowLeft, !canEditDayLeft && { opacity: 0.2 }]}
                              onPress={() => changeEditDay(-1)}
                              disabled={!canEditDayLeft}
                            >
                              <ChevronLeftIcon size={10} color="#8888AA" />
                            </Pressable>
                            <View style={styles.datePickerValue}>
                              <Text style={styles.datePickerValueText}>
                                {String(editDay).padStart(2, '0')}
                              </Text>
                            </View>
                            <Pressable
                              style={[styles.datePickerArrow, styles.datePickerArrowRight, !canEditDayRight && { opacity: 0.2 }]}
                              onPress={() => changeEditDay(1)}
                              disabled={!canEditDayRight}
                            >
                              <ChevronRightIcon size={10} color="#8888AA" />
                            </Pressable>
                          </View>
                          <Text style={styles.datePickerLabel}>일</Text>
                        </View>
                      </View>
                      {/* 버튼 */}
                      <View style={styles.editButtonRow}>
                        <Pressable style={styles.editSaveButton} onPress={saveEdit}>
                          <Text style={styles.editSaveText}>SAVE</Text>
                        </Pressable>
                        <Pressable style={styles.editCancelButton} onPress={cancelEdit}>
                          <Text style={styles.editCancelText}>CANCEL</Text>
                        </Pressable>
                        <Pressable style={styles.editDeleteButton} onPress={handleDeleteTask}>
                          <SkullIcon size={14} color="#FF3355" />
                        </Pressable>
                      </View>
                    </View>
                  )
                }

                return (
                <Pressable
                  key={item.id}
                  style={styles.recordItem}
                  onPress={() => canComplete ? handleComplete(item.id) : null}
                  onLongPress={() => canEdit ? startEditing(item) : null}
                  disabled={!canComplete && !canEdit}
                  accessibilityLabel={canComplete ? `완료: ${item.content}` : item.content}
                >
                  <Text style={[styles.numberText, item.status === 'completed' && styles.numberTextCompleted]}>
                    {index + 1}
                  </Text>

                  <View style={styles.recordContent}>
                    <View style={styles.recordTextRow}>
                      <Text
                        style={[styles.recordText, item.status === 'completed' && styles.recordTextCompleted]}
                        numberOfLines={1}
                      >
                        {item.content}
                      </Text>
                      {item.isRoutine && <RefreshIcon size={12} color="#00F0FF" />}
                    </View>
                  </View>

                  {item.status === 'completed' && item.blockType && item.colorId ? (
                    recentlyCompleted.has(item.id) ? (
                      <View style={styles.pendingCheckbox}>
                        <Text style={styles.checkOverlay}>✓</Text>
                      </View>
                    ) : (
                      <View style={[styles.blockBadge, { backgroundColor: getColorHex(item.colorId) + '15' }]}>
                        <MiniBlock type={item.blockType} color={getColorHex(item.colorId)} />
                      </View>
                    )
                  ) : item.status === 'failed' ? (
                    <View style={[styles.blockBadge, { backgroundColor: 'rgba(255, 51, 85, 0.1)' }]}>
                      <SkullIcon size={18} color="#FF3355" />
                    </View>
                  ) : (
                    <View style={styles.pendingCheckbox} />
                  )}
                </Pressable>
                )
              })}
            </View>
          )}
        />
      )}

      {/* 완성 라인 플로팅 버튼 */}
      <Pressable
        style={[styles.fab, { bottom: 8 }]}
        onPress={openModal}
        accessibilityLabel="완성된 라인 보기"
        accessibilityRole="button"
      >
        <StarIcon size={24} color="#00F0FF" />
      </Pressable>

      {/* 완성 라인 팝업 — 두루마리 스타일 */}
      <Modal visible={popupVisible} animationType="none" transparent accessibilityViewIsModal>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Pressable style={styles.modalOverlayTouchable} onPress={closeModal} />
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            {/* 두루마리 상단 손잡이 */}
            <View style={styles.scrollHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>COMPLETED LINES</Text>
              <Pressable onPress={closeModal} accessibilityLabel="닫기">
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            {achievements.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.emptyTextScroll}>아직 완성된 라인이 없어요</Text>
                <Text style={styles.emptySubTextScroll}>위젯에서 테트리스 줄을 완성해보세요!</Text>
              </View>
            ) : (
              <FlatList
                data={achievements}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                  const isExpanded = expandedAchId === item.id
                  return (
                    <Pressable
                      style={styles.achievementItem}
                      onPress={() => setExpandedAchId(isExpanded ? null : item.id)}
                      accessibilityLabel={`라인 ${index + 1} 상세보기`}
                    >
                      <View style={styles.achievementHeader}>
                        <View style={styles.achievementLeft}>
                          <Text style={styles.achievementTitle}>
                            LINE #{index + 1}
                          </Text>
                          <Text style={styles.achievementMeta}>
                            {item.lineCount}줄 · +{item.score} · {new Date(item.clearedAt).toLocaleDateString('ko-KR')}
                          </Text>
                        </View>
                        <Text style={styles.achievementArrow}>
                          {isExpanded ? '▲' : '▼'}
                        </Text>
                      </View>
                      {isExpanded && (
                        <View style={styles.achievementBody}>
                          {(item.records ?? []).length > 0 ? (
                            item.records.map((rec) => (
                              <View key={rec.id} style={styles.achievementRecordRow}>
                                <View style={[styles.blockColorDot, { backgroundColor: BLOCK_TYPE_COLORS[rec.blockType] || '#666688' }]} />
                                <Text style={styles.achievementRecord}>
                                  {rec.content || `기록`}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.achievementRecord}>기록 {item.recordIds.length}개</Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  )
                }}
              />
            )}

            {/* 두루마리 하단 손잡이 */}
            <View style={styles.scrollHandleBottom} />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  )
}
