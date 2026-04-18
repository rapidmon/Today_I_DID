import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { TrophyIcon } from '@/components/ui/Icons'

export default function RankingScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.title}>RANKING</Text>
      </View>
      <View style={s.emptyState}>
        <View style={s.trophyBox}>
          <TrophyIcon size={40} color="#FFE500" />
        </View>
        <Text style={s.emptyText}>{t('ranking.comingSoon')}</Text>
        <Text style={s.emptySubText}>{t('ranking.comingSoonSub')}</Text>
        <View style={s.comingSoonBadge}>
          <Text style={s.comingSoonText}>COMING SOON</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A1A' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  title: {
    fontFamily: 'PressStart2P', fontSize: 11, color: '#E8E8FF', letterSpacing: 2,
    textShadowColor: 'rgba(0, 240, 255, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  trophyBox: {
    width: 80, height: 80, borderRadius: 24, marginBottom: 24,
    backgroundColor: 'rgba(255, 229, 0, 0.05)',
    borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFE500', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontFamily: 'InterBold', color: '#E8E8FF', fontSize: 18 },
  emptySubText: {
    fontFamily: 'Inter', color: '#555577', fontSize: 14, marginTop: 8,
    textAlign: 'center', lineHeight: 22,
  },
  comingSoonBadge: {
    marginTop: 24, backgroundColor: 'rgba(255, 229, 0, 0.1)',
    borderWidth: 1, borderColor: 'rgba(255, 229, 0, 0.3)',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    shadowColor: '#FFE500', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2, shadowRadius: 12,
  },
  comingSoonText: {
    fontFamily: 'PressStart2P', color: '#FFE500', fontSize: 9, letterSpacing: 3,
    textShadowColor: 'rgba(255, 229, 0, 0.6)', textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
})
