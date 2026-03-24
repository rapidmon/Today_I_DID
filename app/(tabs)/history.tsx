import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHistoryStore } from '@/stores/historyStore'

const BLOCK_TYPE_COLORS: Record<string, string> = {
  I: '#0088FF', O: '#FFDD00', T: '#CC00FF',
  S: '#00CC00', Z: '#FF0000', J: '#FF8800', L: '#FF00AA',
}

export default function HistoryScreen() {
  const histories = useHistoryStore((s) => s.histories)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>HISTORY</Text>
        <Text style={s.subtitle}>{histories.length}판 플레이</Text>
      </View>

      {histories.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>📊</Text>
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
                style={s.card}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                accessibilityLabel={`게임 ${gameNum} 상세보기`}
              >
                {/* 카드 헤더 */}
                <View style={s.cardHeader}>
                  <View style={s.cardLeft}>
                    <Text style={s.gameNum}>GAME #{gameNum}</Text>
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
                        <View key={i} style={s.taskRow}>
                          <View style={[s.blockDot, { backgroundColor: BLOCK_TYPE_COLORS[task.blockType] || '#888899' }]} />
                          <Text style={s.taskText} numberOfLines={1}>{task.content}</Text>
                        </View>
                      ))
                    )}

                    {item.achievements.length > 0 && (
                      <>
                        <Text style={[s.sectionTitle, { marginTop: 12 }]}>줄 클리어 성취</Text>
                        {item.achievements.map((ach, i) => (
                          <View key={i} style={s.achRow}>
                            <Text style={s.achText}>LINE #{i + 1} — {ach.lineCount}줄 · +{ach.score}</Text>
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
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', letterSpacing: 2 },
  subtitle: { color: '#888899', fontSize: 13, fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#888899', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#AAAABB', fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#E8E8F0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  cardLeft: {},
  gameNum: { fontSize: 15, fontWeight: 'bold', color: '#1A1A2E', letterSpacing: 1 },
  gameDate: { fontSize: 12, color: '#888899', marginTop: 2 },
  cardRight: { alignItems: 'flex-end' },
  scoreLabel: { fontSize: 10, color: '#888899', fontWeight: 'bold', letterSpacing: 1 },
  scoreValue: { fontSize: 22, fontWeight: 'bold', color: '#CC8800' },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, gap: 16,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1A1A2E' },
  statLabel: { fontSize: 10, color: '#AAAABB', marginTop: 2 },
  expandArrow: { color: '#AAAABB', fontSize: 12, marginLeft: 'auto' },
  expandedBody: {
    borderTopWidth: 1, borderTopColor: '#E8E8F0',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#888899', letterSpacing: 1, marginBottom: 8 },
  noData: { color: '#AAAABB', fontSize: 13 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  blockDot: {
    width: 12, height: 12, marginRight: 8,
    borderTopWidth: 1, borderLeftWidth: 1, borderTopColor: 'rgba(255,255,255,0.4)', borderLeftColor: 'rgba(255,255,255,0.4)',
    borderBottomWidth: 1, borderRightWidth: 1, borderBottomColor: 'rgba(0,0,0,0.3)', borderRightColor: 'rgba(0,0,0,0.3)',
  },
  taskText: { color: '#555566', fontSize: 13, flex: 1 },
  achRow: { marginBottom: 4 },
  achText: { color: '#555566', fontSize: 12 },
})
