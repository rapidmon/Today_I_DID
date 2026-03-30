import type { BlockType } from './game'

export type TaskStatus = 'pending' | 'completed' | 'failed' | 'archived'

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

// 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Routine {
  id: string
  content: string
  active: boolean
  days: DayOfWeek[]
  createdAt: number
}
