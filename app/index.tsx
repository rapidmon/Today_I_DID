import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
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
  useEffect(() => {
    const todayStr = today()

    // 루틴에서 오늘 할 일 생성 (이미 있으면 스킵)
    setTasks(prev => {
      const todayRoutineTasks = prev.filter(t => t.date === todayStr && t.isRoutine)
      const missingRoutines = routines.filter(
        r => r.active && !todayRoutineTasks.some(t => t.routineId === r.id)
      )

      if (missingRoutines.length === 0) return prev

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

      return [...newTasks, ...prev]
    })

    // 전날 미완료 할 일 → 페널티 (간소화: 앱 실행 시 체크)
    setTasks(prev => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().slice(0, 10)

      const pendingYesterday = prev.filter(
        t => t.date === yesterdayStr && t.status === 'pending'
      )

      if (pendingYesterday.length > 0) {
        // 미완료 처리
        const updated = prev.map(t =>
          t.date === yesterdayStr && t.status === 'pending'
            ? { ...t, status: 'failed' as const }
            : t
        )
        // 페널티 적용
        addPenalties(pendingYesterday.length)
        return updated
      }
      return prev
    })
  }, [routines, addPenalties])

  // 할 일 추가
  const handleAddTask = useCallback(() => {
    const trimmed = inputText.trim()
    if (!trimmed) return

    if (inputMode === 'routine') {
      const newRoutine: Routine = {
        id: genId('routine'),
        content: trimmed,
        active: true,
        createdAt: Date.now(),
      }
      setRoutines(prev => [...prev, newRoutine])

      // 오늘 할 일도 바로 생성
      const todayStr = today()
      const newTask: Task = {
        id: genId('task'),
        content: trimmed,
        date: todayStr,
        status: 'pending',
        isRoutine: true,
        routineId: newRoutine.id,
        blockType: null,
        colorId: null,
        createdAt: Date.now(),
        completedAt: null,
      }
      setTasks(prev => [newTask, ...prev])
    } else {
      const newTask: Task = {
        id: genId('task'),
        content: trimmed,
        date: today(),
        status: 'pending',
        isRoutine: false,
        routineId: null,
        blockType: null,
        colorId: null,
        createdAt: Date.now(),
        completedAt: null,
      }
      setTasks(prev => [newTask, ...prev])
    }

    setInputText('')
  }, [inputText, inputMode])

  // 할 일 완료
  const handleComplete = useCallback((taskId: string) => {
    const todayStr = today()
    const randomBlock = BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)]
    const colorId = getRandomColorId()

    // task content를 먼저 찾기
    const task = tasks.find(t => t.id === taskId)
    const taskContent = task?.content ?? ''

    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: 'completed' as const, blockType: randomBlock, colorId, completedAt: Date.now() }
        : t
    ))

    const queuedBlock: QueuedBlock = {
      type: randomBlock,
      colorId,
      sourceRecordId: taskId,
    }
    addBlock(queuedBlock, taskContent)

    // 일일 활동 보너스 (+1점, 하루 1회)
    applyDailyBonusStore(todayStr)
  }, [addBlock, applyDailyBonusStore, tasks])

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

  const todayTasks = tasks.filter(t => t.date === today())
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F23' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FFDD00', letterSpacing: 2 },
  headerRight: { flexDirection: 'row' as const, gap: 8 },
  scoreBadge: {
    backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#FFDD00',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreText: { color: '#FFDD00', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  gameOverBadge: {
    backgroundColor: '#FF000030', borderWidth: 2, borderColor: '#FF0000',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  gameOverText: { color: '#FF4444', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  modeRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4,
  },
  modeButton: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6,
    borderWidth: 2, borderColor: '#333366',
  },
  modeButtonActive: { backgroundColor: '#FFDD00', borderColor: '#CCAA00' },
  modeText: { color: '#666688', fontSize: 13, fontWeight: 'bold' },
  modeTextActive: { color: '#0F0F23' },
  inputRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  input: {
    flex: 1, backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#333366',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: '#FFFFFF', fontSize: 15,
  },
  addButton: {
    backgroundColor: '#FFDD00', borderRadius: 8, paddingHorizontal: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#CCAA00',
  },
  addButtonDisabled: { backgroundColor: '#333366', borderColor: '#222244' },
  addButtonText: { color: '#0F0F23', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  routineSection: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: { color: '#666688', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, marginBottom: 6 },
  routineList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  routineChip: {
    backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#333366',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  routineChipText: { color: '#AAAACC', fontSize: 12 },
  listContent: { paddingBottom: 100 },
  recordItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1A1A2E',
  },
  numberBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A2E',
    borderWidth: 2, borderColor: '#333366', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  numberBadgeCompleted: { backgroundColor: '#00CC00', borderColor: '#009900' },
  numberText: { color: '#FFDD00', fontSize: 13, fontWeight: 'bold' },
  recordContent: { flex: 1 },
  recordText: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  recordTextCompleted: { color: '#666688', textDecorationLine: 'line-through' },
  recordDate: { color: '#666688', fontSize: 11, marginTop: 2, letterSpacing: 1 },
  blockBadge: { width: 36, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  blockText: { fontSize: 14, fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#666688', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#444466', fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFDD00', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#CCAA00', elevation: 8,
    shadowColor: '#FFDD00', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabText: { fontSize: 24 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: '#0F0F23', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '70%', borderTopWidth: 3, borderLeftWidth: 2, borderRightWidth: 2,
    borderColor: '#333366', paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: '#1A1A2E',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFDD00', letterSpacing: 2 },
  modalClose: { color: '#666688', fontSize: 22, fontWeight: 'bold' },
  modalEmpty: { alignItems: 'center', paddingVertical: 40 },
  achievementItem: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  achievementHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  achievementLeft: { flex: 1 },
  achievementTitle: { color: '#FFDD00', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  achievementMeta: { color: '#666688', fontSize: 11, marginTop: 2 },
  achievementArrow: { color: '#666688', fontSize: 12, marginLeft: 8 },
  achievementBody: { marginTop: 10, paddingLeft: 4, borderLeftWidth: 2, borderLeftColor: '#333366', marginLeft: 2 },
  achievementRecordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingLeft: 8 },
  blockTypeBadge: {
    width: 28, height: 22, borderRadius: 4, backgroundColor: '#333366',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  blockTypeText: { color: '#FFDD00', fontSize: 11, fontWeight: 'bold' },
  achievementRecord: { color: '#AAAACC', fontSize: 13, flex: 1 },
})
