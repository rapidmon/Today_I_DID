import { useWindowDimensions } from 'react-native'
import { COLORS } from '@/constants/homeStyles'

export { COLORS }

export const CAPTION_PADDING_H = 28
export const TOTAL_SLIDES = 4

export function useLayout() {
  const { width, height } = useWindowDimensions()
  return {
    screenW: width,
    screenH: height,
    mockupW: width - CAPTION_PADDING_H * 2,
  }
}
