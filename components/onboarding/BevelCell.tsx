import { View } from 'react-native'

interface BevelCellProps {
  size: number
  color?: string
  empty?: boolean
}

export function BevelCell({ size, color, empty }: BevelCellProps) {
  if (empty) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: 'rgba(42, 42, 80, 0.5)',
          borderStyle: 'dashed',
          borderRadius: 2,
        }}
      />
    )
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color ?? '#00F0FF',
        borderRadius: 2,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: 'rgba(255,255,255,0.55)',
        borderLeftColor: 'rgba(255,255,255,0.45)',
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderBottomColor: 'rgba(0,0,0,0.55)',
        borderRightColor: 'rgba(0,0,0,0.5)',
      }}
    />
  )
}
