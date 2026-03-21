import { COLOR_PALETTE } from '@/constants/tetris'

export function getRandomColorId(): number {
  return Math.floor(Math.random() * COLOR_PALETTE.length) + 1
}

export function getColorHex(colorId: number): string {
  if (colorId <= 0) return '#1A1A2E'
  if (colorId === 99) return '#666688' // 페널티 줄
  return COLOR_PALETTE[(colorId - 1) % COLOR_PALETTE.length]
}
