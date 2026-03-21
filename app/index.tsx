import { useState, useCallback, useEffect, useMemo } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/gameStore'
import { getColorHex, getRandomColorId } from '@/lib/colorMapper'
import { BLOCK_TYPES } from '@/constants/tetris'
import widgetBridge from '@/lib/widgetBridge'
import type { Task, Routine } from '@/types/record'
import type { QueuedBlock } from '@/types/game'
import { homeStyles as styles } from '@/constants/homeStyles'

interface AchievementRecord {
  id: string
  content: string
  blockType: string
}

interface WidgetAchievement {
  id: string
  recordIds: string[]
  records: AchievementRecord[]
  lineCount: number
  score: number
  clearedAt: number
}

let idCounter = 0
const genId = (prefix: string) => `${prefix}_${++idCounter}_${Date.now()}`
const today = () => new Date().toISOString().slice(0, 10)

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [achievements, setAchievements] = useState<WidgetAchievement[]>([])
  const [inputText, setInputText] = useState('')
  const [inputMode, setInputMode] = useState<'task' | 'routine'>('task')
  const [popupVisible, setPopupVisible] = useState(false)
  const [expandedAchId, setExpandedAchId] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const addBlock = useGameStore((s) => s.addBlock)
  const addPenalties = useGameStore((s) => s.addPenalties)
  const applyDailyBonusStore = useGameStore((s) => s.applyDailyBonus)
  const resetGame = useGameStore((s) => s.resetGame)
  const syncScore = useGameStore((s) => s.syncScore)
  const gameScore = useGameStore((s) => s.gameState.score)

  // 위젯 게임 오버 상태 + 성취 데이터 동기화
  useEffect(() => {
    const checkWidgetState = async () => {
      const gameOver = await widgetBridge.isGameOver()

      // 위젯에서 리셋됐으면 앱 쪽 score도 리셋
      if (isGameOver && !gameOver) {
        resetGame()
      }
      setIsGameOver(gameOver)

      // 위젯의 실제 score를 앱에 동기화 (줄 클리어 점수 반영)
      const widgetScore = await widgetBridge.getScore()
      syncScore(widgetScore)

      const achJson = await widgetBridge.getAchievements()
      const parsed = JSON.parse(achJson) as WidgetAchievement[]
      setAchievements(parsed)
    }

    checkWidgetState()

    // 앱이 포그라운드로 돌아올 때마다 체크
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkWidgetState()
    })

    return () => sub.remove()
  }, [])

  // 매일 루틴에서 오늘의 할 일 자동 생성 + 전날 미완료 페널티 체크
  // 하나의 setTasks로 배치 처리하여 리렌더링 1회로 줄임
  useEffect(() => {
    const todayStr = today()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    setTasks(prev => {
      let result = prev

      // 1) 루틴에서 오늘 할 일 생성
      const todayRoutineTasks = result.filter(t => t.date === todayStr && t.isRoutine)
      const missingRoutines = routines.filter(
        r => r.active && !todayRoutineTasks.some(t => t.routineId === r.id)
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
  }, [routines, addPenalties])

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
        createdAt: Date.now(),
      }
      setRoutines(prev => [...prev, newRoutine])
      routineId = newRoutine.id
    }

    const newTask: Task = {
      id: genId('task'),
      content: trimmed,
      date: today(),
      status: 'pending',
      isRoutine: inputMode === 'routine',
      routineId,
      blockType: null,
      colorId: null,
      createdAt: Date.now(),
      completedAt: null,
    }
    setTasks(prev => [newTask, ...prev])
    setInputText('')
  }, [inputText, inputMode])

  // 할 일 완료 — setTasks의 콜백에서 content를 가져와 tasks 의존성 제거
  const handleComplete = useCallback((taskId: string) => {
    const randomBlock = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    const colorId = getRandomColorId()

    setTasks(prev => {
      const task = prev.find(t => t.id === taskId)
      if (task) {
        const queuedBlock: QueuedBlock = {
          type: randomBlock,
          colorId,
          sourceRecordId: taskId,
        }
        addBlock(queuedBlock, task.content)
      }
      return prev.map(t =>
        t.id === taskId
          ? { ...t, status: 'completed' as const, blockType: randomBlock, colorId, completedAt: Date.now() }
          : t
      )
    })

    applyDailyBonusStore(todayStr)
  }, [addBlock, applyDailyBonusStore, todayStr])

  // 루틴 삭제
  const handleDeleteRoutine = useCallback((routineId: string) => {
    Alert.alert('루틴 삭제', '이 루틴을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => setRoutines(prev => prev.filter(r => r.id !== routineId)),
      },
    ])
  }, [])

  // 오늘 할 일 필터링 메모이제이션 — tasks 변경 시에만 재계산
  const todayStr = useMemo(() => today(), [])
  const todayTasks = useMemo(() => tasks.filter(t => t.date === todayStr), [tasks, todayStr])
  const formatDate = (dateStr: string) => dateStr.slice(5).replace('-', '.')

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>TODAY I DID</Text>
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
        >
          <Text style={[styles.modeText, inputMode === 'task' && styles.modeTextActive]}>할 일</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, inputMode === 'routine' && styles.modeButtonActive]}
          onPress={() => setInputMode('routine')}
          accessibilityLabel="루틴 모드"
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
            placeholder={inputMode === 'task' ? '오늘 할 일을 적어주세요...' : '매일 반복할 일을 적어주세요...'}
            placeholderTextColor="#666688"
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addButton, (!inputText.trim() || isGameOver) && styles.addButtonDisabled]}
            onPress={handleAddTask}
            disabled={!inputText.trim() || isGameOver}
            accessibilityLabel="추가"
          >
            <Text style={styles.addButtonText}>{isGameOver ? 'OVER' : inputMode === 'task' ? 'ADD' : '+루틴'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* 루틴 목록 (있을 때만) */}
      {routines.length > 0 && (
        <View style={styles.routineSection}>
          <Text style={styles.sectionLabel}>ROUTINES</Text>
          <View style={styles.routineList}>
            {routines.map(r => (
              <Pressable
                key={r.id}
                style={styles.routineChip}
                onLongPress={() => handleDeleteRoutine(r.id)}
                accessibilityLabel={`루틴: ${r.content}`}
              >
                <Text style={styles.routineChipText}>🔄 {r.content}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* 할 일 리스트 */}
      {todayTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>오늘 할 일이 없어요</Text>
          <Text style={styles.emptySubText}>할 일을 추가하고 완료하면 블록이 생성돼요!</Text>
        </View>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.recordItem}
              onPress={() => item.status === 'pending' ? handleComplete(item.id) : null}
              disabled={item.status !== 'pending'}
              accessibilityLabel={item.status === 'pending' ? `완료: ${item.content}` : item.content}
            >
              {/* 번호 */}
              <View style={[styles.numberBadge, item.status === 'completed' && styles.numberBadgeCompleted]}>
                <Text style={styles.numberText}>
                  {item.status === 'completed' ? '✓' : item.status === 'failed' ? '✕' : index + 1}
                </Text>
              </View>

              {/* 내용 + 날짜 + 루틴 표시 */}
              <View style={styles.recordContent}>
                <Text
                  style={[styles.recordText, item.status === 'completed' && styles.recordTextCompleted]}
                  numberOfLines={1}
                >
                  {item.isRoutine ? '🔄 ' : ''}{item.content}
                </Text>
                <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
              </View>

              {/* 블록 종류 또는 대기 */}
              {item.status === 'completed' && item.blockType && item.colorId ? (
                <View style={[styles.blockBadge, { backgroundColor: getColorHex(item.colorId) + '30' }]}>
                  <Text style={[styles.blockText, { color: getColorHex(item.colorId) }]}>
                    {item.blockType}
                  </Text>
                </View>
              ) : item.status === 'failed' ? (
                <View style={[styles.blockBadge, { backgroundColor: '#FF000020' }]}>
                  <Text style={[styles.blockText, { color: '#FF4444' }]}>💀</Text>
                </View>
              ) : (
                <View style={[styles.blockBadge, { backgroundColor: '#333366' }]}>
                  <Text style={[styles.blockText, { color: '#666688' }]}>TAP</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}

      {/* 완성 라인 플로팅 버튼 */}
      <Pressable style={styles.fab} onPress={() => setPopupVisible(true)} accessibilityLabel="완성된 라인 보기">
        <Text style={styles.fabText}>🏆</Text>
      </Pressable>

      {/* 완성 라인 팝업 */}
      <Modal visible={popupVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>COMPLETED LINES</Text>
              <Pressable onPress={() => setPopupVisible(false)} accessibilityLabel="닫기">
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            {achievements.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.emptyText}>아직 완성된 라인이 없어요</Text>
                <Text style={styles.emptySubText}>위젯에서 테트리스 줄을 완성해보세요!</Text>
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
                            item.records.map((rec, i) => (
                              <View key={i} style={styles.achievementRecordRow}>
                                <View style={styles.blockTypeBadge}>
                                  <Text style={styles.blockTypeText}>{rec.blockType}</Text>
                                </View>
                                <Text style={styles.achievementRecord}>
                                  {rec.content || `기록 #${i + 1}`}
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

