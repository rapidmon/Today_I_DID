import type { BlockType } from './game'

export type TaskStatus = 'pending' | 'completed' | 'failed'

export interface Task {
  id: string
  content: string
  date: string
  status: TaskStatus
  isRoutine: boolean
  routineId: string | null
  blockType: BlockType | null
  colorId: number | null
  createdAt: number
  completedAt: number | null
}

export interface Routine {
  id: string
  content: string
  active: boolean
  createdAt: number
}
