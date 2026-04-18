import { useState, useMemo, Dispatch, SetStateAction } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg'
import type { TFunction } from 'i18next'
import type { Task, Routine, DayOfWeek } from '@/types/record'
import { homeStyles as styles, COLORS } from '@/constants/homeStyles'
import { CheckIcon, TrashIcon } from '@/components/ui/Icons'

type RoutineStatus = 'done' | 'today' | 'other'

interface RoutineStripProps {
  routines: Routine[]
  todayTasks: Task[]
  todayStr: string
  dayLabels: string[]
  t: TFunction
  editingRoutineId: string | null
  editRoutineDays: DayOfWeek[]
  setEditRoutineDays: Dispatch<SetStateAction<DayOfWeek[]>>
  onStartEditing: (r: Routine) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
}

const DOT_COUNT_MAX = 8

export function RoutineStrip({
  routines,
  todayTasks,
  todayStr,
  dayLabels,
  t,
  editingRoutineId,
  editRoutineDays,
  setEditRoutineDays,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: RoutineStripProps) {
  const [scrollX, setScrollX] = useState(0)
  const [contentWidth, setContentWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)

  const { sortedRoutines, routineStatusMap, routineCounts } = useMemo(() => {
    const [y, m, d] = todayStr.split('-').map(Number)
    const todayDow = new Date(y, m - 1, d).getDay() as DayOfWeek
    const activeRoutines = routines.filter(r => r.active !== false)
    const statusMap: Record<string, RoutineStatus> = {}
    let doneCount = 0
    let todayCount = 0
    for (const r of activeRoutines) {
      const todayTask = todayTasks.find(task => task.routineId === r.id)
      const days = r.days ?? [0, 1, 2, 3, 4, 5, 6]
      let status: RoutineStatus
      if (todayTask && (todayTask.status === 'completed' || todayTask.status === 'failed')) {
        status = 'done'
        doneCount += 1
      } else if (days.includes(todayDow)) {
        status = 'today'
        todayCount += 1
      } else {
        status = 'other'
      }
      statusMap[r.id] = status
    }
    const order: Record<RoutineStatus, number> = { done: 0, today: 1, other: 2 }
    const sorted = [...activeRoutines].sort((a, b) => order[statusMap[a.id]] - order[statusMap[b.id]])
    return {
      sortedRoutines: sorted,
      routineStatusMap: statusMap,
      routineCounts: { done: doneCount, today: todayCount },
    }
  }, [routines, todayTasks, todayStr])

  const dots = useMemo(() => {
    const scrollable = Math.max(0, contentWidth - viewportWidth)
    if (scrollable <= 0 || viewportWidth <= 0) return null
    const count = Math.min(DOT_COUNT_MAX, Math.max(2, Math.ceil(contentWidth / viewportWidth)))
    const progress = scrollX / scrollable
    const activeIdx = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))))
    return { count, activeIdx }
  }, [scrollX, contentWidth, viewportWidth])

  const editingRoutine = useMemo(() => {
    if (!editingRoutineId) return null
    return routines.find(r => r.id === editingRoutineId) ?? null
  }, [editingRoutineId, routines])

  if (sortedRoutines.length === 0) return null

  return (
    <View style={styles.routineSection}>
      <View style={styles.routineHeader}>
        <Text style={styles.sectionLabel}>ROUTINES</Text>
        <View style={styles.routineLegend}>
          <View style={styles.routineLegendItem}>
            <View style={[styles.routineLegendDot, styles.routineLegendDotDone]} />
            <Text style={styles.routineLegendText}>{routineCounts.done} DONE</Text>
          </View>
          <View style={styles.routineLegendItem}>
            <View style={[styles.routineLegendDot, styles.routineLegendDotToday]} />
            <Text style={styles.routineLegendText}>{routineCounts.today} TODAY</Text>
          </View>
        </View>
      </View>

      <View style={styles.routineScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routineScrollContent}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          onContentSizeChange={(w) => setContentWidth(w)}
          onLayout={(e) => setViewportWidth(e.nativeEvent.layout.width)}
          scrollEventThrottle={16}
        >
          {sortedRoutines.map(r => {
            const status = routineStatusMap[r.id]
            const chipStyle =
              status === 'done' ? styles.routineChipDone
              : status === 'today' ? styles.routineChipToday
              : styles.routineChipOther
            const textStyle =
              status === 'done' ? styles.routineChipTextDone
              : status === 'today' ? styles.routineChipTextToday
              : styles.routineChipTextOther
            const statusKey =
              status === 'done' ? 'home.routineStatusDone'
              : status === 'today' ? 'home.routineStatusToday'
              : 'home.routineStatusOther'
            return (
              <Pressable
                key={r.id}
                onPress={() => onStartEditing(r)}
                accessibilityRole="button"
                accessibilityLabel={t('home.routineChip', { content: r.content, status: t(statusKey) })}
                accessibilityState={{ checked: status === 'done' }}
                style={[styles.routineChipBase, chipStyle]}
              >
                {status === 'done' && <CheckIcon size={12} color={COLORS.neonGreen} />}
                {status === 'today' && <View style={styles.routineChipDotToday} />}
                <Text style={[styles.routineChipTextBase, textStyle]} numberOfLines={1}>
                  {r.content}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
        <View style={styles.routineFadeOverlay} pointerEvents="none">
          <Svg width={48} height={40} style={styles.routineFadeGradient} preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="routineFade" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={COLORS.bgPrimary} stopOpacity={0} />
                <Stop offset="0.5" stopColor={COLORS.bgPrimary} stopOpacity={0.9} />
                <Stop offset="1" stopColor={COLORS.bgPrimary} stopOpacity={1} />
              </SvgLinearGradient>
            </Defs>
            <Rect x={0} y={0} width={48} height={40} fill="url(#routineFade)" />
          </Svg>
        </View>
      </View>

      {dots && (
        <View style={styles.routineDots}>
          {Array.from({ length: dots.count }).map((_, i) => (
            <View key={`dot-${i}`} style={[styles.routineDot, i === dots.activeIdx && styles.routineDotActive]} />
          ))}
        </View>
      )}

      {editingRoutine && (
        <View style={styles.routineEditContainer}>
          <Text style={styles.editLabel}>EDIT</Text>
          <Text style={styles.routineEditName}>{editingRoutine.content}</Text>
          <View style={styles.dayRow}>
            {dayLabels.map((label, i) => {
              const day = i as DayOfWeek
              const isSelected = editRoutineDays.includes(day)
              return (
                <Pressable
                  key={day}
                  style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                  onPress={() => {
                    setEditRoutineDays(prev =>
                      prev.includes(day)
                        ? prev.filter(d => d !== day)
                        : [...prev, day].sort()
                    )
                  }}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{label}</Text>
                </Pressable>
              )
            })}
          </View>
          <View style={styles.editButtonRow}>
            <Pressable style={styles.editSaveButton} onPress={onSaveEdit}>
              <Text style={styles.editSaveText}>SAVE</Text>
            </Pressable>
            <Pressable style={styles.editCancelButton} onPress={onCancelEdit}>
              <Text style={styles.editCancelText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={styles.editDeleteButton}
              onPress={() => onDelete(editingRoutine.id)}
              accessibilityRole="button"
              accessibilityLabel={t('home.deleteRoutine', { content: editingRoutine.content })}
            >
              <TrashIcon size={14} color={COLORS.neonRed} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}
