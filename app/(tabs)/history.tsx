import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChartIcon } from '@/components/ui/Icons'
import { NeonText } from '@/components/ui/NeonText'
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
        <NeonText text="HISTORY" color="#00F0FF" fontSize={11} letterSpacing={2} />
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
                      <Text style={s.gameNum}>
                        GAME #{gameNum}
                      </Text>
                    </View>
                    <Text style={s.gameDate}>{formatDate(item.endedAt)}</Text>
                  </View>
                  <View style={s.cardRight}>
                    <Text style={s.scoreLabel}>SCORE</Text>
                    <NeonText text={`${item.finalScore}`} color="#FFE500" fontSize={20} />
                  </View>
                </View>

                {/* 요약 */}
                <View style={s.statsRow}>
                  <View style={s.stat}>
                    <Text style={s.statValue}>{item.totalLineClears}</Text>
                    <Text style={s.statLabel}>줄 클리어</Text>
                  </View>
                  {item.achievements.length > 0 && (
                    <Text style={s.expandArrow}>{isExpanded ? '▲' : '▼'}</Text>
                  )}
                </View>

                {/* 펼침 — 줄 클리어 성취 */}
                {isExpanded && item.achievements.length > 0 && (
                  <View style={s.expandedBody}>
                    {item.achievements.map((ach) => (
                      <View key={ach.id} style={s.achRow}>
                        <Text style={s.achText}>LINE — {ach.lineCount}줄 · +{ach.score}</Text>
                      </View>
                    ))}
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
  statLabel: { fontFamily: 'InterBold', fontSize: 11, color: '#8888AA', marginTop: 2 },
  expandArrow: { color: '#00F0FF', fontSize: 14, marginLeft: 'auto' },
  expandedBody: {
    borderTopWidth: 1, borderTopColor: 'rgba(42, 42, 80, 0.5)',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  achRow: { marginBottom: 6 },
  achText: {
    fontFamily: 'InterBold', color: '#E8E8FF', fontSize: 14,
    textShadowColor: 'rgba(0, 240, 255, 0.3)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
})
