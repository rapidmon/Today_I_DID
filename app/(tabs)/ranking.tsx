import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RankingScreen() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>RANKING</Text>
      </View>
      <View style={s.emptyState}>
        <Text style={s.emptyIcon}>🏆</Text>
        <Text style={s.emptyText}>랭킹 개발 예정</Text>
        <Text style={s.emptySubText}>다른 유저들과 점수를 겨루는{'\n'}랭킹 시스템이 준비 중입니다</Text>
        <View style={s.comingSoonBadge}>
          <Text style={s.comingSoonText}>COMING SOON</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A1A2E', letterSpacing: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: '#888899', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#AAAABB', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  comingSoonBadge: {
    marginTop: 20, backgroundColor: '#FFF8E8',
    borderWidth: 2, borderColor: '#FFBB00', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  comingSoonText: { color: '#CC8800', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
})
