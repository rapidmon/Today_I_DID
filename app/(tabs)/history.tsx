import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { ChartIcon } from '@/components/ui/Icons'
import { useHistoryStore } from '@/stores/historyStore'
import { getColorHex } from '@/lib/colorMapper'

export default function HistoryScreen() {
  const { t, i18n } = useTranslation()
  const histories = useHistoryStore((s) => s.histories)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })

  const insets = useSafeAreaInsets()

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>HISTORY</Text>
        <Text style={s.subtitle}>{t('history.subtitle', { count: histories.length })}</Text>
      </View>

      {histories.length === 0 ? (
        <View style={s.emptyState}>
          <ChartIcon size={40} color="#555577" />
          <Text style={s.emptyText}>{t('history.emptyTitle')}</Text>
          <Text style={s.emptySubText}>{t('history.emptySubtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={histories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          renderItem={({ item, index }) => {
            const isExpanded = expandedId === item.id
            const gameNum = histories.length - index
            return (
              <Pressable
                style={[
                  s.card,
                  index === 0
                    ? { borderColor: 'rgba(0, 240, 255, 0.3)', shadowColor: '#00F0FF', shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }
                    : {},
                ]}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                accessibilityLabel={t('history.gameDetail', { num: gameNum })}
                accessibilityRole="button"
              >
                {/* GAME OVER 배너 */}
                <View style={[s.gameOverBanner, { backgroundColor: index === 0 ? 'rgba(255, 51, 85, 0.08)' : 'rgba(255, 51, 85, 0.04)' }]}>
                  <Text style={[s.gameOverBannerText, index > 0 && { opacity: 0.4 }]}>GAME OVER</Text>
                </View>
                {/* 카드 헤더 */}
                <View style={s.cardHeader}>
                  <View style={s.cardLeft}>
                    <View style={s.gameNumRow}>
                      <Text style={s.gameNum}>
                        GAME #{gameNum}
                      </Text>
                    </View>
                    <Text style={s.gameDate}>{formatDate(item.endedAt)}</Text>
                  </View>
                  <View style={s.cardRight}>
                    <Text style={s.scoreLabel}>SCORE</Text>
                    <Text style={s.scoreValue}>{item.finalScore}</Text>
                  </View>
                </View>

                {/* 요약 */}
                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{item.totalLineClears}</Text>
                    <Text style={s.statLabel}>{t('history.lineClear')}</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{item.completedTasks.length}</Text>
                    <Text style={s.statLabel}>{t('history.tasksCompleted')}</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={[s.statValue, s.statValueMuted]}>
                      {(item.incompleteTasks ?? []).length}
                    </Text>
                    <Text style={s.statLabel}>{t('history.tasksIncomplete')}</Text>
                  </View>
                  {(item.achievements.length > 0 ||
                    item.completedTasks.length > 0 ||
                    (item.incompleteTasks ?? []).length > 0) && (
                    <Text style={s.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                  )}
                </View>

                {/* 펼침 — 줄 클리어 성취 + 태스크 목록 */}
                {isExpanded && (
                  <View style={s.expandedBody}>
                    {item.achievements.map((ach) => (
                      <View key={ach.id} style={s.achRow}>
                        <Text style={s.achText}>
                          <Text style={s.achStar}>★ </Text>
                          {t('history.lineInfo', { count: ach.lineCount, score: ach.score })}
                        </Text>
                      </View>
                    ))}

                    {item.completedTasks.length > 0 && (
                      <View style={s.taskSection}>
                        <Text style={s.taskSectionLabel}>{t('history.tasksCompleted')}</Text>
                        {item.completedTasks.map((task, i) => (
                          <View key={`c-${i}`} style={s.taskRow}>
                            <View style={[s.taskDot, { backgroundColor: getColorHex(task.colorId) }]} />
                            <Text style={s.taskText} numberOfLines={1}>{task.content}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {(item.incompleteTasks ?? []).length > 0 && (
                      <View style={s.taskSection}>
                        <Text style={[s.taskSectionLabel, s.taskSectionLabelMuted]}>
                          {t('history.tasksIncomplete')}
                        </Text>
                        {(item.incompleteTasks ?? []).map((task, i) => (
                          <View key={`i-${i}`} style={s.taskRow}>
                            <View style={[s.taskDot, s.taskDotMuted]} />
                            <Text style={[s.taskText, s.taskTextMuted]} numberOfLines={1}>
                              {task.content}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            )
          }}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  title: {
    fontFamily: 'PressStart2P', fontSize: 11, color: '#FFFFFF', letterSpacing: 2,
    textShadowColor: '#00F0FF', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  subtitle: { fontFamily: 'InterBold', color: '#8888AA', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: 'InterBold', color: '#8888AA', fontSize: 16 },
  emptySubText: { fontFamily: 'Inter', color: '#555577', fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)',
    backgroundColor: '#1A1A35',
    shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 3,
  },
  gameOverBanner: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255, 51, 85, 0.15)',
  },
  gameOverBannerText: {
    fontFamily: 'PressStart2P', fontSize: 12, color: '#FF3355', letterSpacing: 4,
    textShadowColor: 'rgba(255, 51, 85, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  cardLeft: {},
  gameNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gameNum: {
    fontFamily: 'PressStart2P', fontSize: 12, color: '#00F0FF', letterSpacing: 1,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameDate: { fontFamily: 'InterBold', fontSize: 13, color: '#8888AA', marginTop: 6 },
  cardRight: { alignItems: 'flex-end' as const },
  scoreLabel: {
    fontFamily: 'PressStart2P', fontSize: 9, color: '#8888AA', letterSpacing: 2, marginBottom: 4,
    textShadowColor: 'rgba(255, 229, 0, 0.3)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  scoreValue: {
    fontFamily: 'PressStart2P', fontSize: 22, color: '#FFE500',
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14, gap: 20,
  },
  stat: { alignItems: 'center' },
  statValue: {
    fontFamily: 'InterBold', fontSize: 18, color: '#E8E8FF',
    textShadowColor: 'rgba(0, 240, 255, 0.3)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  statValueMuted: {
    color: '#8888AA',
    textShadowColor: 'transparent',
  },
  statLabel: { fontFamily: 'InterBold', fontSize: 11, color: '#8888AA', marginTop: 2 },
  taskSection: {
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(42, 42, 80, 0.5)',
  },
  taskSectionLabel: {
    fontFamily: 'PressStart2P', fontSize: 9, letterSpacing: 1.2,
    color: '#00F0FF', marginBottom: 6,
  },
  taskSectionLabelMuted: {
    color: '#8888AA',
  },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  taskDot: {
    width: 8, height: 8, borderRadius: 2,
  },
  taskDotMuted: {
    backgroundColor: '#5A5A72',
  },
  taskText: {
    fontFamily: 'Inter', fontSize: 13, color: '#E8E8FF', flex: 1,
  },
  taskTextMuted: {
    color: '#8888AA',
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(136, 136, 170, 0.6)',
  },
  expandArrow: { color: '#00F0FF', fontSize: 14, marginLeft: 'auto' },
  expandedBody: {
    borderTopWidth: 1, borderTopColor: 'rgba(42, 42, 80, 0.5)',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  achRow: { marginBottom: 6 },
  achStar: {
    color: '#FFE500', fontSize: 14,
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  achText: {
    fontFamily: 'InterBold', color: '#E8E8FF', fontSize: 14,
    textShadowColor: 'rgba(0, 240, 255, 0.3)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
})
