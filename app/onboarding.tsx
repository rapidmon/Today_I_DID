import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS } from '@/constants/homeStyles'
import { setHasSeenOnboarding } from '@/lib/onboardingStorage'
import { Slide1 } from '@/components/onboarding/Slide1'
import { Slide2 } from '@/components/onboarding/Slide2'
import { Slide3 } from '@/components/onboarding/Slide3'
import { Slide4 } from '@/components/onboarding/Slide4'

const TOTAL_SLIDES = 4

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { width: screenW } = useWindowDimensions()
  const scrollRef = useRef<ScrollView>(null)
  const [page, setPage] = useState(0)

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x
    const next = Math.round(x / screenW)
    if (next !== page) setPage(next)
  }

  const goNext = () => {
    if (page < TOTAL_SLIDES - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * screenW, animated: true })
    }
  }

  const finish = async () => {
    await setHasSeenOnboarding()
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        <Slide1 />
        <Slide2 />
        <Slide3 />
        <Slide4 />
      </ScrollView>

      {/* 하단 인디케이터 + CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>
        {page < TOTAL_SLIDES - 1 ? (
          <TouchableOpacity
            style={styles.cta}
            onPress={goNext}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.nextSlide')}
          >
            <Text style={styles.ctaText}>{t('onboarding.next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.cta, styles.ctaPrimary]}
            onPress={finish}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.startApp')}
          >
            <Text style={styles.ctaText}>{t('onboarding.start')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: COLORS.bgPrimary,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(136, 136, 170, 0.35)',
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.neonCyan,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  cta: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.45)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ctaPrimary: {
    backgroundColor: 'rgba(0, 240, 255, 0.22)',
    borderColor: 'rgba(0, 240, 255, 0.6)',
  },
  ctaText: {
    fontFamily: 'InterBold',
    fontSize: 14,
    letterSpacing: 1,
    color: COLORS.neonCyan,
  },
})
