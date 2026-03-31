import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChartIcon } from '@/components/ui/Icons'
import { useHistoryStore } from '@/stores/historyStore'
import { BLOCK_TYPE_COLORS } from '@/constants/tetris'

export default function HistoryScreen() {
  const histories = useHistoryStore((s) => s.histories)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

  const insets = useSafeAreaInsets()

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>HISTORY</Text>
        <Text style={s.subtitle}>{histories.length}판 플레이</Text>
      </View>

      {histories.length === 0 ? (
        <View style={s.emptyState}>
          <ChartIcon size={40} color="#555577" />
          <Text style={s.emptyText}>아직 기록이 없어요</Text>
          <Text style={s.emptySubText}>게임이 끝나면 여기에 기록이 쌓입니다</Text>
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
                accessibilityLabel={`게임 ${gameNum} 상세보기`}
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
                      <Text style={[s.gameNum, index === 0 && { color: '#00F0FF', textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 }]}>
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
                    <Text style={s.statLabel}>줄 클리어</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{item.completedTasks.length}</Text>
                    <Text style={s.statLabel}>완료한 일</Text>
                  </View>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{item.achievements.length}</Text>
                    <Text style={s.statLabel}>성취</Text>
                  </View>
                  <Text style={s.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                </View>

                {/* 펼침 — 완료한 할 일 목록 */}
                {isExpanded && (
                  <View style={s.expandedBody}>
                    <Text style={s.sectionTitle}>완료한 할 일</Text>
                    {item.completedTasks.length === 0 ? (
                      <Text style={s.noData}>기록 없음</Text>
                    ) : (
                      item.completedTasks.map((task, i) => (
                        <View key={`${task.completedAt}_${i}`} style={s.taskRow}>
                          <View style={[s.blockDot, { backgroundColor: BLOCK_TYPE_COLORS[task.blockType] || '#888899' }]} />
                          <Text style={s.taskText} numberOfLines={1}>{task.content}</Text>
                        </View>
                      ))
                    )}

                    {item.achievements.length > 0 && (
                      <>
                        <Text style={[s.sectionTitle, { marginTop: 12 }]}>줄 클리어 성취</Text>
                        {item.achievements.map((ach) => (
                          <View key={ach.id} style={s.achRow}>
                            <Text style={s.achText}>LINE — {ach.lineCount}줄 · +{ach.score}</Text>
                          </View>
                        ))}
                      </>
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
    fontFamily: 'PressStart2P', fontSize: 11, color: '#E8E8FF', letterSpacing: 2,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: { fontFamily: 'InterBold', color: '#8888AA', fontSize: 13 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: 'InterBold', color: '#8888AA', fontSize: 16 },
  emptySubText: { fontFamily: 'Inter', color: '#555577', fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2A2A50',
    backgroundColor: '#1A1A35',
  },
  gameOverBanner: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255, 51, 85, 0.15)',
  },
  gameOverBannerText: {
    fontFamily: 'PressStart2P', fontSize: 11, color: '#FF3355', letterSpacing: 4,
    textShadowColor: 'rgba(255, 51, 85, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  cardLeft: {},
  gameNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gameNum: {
    fontFamily: 'PressStart2P', fontSize: 10, color: '#8888AA', letterSpacing: 1,
  },
  // gameOverBadge/gameOverText는 배너로 대체됨 — 미사용
  gameDate: { fontFamily: 'Inter', fontSize: 12, color: '#555577', marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  scoreLabel: { fontFamily: 'PressStart2P', fontSize: 7, color: '#555577', letterSpacing: 2 },
  scoreValue: {
    fontFamily: 'PressStart2P', fontSize: 18, color: '#FFE500',
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, gap: 16,
  },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: 'InterBold', fontSize: 16, color: '#E8E8FF' },
  statLabel: { fontFamily: 'Inter', fontSize: 10, color: '#555577', marginTop: 2 },
  expandArrow: { color: '#555577', fontSize: 12, marginLeft: 'auto' },
  expandedBody: {
    borderTopWidth: 1, borderTopColor: 'rgba(42, 42, 80, 0.5)',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionTitle: {
    fontFamily: 'PressStart2P', fontSize: 7, color: '#555577',
    letterSpacing: 3, marginBottom: 8,
  },
  noData: { fontFamily: 'Inter', color: '#555577', fontSize: 13 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  blockDot: {
    width: 12, height: 12, marginRight: 8, borderRadius: 2,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)', borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomWidth: 2, borderRightWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.55)', borderRightColor: 'rgba(0,0,0,0.5)',
  },
  taskText: { fontFamily: 'Inter', color: '#8888AA', fontSize: 13, flex: 1 },
  achRow: { marginBottom: 4 },
  achText: { fontFamily: 'Inter', color: '#8888AA', fontSize: 12 },
})
