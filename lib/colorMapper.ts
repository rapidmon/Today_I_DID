import { COLOR_PALETTE } from '@/constants/tetris'
import { PENALTY_COLOR_ID } from '@/types/game'

// colorId는 1-based index (0 = 색상 없음, PENALTY_COLOR_ID = 페널티)
// COLOR_PALETTE 배열은 0-based이므로 변환 시 -1 적용

export function getRandomColorId(): number {
  return Math.floor(Math.random() * COLOR_PALETTE.length) + 1
}

export function getColorHex(colorId: number): string {
  if (colorId <= 0) return '#1A1A2E'
  if (colorId === PENALTY_COLOR_ID) return '#666688'
  return COLOR_PALETTE[(colorId - 1) % COLOR_PALETTE.length]
}
