# Today I Did — 코드 스니펫 모음

> code_plan.md의 각 Step에서 참조하는 핵심 코드 스니펫.
> 실제 구현 시 이 파일을 참고하여 작성.

---

## 1. 상수 및 블록 정의 (`constants/tetris.ts`)

```typescript
export const COLS = 10
export const ROWS = 20

export const SCORE_TABLE: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
}

export const COLOR_PALETTE = [
  '#FF6B6B', // 일
  '#FF9F43', // 월
  '#FECA57', // 화
  '#48DBFB', // 수
  '#0ABDE3', // 목
  '#C39BD3', // 금
  '#FF9FF3', // 토
]

export const BLOCK_SHAPES: Record<BlockType, BlockShape[]> = {
  I: [
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
    [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
  ],
  O: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  ],
  T: [
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  S: [
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
  Z: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
  ],
  J: [
    [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  ],
  L: [
    [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
    [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
  ],
}

export const SPAWN_POSITION = { x: 3, y: 0 }

export const BLOCK_TYPES: BlockType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
```

---

## 2. 테트리스 엔진 (`lib/tetrisEngine.ts`)

```typescript
import { COLS, ROWS, BLOCK_SHAPES, SCORE_TABLE, SPAWN_POSITION } from '@/constants/tetris'
import type { GameState, ActivePiece, BlockType, Rotation, GameAction } from '@/types/game'

export function createEmptyGrid(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

export function createEmptyRecordGrid(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export function getAbsoluteCells(
  type: BlockType,
  rotation: Rotation,
  position: { x: number; y: number }
): { x: number; y: number }[] {
  return BLOCK_SHAPES[type][rotation].map(cell => ({
    x: cell.x + position.x,
    y: cell.y + position.y,
  }))
}

export function canPlace(
  grid: number[][],
  cells: { x: number; y: number }[]
): boolean {
  return cells.every(
    ({ x, y }) =>
      x >= 0 && x < COLS && y >= 0 && y < ROWS && grid[y][x] === 0
  )
}

export function moveLeft(state: GameState): GameState {
  if (!state.activePiece) return state
  const newPos = { ...state.activePiece.position, x: state.activePiece.position.x - 1 }
  const cells = getAbsoluteCells(state.activePiece.type, state.activePiece.rotation, newPos)
  if (!canPlace(state.grid, cells)) return state
  return { ...state, activePiece: { ...state.activePiece, position: newPos } }
}

export function moveRight(state: GameState): GameState {
  if (!state.activePiece) return state
  const newPos = { ...state.activePiece.position, x: state.activePiece.position.x + 1 }
  const cells = getAbsoluteCells(state.activePiece.type, state.activePiece.rotation, newPos)
  if (!canPlace(state.grid, cells)) return state
  return { ...state, activePiece: { ...state.activePiece, position: newPos } }
}

export function moveDown(state: GameState): GameState {
  if (!state.activePiece) return state
  const newPos = { ...state.activePiece.position, y: state.activePiece.position.y + 1 }
  const cells = getAbsoluteCells(state.activePiece.type, state.activePiece.rotation, newPos)

  if (canPlace(state.grid, cells)) {
    return { ...state, activePiece: { ...state.activePiece, position: newPos } }
  }

  const locked = lockPiece(state)
  const completedRows = checkLines(locked.grid)

  if (completedRows.length > 0) {
    return { ...locked, animationState: 'highlight', clearingRows: completedRows }
  }

  return spawnPiece(locked)
}

export function rotate(state: GameState): GameState {
  if (!state.activePiece || state.activePiece.type === 'O') return state
  const newRotation = ((state.activePiece.rotation + 1) % 4) as Rotation
  const cells = getAbsoluteCells(state.activePiece.type, newRotation, state.activePiece.position)

  if (canPlace(state.grid, cells)) {
    return { ...state, activePiece: { ...state.activePiece, rotation: newRotation } }
  }

  // 벽킥
  for (const offset of [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }]) {
    const kickPos = {
      x: state.activePiece.position.x + offset.x,
      y: state.activePiece.position.y + offset.y,
    }
    const kickCells = getAbsoluteCells(state.activePiece.type, newRotation, kickPos)
    if (canPlace(state.grid, kickCells)) {
      return {
        ...state,
        activePiece: { ...state.activePiece, rotation: newRotation, position: kickPos },
      }
    }
  }

  return state
}

export function lockPiece(state: GameState): GameState {
  if (!state.activePiece) return state
  const newGrid = state.grid.map(row => [...row])
  const newGridRecordIds = state.gridRecordIds.map(row => [...row])
  const cells = getAbsoluteCells(
    state.activePiece.type,
    state.activePiece.rotation,
    state.activePiece.position
  )

  for (const { x, y } of cells) {
    newGrid[y][x] = state.activePiece.colorId
    newGridRecordIds[y][x] = state.activePiece.sourceRecordId
  }

  return { ...state, grid: newGrid, gridRecordIds: newGridRecordIds, activePiece: null }
}

export function checkLines(grid: number[][]): number[] {
  return grid.reduce<number[]>((completed, row, index) => {
    if (row.every(cell => cell !== 0)) completed.push(index)
    return completed
  }, [])
}

export function clearLines(state: GameState): GameState {
  const { clearingRows } = state
  const newGrid = state.grid.filter((_, i) => !clearingRows.includes(i))
  const newGridRecordIds = state.gridRecordIds.filter((_, i) => !clearingRows.includes(i))

  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(0))
    newGridRecordIds.unshift(Array(COLS).fill(null))
  }

  const score = state.score + (SCORE_TABLE[clearingRows.length] ?? 0)

  return {
    ...state,
    grid: newGrid,
    gridRecordIds: newGridRecordIds,
    score,
    totalLineClears: state.totalLineClears + clearingRows.length,
    clearingRows: [],
    animationState: 'none',
  }
}

export function spawnPiece(state: GameState): GameState {
  if (state.blockQueue.length === 0) {
    return { ...state, activePiece: null }
  }

  const [next, ...rest] = state.blockQueue
  const newPiece: ActivePiece = {
    type: next.type,
    rotation: 0,
    position: { ...SPAWN_POSITION },
    colorId: next.colorId,
    sourceRecordId: next.sourceRecordId,
  }

  const cells = getAbsoluteCells(newPiece.type, 0, newPiece.position)
  if (!canPlace(state.grid, cells)) {
    return { ...state, gameOver: true, activePiece: null }
  }

  return { ...state, activePiece: newPiece, blockQueue: rest }
}

export function processAction(state: GameState, action: GameAction): GameState {
  if (state.gameOver || state.animationState !== 'none') return state

  switch (action) {
    case 'move_left': return moveLeft(state)
    case 'move_right': return moveRight(state)
    case 'move_down': return moveDown(state)
    case 'rotate': return rotate(state)
    default: return state
  }
}

export function advanceAnimation(state: GameState): GameState {
  switch (state.animationState) {
    case 'highlight': return { ...state, animationState: 'fade' }
    case 'fade': return { ...state, animationState: 'done' }
    case 'done': return spawnPiece(clearLines(state))
    default: return state
  }
}
```

---

## 3. 날짜 → 색상 매퍼 (`lib/colorMapper.ts`)

```typescript
import { COLOR_PALETTE } from '@/constants/tetris'

export function getColorIdForDate(dateString: string): number {
  const day = new Date(dateString).getDay() // 0(일) ~ 6(토)
  return day
}

export function getColorHex(colorId: number): string {
  return COLOR_PALETTE[colorId % COLOR_PALETTE.length]
}
```

---

## 4. Zustand 게임 스토어 (`stores/gameStore.ts`)

```typescript
import { create } from 'zustand'
import {
  createEmptyGrid,
  createEmptyRecordGrid,
  processAction,
  advanceAnimation,
  spawnPiece,
} from '@/lib/tetrisEngine'
import type { GameState, GameAction, QueuedBlock } from '@/types/game'

interface GameStore {
  gameState: GameState

  dispatch: (action: GameAction) => void
  advanceAnimation: () => void
  addBlock: (block: QueuedBlock) => void
  resetGame: () => void
}

const initialState: GameState = {
  grid: createEmptyGrid(),
  gridRecordIds: createEmptyRecordGrid(),
  score: 0,
  activePiece: null,
  blockQueue: [],
  gameOver: false,
  totalLineClears: 0,
  animationState: 'none',
  clearingRows: [],
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialState,

  dispatch: (action) =>
    set((s) => ({ gameState: processAction(s.gameState, action) })),

  advanceAnimation: () =>
    set((s) => ({ gameState: advanceAnimation(s.gameState) })),

  addBlock: (block) =>
    set((s) => {
      const newState = { ...s.gameState, blockQueue: [...s.gameState.blockQueue, block] }
      // 활성 블록이 없으면 자동 스폰
      if (!newState.activePiece && !newState.gameOver) {
        return { gameState: spawnPiece(newState) }
      }
      return { gameState: newState }
    }),

  resetGame: () => set({ gameState: initialState }),
}))
```

---

## 5. 기록 리스트 아이템 (`components/record/RecordItem.tsx`)

```tsx
import { View, Text, Pressable } from 'react-native'
import { getColorHex } from '@/lib/colorMapper'
import type { Record } from '@/types/record'

interface RecordItemProps {
  record: Record
  index: number
}

export default function RecordItem({ record, index }: RecordItemProps) {
  const dateLabel = record.date.slice(5).replace('-', '.')

  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
      {/* 번호 배지 */}
      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Text className="text-sm font-bold text-gray-600">{index + 1}</Text>
      </View>

      {/* 한 일 이름 + 날짜 */}
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {record.content}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">{dateLabel}</Text>
      </View>

      {/* 블록 종류 */}
      <View
        className="w-8 h-8 rounded items-center justify-center"
        style={{ backgroundColor: getColorHex(new Date(record.date).getDay()) + '20' }}
      >
        <Text
          className="text-sm font-bold"
          style={{ color: getColorHex(new Date(record.date).getDay()) }}
        >
          {record.blockType}
        </Text>
      </View>
    </View>
  )
}
```

---

## 6. 기록 리스트 (`components/record/RecordList.tsx`)

```tsx
import { FlatList, View, Text } from 'react-native'
import RecordItem from './RecordItem'
import type { Record } from '@/types/record'

interface RecordListProps {
  records: Record[]
}

export default function RecordList({ records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-400 text-base">아직 기록이 없어요</Text>
        <Text className="text-gray-300 text-sm mt-1">오늘 한 일을 적어보세요!</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={records}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <RecordItem record={item} index={index} />
      )}
      className="flex-1"
      contentContainerClassName="pb-24"
    />
  )
}
```

---

## 7. 완성 라인 팝업 (`components/achievement/CompletedLinesPopup.tsx`)

```tsx
import { View, Text, Modal, Pressable, FlatList } from 'react-native'
import type { Achievement } from '@/types/achievement'

interface CompletedLinesPopupProps {
  visible: boolean
  onClose: () => void
  achievements: Achievement[]
}

export default function CompletedLinesPopup({
  visible,
  onClose,
  achievements,
}: CompletedLinesPopupProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-2xl max-h-[70%] pb-8">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">완성된 라인</Text>
            <Pressable onPress={onClose} accessibilityLabel="닫기">
              <Text className="text-gray-400 text-2xl">×</Text>
            </Pressable>
          </View>

          {/* 라인 목록 */}
          <FlatList
            data={achievements}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View className="px-5 py-4 border-b border-gray-50">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-bold text-gray-700">
                    라인 #{index + 1}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    +{item.score}점 · {item.dateRange.from} ~ {item.dateRange.to}
                  </Text>
                </View>
                {item.records.map((rec, i) => (
                  <Text key={i} className="text-sm text-gray-600 ml-2">
                    · {rec.content} [{rec.blockType}]
                  </Text>
                ))}
              </View>
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-gray-400">아직 완성된 라인이 없어요</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  )
}
```

---

## 8. 홈 화면 (`app/(tabs)/index.tsx`)

```tsx
import { useState } from 'react'
import { View, Pressable, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RecordInput from '@/components/record/RecordInput'
import RecordList from '@/components/record/RecordList'
import BlockStockBadge from '@/components/record/BlockStockBadge'
import CompletedLinesPopup from '@/components/achievement/CompletedLinesPopup'
import { useRecords } from '@/hooks/useRecords'
import { useAchievements } from '@/hooks/useAchievements'
import { useGameStore } from '@/stores/gameStore'

export default function HomeScreen() {
  const [popupVisible, setPopupVisible] = useState(false)
  const { records } = useRecords()
  const { achievements } = useAchievements()
  const blockStock = useGameStore((s) => s.gameState.blockQueue.length)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 상단 헤더 */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="text-xl font-bold text-gray-900">Today I Did</Text>
        <BlockStockBadge count={blockStock} />
      </View>

      {/* 기록 입력 */}
      <RecordInput />

      {/* 기록 리스트 */}
      <RecordList records={records} />

      {/* 완성 라인 플로팅 버튼 */}
      <Pressable
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-yellow-400 items-center justify-center shadow-lg"
        onPress={() => setPopupVisible(true)}
        accessibilityLabel="완성된 라인 보기"
      >
        <Text className="text-2xl">🏆</Text>
      </Pressable>

      {/* 완성 라인 팝업 */}
      <CompletedLinesPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        achievements={achievements}
      />
    </SafeAreaView>
  )
}
```

---

## 9. 앱 내 테트리스 보드 (`components/game/TetrisBoard.tsx`)

```tsx
import { View, Text, Pressable } from 'react-native'
import { COLS, ROWS } from '@/constants/tetris'
import { getAbsoluteCells } from '@/lib/tetrisEngine'
import { getColorHex } from '@/lib/colorMapper'
import { useGameStore } from '@/stores/gameStore'

const CELL_SIZE = 16

export default function TetrisBoard() {
  const { gameState, dispatch } = useGameStore()
  const { grid, activePiece, score, blockQueue, gameOver, animationState, clearingRows } = gameState

  // 활성 블록의 절대 좌표
  const activeCells = activePiece
    ? getAbsoluteCells(activePiece.type, activePiece.rotation, activePiece.position)
    : []

  function getCellColor(x: number, y: number): string {
    // 클리어 애니메이션
    if (clearingRows.includes(y)) {
      if (animationState === 'highlight') return '#FFFFFF'
      if (animationState === 'fade') return '#D1D5DB'
    }

    // 활성 블록
    if (activePiece && activeCells.some(c => c.x === x && c.y === y)) {
      return getColorHex(activePiece.colorId)
    }

    // 고정된 블록
    if (grid[y][x] !== 0) {
      return getColorHex(grid[y][x])
    }

    return '#F3F4F6' // 빈 셀
  }

  return (
    <View className="items-center">
      {/* 점수 + 재고 */}
      <View className="flex-row justify-between w-full px-4 mb-2">
        <Text className="text-sm font-bold">SCORE: {score}</Text>
        <Text className="text-sm font-bold">STOCK: {blockQueue.length}</Text>
      </View>

      {/* 그리드 */}
      <View className="border border-gray-300 rounded">
        {Array.from({ length: ROWS }).map((_, y) => (
          <View key={y} className="flex-row">
            {Array.from({ length: COLS }).map((_, x) => (
              <View
                key={x}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: getCellColor(x, y),
                  borderWidth: 0.5,
                  borderColor: '#E5E7EB',
                }}
              />
            ))}
          </View>
        ))}
      </View>

      {/* 게임 오버 */}
      {gameOver && (
        <Text className="text-red-500 font-bold mt-2">GAME OVER</Text>
      )}

      {/* 재고 없음 */}
      {!activePiece && !gameOver && blockQueue.length === 0 && (
        <Text className="text-gray-400 mt-2">할 일을 기록하세요!</Text>
      )}

      {/* 조작 버튼 */}
      <View className="flex-row gap-3 mt-4">
        <Pressable
          className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center"
          onPress={() => dispatch('move_left')}
          accessibilityLabel="왼쪽으로 이동"
        >
          <Text className="text-xl">←</Text>
        </Pressable>
        <Pressable
          className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center"
          onPress={() => dispatch('rotate')}
          accessibilityLabel="회전"
        >
          <Text className="text-xl">↻</Text>
        </Pressable>
        <Pressable
          className="w-14 h-14 rounded-xl bg-gray-200 items-center justify-center"
          onPress={() => dispatch('move_right')}
          accessibilityLabel="오른쪽으로 이동"
        >
          <Text className="text-xl">→</Text>
        </Pressable>
        <Pressable
          className="w-14 h-14 rounded-xl bg-blue-400 items-center justify-center"
          onPress={() => dispatch('move_down')}
          accessibilityLabel="아래로 이동"
        >
          <Text className="text-xl text-white">▼</Text>
        </Pressable>
      </View>
    </View>
  )
}
```

---

## 10. Android 위젯 핵심 코드 (Kotlin)

### TetrisWidgetProvider.kt (핵심 부분)

```kotlin
class TetrisWidgetProvider : AppWidgetProvider() {

    companion object {
        const val ACTION_MOVE_LEFT = "com.todayidid.MOVE_LEFT"
        const val ACTION_MOVE_RIGHT = "com.todayidid.MOVE_RIGHT"
        const val ACTION_ROTATE = "com.todayidid.ROTATE"
        const val ACTION_MOVE_DOWN = "com.todayidid.MOVE_DOWN"
        const val ACTION_REFRESH = "com.todayidid.REFRESH"
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        val action = intent.action ?: return
        val prefs = context.getSharedPreferences("tetris_game", Context.MODE_PRIVATE)
        val engine = TetrisGameEngine()

        when (action) {
            ACTION_REFRESH -> {
                // 로컬 저장소에서 최신 블록 큐 다시 로드
                updateWidget(context)
                return
            }
            ACTION_MOVE_LEFT -> engine.processAction(prefs, "move_left")
            ACTION_MOVE_RIGHT -> engine.processAction(prefs, "move_right")
            ACTION_ROTATE -> engine.processAction(prefs, "rotate")
            ACTION_MOVE_DOWN -> {
                engine.processAction(prefs, "move_down")

                // 줄 클리어 감지 시 애니메이션 시작
                val state = engine.loadState(prefs)
                if (state.animationState == "highlight") {
                    startLineClearAnimation(context)
                }
            }
        }

        updateWidget(context)
    }

    private fun updateWidget(context: Context) {
        val views = RemoteViews(context.packageName, R.layout.widget_tetris)
        val prefs = context.getSharedPreferences("tetris_game", Context.MODE_PRIVATE)
        val state = TetrisGameEngine().loadState(prefs)

        // 비트맵 렌더링
        val bitmap = WidgetRenderer.renderGrid(state)
        views.setImageViewBitmap(R.id.game_board, bitmap)
        views.setTextViewText(R.id.score_text, "SCORE: ${state.score}")
        views.setTextViewText(R.id.stock_text, "STOCK: ${state.blockQueue.size}")

        // 버튼 PendingIntent
        views.setOnClickPendingIntent(R.id.btn_left, createPendingIntent(context, ACTION_MOVE_LEFT))
        views.setOnClickPendingIntent(R.id.btn_right, createPendingIntent(context, ACTION_MOVE_RIGHT))
        views.setOnClickPendingIntent(R.id.btn_rotate, createPendingIntent(context, ACTION_ROTATE))
        views.setOnClickPendingIntent(R.id.btn_down, createPendingIntent(context, ACTION_MOVE_DOWN))
        views.setOnClickPendingIntent(R.id.btn_refresh, createPendingIntent(context, ACTION_REFRESH))

        val manager = AppWidgetManager.getInstance(context)
        val component = ComponentName(context, TetrisWidgetProvider::class.java)
        manager.updateAppWidget(component, views)
    }

    private fun startLineClearAnimation(context: Context) {
        val handler = Handler(Looper.getMainLooper())
        val prefs = context.getSharedPreferences("tetris_game", Context.MODE_PRIVATE)
        val engine = TetrisGameEngine()

        // 300ms 후 fade
        handler.postDelayed({
            engine.advanceAnimation(prefs)
            updateWidget(context)

            // 300ms 후 done → 줄 제거
            handler.postDelayed({
                engine.advanceAnimation(prefs)
                updateWidget(context)
            }, 300)
        }, 300)
    }

    private fun createPendingIntent(context: Context, action: String): PendingIntent {
        val intent = Intent(context, TetrisWidgetProvider::class.java).apply {
            this.action = action
        }
        return PendingIntent.getBroadcast(
            context, action.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
```

### WidgetRenderer.kt (핵심 부분)

```kotlin
object WidgetRenderer {
    private const val CELL_SIZE = 24
    private const val GRID_COLS = 10
    private const val GRID_ROWS = 20

    fun renderGrid(state: GameState): Bitmap {
        val width = CELL_SIZE * GRID_COLS
        val height = CELL_SIZE * GRID_ROWS
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint()

        // 배경
        paint.color = Color.parseColor("#F3F4F6")
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // 고정된 블록
        for (y in 0 until GRID_ROWS) {
            for (x in 0 until GRID_COLS) {
                if (state.grid[y][x] != 0) {
                    paint.color = Color.parseColor(ColorMapper.getColorHex(state.grid[y][x]))
                    drawCell(canvas, paint, x, y)
                }
            }
        }

        // 줄 클리어 애니메이션
        for (row in state.clearingRows) {
            paint.color = when (state.animationState) {
                "highlight" -> Color.WHITE
                "fade" -> Color.parseColor("#D1D5DB")
                else -> continue
            }
            for (x in 0 until GRID_COLS) {
                drawCell(canvas, paint, x, row)
            }
        }

        // 활성 블록
        state.activePiece?.let { piece ->
            paint.color = Color.parseColor(ColorMapper.getColorHex(piece.colorId))
            val cells = TetrisGameEngine.getAbsoluteCells(piece.type, piece.rotation, piece.position)
            for (cell in cells) {
                drawCell(canvas, paint, cell.x, cell.y)
            }
        }

        // 그리드 선
        paint.color = Color.parseColor("#E5E7EB")
        paint.strokeWidth = 1f
        for (x in 0..GRID_COLS) {
            canvas.drawLine(x * CELL_SIZE.toFloat(), 0f, x * CELL_SIZE.toFloat(), height.toFloat(), paint)
        }
        for (y in 0..GRID_ROWS) {
            canvas.drawLine(0f, y * CELL_SIZE.toFloat(), width.toFloat(), y * CELL_SIZE.toFloat(), paint)
        }

        return bitmap
    }

    private fun drawCell(canvas: Canvas, paint: Paint, x: Int, y: Int) {
        canvas.drawRect(
            (x * CELL_SIZE + 1).toFloat(),
            (y * CELL_SIZE + 1).toFloat(),
            ((x + 1) * CELL_SIZE - 1).toFloat(),
            ((y + 1) * CELL_SIZE - 1).toFloat(),
            paint
        )
    }
}
```

---

## 11. iOS 위젯 핵심 코드 (Swift)

### TetrisIntents.swift

```swift
import AppIntents
import WidgetKit

struct MoveLeftIntent: AppIntent {
    static var title: LocalizedStringResource = "왼쪽 이동"

    func perform() async throws -> some IntentResult {
        let engine = TetrisGameEngine.shared
        engine.processAction(.moveLeft)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct MoveRightIntent: AppIntent {
    static var title: LocalizedStringResource = "오른쪽 이동"

    func perform() async throws -> some IntentResult {
        let engine = TetrisGameEngine.shared
        engine.processAction(.moveRight)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct RotateIntent: AppIntent {
    static var title: LocalizedStringResource = "회전"

    func perform() async throws -> some IntentResult {
        let engine = TetrisGameEngine.shared
        engine.processAction(.rotate)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

struct MoveDownIntent: AppIntent {
    static var title: LocalizedStringResource = "아래로 이동"

    func perform() async throws -> some IntentResult {
        let engine = TetrisGameEngine.shared
        engine.processAction(.moveDown)

        // 줄 클리어 시 타임라인으로 애니메이션
        let state = engine.loadState()
        if state.animationState == .highlight {
            scheduleClearAnimation()
        }

        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }

    private func scheduleClearAnimation() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            TetrisGameEngine.shared.advanceAnimation()
            WidgetCenter.shared.reloadAllTimelines()

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                TetrisGameEngine.shared.advanceAnimation()
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}

struct RefreshIntent: AppIntent {
    static var title: LocalizedStringResource = "새로고침"

    func perform() async throws -> some IntentResult {
        TetrisGameEngine.shared.reloadBlockQueue()
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}
```

### TetrisWidget.swift

```swift
import WidgetKit
import SwiftUI

struct TetrisWidgetEntryView: View {
    let state: GameState
    let cellSize: CGFloat = 16

    var body: some View {
        VStack(spacing: 4) {
            // 상단 정보
            HStack {
                Text("SCORE: \(state.score)")
                    .font(.caption).bold()
                Spacer()
                Text("STOCK: \(state.blockQueue.count)")
                    .font(.caption).bold()

                Button(intent: RefreshIntent()) {
                    Image(systemName: "arrow.clockwise")
                        .font(.caption)
                }
            }
            .padding(.horizontal, 8)

            // 게임 보드
            GameGridView(state: state, cellSize: cellSize)

            // 조작 버튼
            HStack(spacing: 8) {
                Button(intent: MoveLeftIntent()) {
                    Text("←").font(.title3)
                }
                Button(intent: RotateIntent()) {
                    Text("↻").font(.title3)
                }
                Button(intent: MoveRightIntent()) {
                    Text("→").font(.title3)
                }
                Button(intent: MoveDownIntent()) {
                    Text("▼").font(.title3)
                }
            }
        }
        .padding(8)
    }
}

struct GameGridView: View {
    let state: GameState
    let cellSize: CGFloat

    var body: some View {
        VStack(spacing: 0) {
            ForEach(0..<20, id: \.self) { y in
                HStack(spacing: 0) {
                    ForEach(0..<10, id: \.self) { x in
                        Rectangle()
                            .fill(cellColor(x: x, y: y))
                            .frame(width: cellSize, height: cellSize)
                            .border(Color.gray.opacity(0.2), width: 0.5)
                    }
                }
            }
        }
    }

    func cellColor(x: Int, y: Int) -> Color {
        if state.clearingRows.contains(y) {
            switch state.animationState {
            case .highlight: return .white
            case .fade: return Color(.systemGray4)
            default: break
            }
        }

        if let piece = state.activePiece {
            let cells = TetrisGameEngine.getAbsoluteCells(
                type: piece.type, rotation: piece.rotation, position: piece.position
            )
            if cells.contains(where: { $0.x == x && $0.y == y }) {
                return ColorMapper.color(for: piece.colorId)
            }
        }

        if state.grid[y][x] != 0 {
            return ColorMapper.color(for: state.grid[y][x])
        }

        return Color(.systemGray6)
    }
}

struct TetrisWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "TetrisWidget",
            provider: TetrisTimelineProvider()
        ) { entry in
            TetrisWidgetEntryView(state: entry.gameState)
        }
        .configurationDisplayName("Today I Did 테트리스")
        .description("할 일을 기록하고 테트리스를 플레이하세요!")
        .supportedFamilies([.systemLarge])
    }
}
```
