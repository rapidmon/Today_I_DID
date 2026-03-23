import { View } from 'react-native'
import { BLOCK_SHAPES } from '@/constants/tetris'
import type { BlockType } from '@/types/game'

interface MiniBlockProps {
  type: BlockType
  color: string
  cellSize?: number
}

export function MiniBlock({ type, color, cellSize = 7 }: MiniBlockProps) {
  const shape = BLOCK_SHAPES[type][0]

  // 바운딩 박스 계산
  const minX = Math.min(...shape.map(c => c.x))
  const maxX = Math.max(...shape.map(c => c.x))
  const minY = Math.min(...shape.map(c => c.y))
  const maxY = Math.max(...shape.map(c => c.y))
  const cols = maxX - minX + 1
  const rows = maxY - minY + 1

  return (
    <View style={{ width: cols * cellSize, height: rows * cellSize }}>
      {shape.map((cell, i) => {
        const x = (cell.x - minX) * cellSize
        const y = (cell.y - minY) * cellSize
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: cellSize - 1,
              height: cellSize - 1,
              backgroundColor: color,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderTopColor: 'rgba(255,255,255,0.4)',
              borderLeftColor: 'rgba(255,255,255,0.4)',
              borderBottomWidth: 1,
              borderRightWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.4)',
              borderRightColor: 'rgba(0,0,0,0.4)',
            }}
          />
        )
      })}
    </View>
  )
}
