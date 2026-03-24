export type BlockType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type Rotation = 0 | 1 | 2 | 3

export type BlockShape = { x: number; y: number }[]

export interface ActivePiece {
  type: BlockType
  rotation: Rotation
  position: { x: number; y: number }
  colorId: number
  sourceRecordId: string
}

export interface QueuedBlock {
  type: BlockType
  colorId: number
  sourceRecordId: string
}

export interface GameState {
  grid: number[][]
  gridRecordIds: (string | null)[][]
  score: number
  activePiece: ActivePiece | null
  blockQueue: QueuedBlock[]
  gameOver: boolean
  totalLineClears: number
  animationState: 'none' | 'highlight' | 'fade' | 'done'
  clearingRows: number[]
  pendingPenalties: number
  dailyBonusDate: string | null
}

// 페널티 줄 색상 ID (일반 블록과 구분)
export const PENALTY_COLOR_ID = 99

export type GameAction = 'move_left' | 'move_right' | 'move_down' | 'rotate'

// 히스토리용 타입
export interface CompletedTask {
  content: string
  blockType: string
  colorId: number
  completedAt: number
}

export interface GameHistoryAchievement {
  id: string
  recordIds: string[]
  records: { id: string; content: string; blockType: string }[]
  lineCount: number
  score: number
  clearedAt: number
}

export interface GameHistory {
  id: string
  endedAt: number
  finalScore: number
  totalLineClears: number
  completedTasks: CompletedTask[]
  achievements: GameHistoryAchievement[]
}
