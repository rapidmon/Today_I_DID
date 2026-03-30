import { COLS, ROWS, BLOCK_SHAPES, SCORE_TABLE, SPAWN_POSITION } from '@/constants/tetris'
import type { GameState, ActivePiece, BlockType, Rotation, GameAction } from '@/types/game'
import { PENALTY_COLOR_ID } from '@/types/game'

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

function moveHorizontal(state: GameState, dx: number): GameState {
  if (!state.activePiece) return state
  const newPos = { ...state.activePiece.position, x: state.activePiece.position.x + dx }
  const cells = getAbsoluteCells(state.activePiece.type, state.activePiece.rotation, newPos)
  if (!canPlace(state.grid, cells)) return state
  return { ...state, activePiece: { ...state.activePiece, position: newPos } }
}

export const moveLeft = (state: GameState) => moveHorizontal(state, -1)
export const moveRight = (state: GameState) => moveHorizontal(state, 1)

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
    newGrid[y][x] = state.activePiece.colorId || 1
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
  // Set으로 변환하여 includes() O(n) → has() O(1) 최적화
  const clearSet = new Set(clearingRows)
  const newGrid = state.grid.filter((_, i) => !clearSet.has(i))
  const newGridRecordIds = state.gridRecordIds.filter((_, i) => !clearSet.has(i))

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
    case 'fade': return spawnPiece(clearLines(state))
    default: return state
  }
}

// 페널티 줄 추가 (미완료 할 일 1개당 1줄)
// 회색 9칸 + 빈칸 1칸(랜덤 위치)을 보드 하단에 추가
export function applyPenalties(state: GameState): GameState {
  if (state.pendingPenalties <= 0) return state

  let newGrid = state.grid.map(row => [...row])
  let newGridRecordIds = state.gridRecordIds.map(row => [...row])

  for (let p = 0; p < state.pendingPenalties; p++) {
    // 기존 줄들을 1칸 위로 밀어올림
    newGrid.shift()
    newGridRecordIds.shift()

    // 페널티 줄 생성 (9칸 회색 + 1칸 빈칸)
    const emptyCol = Math.floor(Math.random() * COLS)
    const penaltyRow = Array(COLS).fill(PENALTY_COLOR_ID)
    penaltyRow[emptyCol] = 0
    const penaltyRecordRow: (string | null)[] = Array(COLS).fill('penalty')
    penaltyRecordRow[emptyCol] = null

    newGrid.push(penaltyRow)
    newGridRecordIds.push(penaltyRecordRow)
  }

  // 밀어올린 후 게임 오버 체크 (최상단 줄에 블록이 있으면)
  const topRowHasBlocks = newGrid[0].some(cell => cell !== 0)
  const gameOver = topRowHasBlocks ? true : state.gameOver

  return {
    ...state,
    grid: newGrid,
    gridRecordIds: newGridRecordIds,
    pendingPenalties: 0,
    gameOver,
  }
}

// 일일 활동 보너스 (+100점, 하루 1회)
export function applyDailyBonus(state: GameState, todayStr: string): GameState {
  if (state.dailyBonusDate === todayStr) return state
  return {
    ...state,
    score: state.score + 100,
    dailyBonusDate: todayStr,
  }
}

export function createInitialState(): GameState {
  return {
    grid: createEmptyGrid(),
    gridRecordIds: createEmptyRecordGrid(),
    score: 0,
    activePiece: null,
    blockQueue: [],
    gameOver: false,
    totalLineClears: 0,
    animationState: 'none',
    clearingRows: [],
    pendingPenalties: 0,
    dailyBonusDate: null,
  }
}
