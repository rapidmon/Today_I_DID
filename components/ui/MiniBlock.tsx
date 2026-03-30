import { View, StyleSheet } from 'react-native'
import { BLOCK_SHAPES } from '@/constants/tetris'
import type { BlockType } from '@/types/game'

interface MiniBlockProps {
  type: BlockType
  color: string
  cellSize?: number
}

// 고전 테트리스 3D 베벨 스타일
const cellBorderStyle = StyleSheet.create({
  base: {
    position: 'absolute',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.55)',
    borderRightColor: 'rgba(0,0,0,0.5)',
  },
})

export function MiniBlock({ type, color, cellSize = 7 }: MiniBlockProps) {
  const shape = BLOCK_SHAPES[type][0]

  const minX = Math.min(...shape.map(c => c.x))
  const maxX = Math.max(...shape.map(c => c.x))
  const minY = Math.min(...shape.map(c => c.y))
  const maxY = Math.max(...shape.map(c => c.y))
  const cols = maxX - minX + 1
  const rows = maxY - minY + 1

  return (
    <View style={{ width: cols * cellSize, height: rows * cellSize }}>
      {shape.map((cell, i) => (
        <View
          key={i}
          style={[
            cellBorderStyle.base,
            {
              left: (cell.x - minX) * cellSize,
              top: (cell.y - minY) * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  )
}
