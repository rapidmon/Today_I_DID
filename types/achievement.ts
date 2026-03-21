import type { BlockType } from './game'

export interface Achievement {
  id: string
  type: 'line_clear'
  recordIds: string[]
  records: { content: string; blockType: BlockType }[]
  score: number
  dateRange: { from: string; to: string }
  clearedAt: number
}
