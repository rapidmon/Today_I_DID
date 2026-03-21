import { NativeModules, Platform } from 'react-native'

const { TetrisWidgetBridge } = NativeModules

interface WidgetBridge {
  addBlockToQueue: (type: string, colorId: number, sourceRecordId: string, content: string) => Promise<boolean>
  addPenalties: (count: number) => Promise<boolean>
  updateScore: (score: number) => Promise<boolean>
  resetGame: () => Promise<boolean>
  refreshWidget: () => Promise<boolean>
  getScore: () => Promise<number>
  isGameOver: () => Promise<boolean>
  getAchievements: () => Promise<string>
}

const noop = async () => true
const noopString = async () => '[]'

// Android와 iOS 모두 같은 네이티브 모듈 이름(TetrisWidgetBridge)을 사용
const bridge: WidgetBridge = (Platform.OS === 'android' || Platform.OS === 'ios') && TetrisWidgetBridge
  ? {
      addBlockToQueue: (type: string, colorId: number, sourceRecordId: string, content: string) =>
        TetrisWidgetBridge.addBlockToQueue(type, colorId, sourceRecordId, content),
      addPenalties: (count: number) =>
        TetrisWidgetBridge.addPenalties(count),
      updateScore: (score: number) =>
        TetrisWidgetBridge.updateScore(score),
      resetGame: () =>
        TetrisWidgetBridge.resetGame(),
      refreshWidget: () =>
        TetrisWidgetBridge.refreshWidget(),
      getScore: () =>
        TetrisWidgetBridge.getScore(),
      isGameOver: () =>
        TetrisWidgetBridge.isGameOver(),
      getAchievements: () =>
        TetrisWidgetBridge.getAchievements(),
    }
  : {
      addBlockToQueue: noop,
      addPenalties: noop,
      updateScore: noop,
      resetGame: noop,
      refreshWidget: noop,
      getScore: async () => 0,
      isGameOver: async () => false,
      getAchievements: noopString,
    }

export default bridge
