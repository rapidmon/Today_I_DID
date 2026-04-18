import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'hasSeenOnboarding'

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY)
    return v === 'true'
  } catch {
    return false
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'true')
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('온보딩 상태 저장 실패:', error)
    }
  }
}
