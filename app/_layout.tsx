import '@/lib/i18n'
import { useEffect, useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { View, ActivityIndicator } from 'react-native'
import { getHasSeenOnboarding } from '@/lib/onboardingStorage'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P: PressStart2P_400Regular,
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A1A' }}>
        <ActivityIndicator size="large" color="#00F0FF" />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <OnboardingGate />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}

// Stack이 마운트된 이후에 온보딩 리다이렉트를 수행해야
// expo-router의 네비게이션이 정상 동작한다
function OnboardingGate() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return
    let mounted = true
    getHasSeenOnboarding().then((seen) => {
      if (!mounted) return
      setChecked(true)
      if (!seen) {
        router.replace('/onboarding')
      }
    })
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked])

  return null
}
