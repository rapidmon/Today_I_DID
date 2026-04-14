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
  syncTasks: (tasksJson: string) => Promise<boolean>
  getLastGameScore: () => Promise<number>
  getLastGameAchievements: () => Promise<string>
  clearLastGameData: () => Promise<boolean>
}

const noop = async () => true
const noopString = async () => '[]'

// iOS: ExtensionStorage를 사용하여 위젯과 데이터 공유
let iosStorage: {
  set: (key: string, value: string | number) => void
  get: (key: string) => string | null
  remove: (key: string) => void
} | null = null

let reloadWidget: (() => void) | null = null

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AppleTargets = require('@bacons/apple-targets')
    const StorageClass = AppleTargets.ExtensionStorage
    iosStorage = new StorageClass('group.com.limheerae.TodayIdid')
    reloadWidget = () => StorageClass.reloadWidget('TetrisWidget')
  } catch {
    // 패키지 사용 불가 시 무시
  }
}

// iOS 전용 브릿지 (ExtensionStorage 기반)
function createIosBridge(): WidgetBridge | null {
  if (!iosStorage || !reloadWidget) return null

  const storage = iosStorage
  const reload = reloadWidget

  return {
    addBlockToQueue: async (type: string, colorId: number, sourceRecordId: string, content: string) => {
      // blockQueue 로드
      let queue: Array<{ type: string; colorId: number; sourceRecordId: string }> = []
      const queueJson = storage.get('blockQueue')
      if (queueJson) {
        try { queue = JSON.parse(queueJson) } catch { /* 무시 */ }
      }

      // 새 블록 추가
      queue.push({ type, colorId, sourceRecordId })
      storage.set('blockQueue', JSON.stringify(queue))

      // recordMap에 content 저장
      let recordMap: Record<string, { content: string; blockType: string }> = {}
      const recordMapJson = storage.get('recordMap')
      if (recordMapJson) {
        try { recordMap = JSON.parse(recordMapJson) } catch { /* 무시 */ }
      }
      recordMap[sourceRecordId] = { content, blockType: type }
      storage.set('recordMap', JSON.stringify(recordMap))

      // 위젯 리로드 (getTimeline에서 trySpawnPiece 자동 호출)
      reload()
      return true
    },

    addPenalties: async (count: number) => {
      storage.set('pendingPenalties', count)
      return true
    },

    updateScore: async (score: number) => {
      storage.set('score', score)
      reload()
      return true
    },

    resetGame: async () => {
      // resetRequested 플래그 설정 → 위젯의 getTimeline에서 실제 리셋 수행
      storage.set('resetRequested', 1)
      reload()
      return true
    },

    refreshWidget: async () => {
      reload()
      return true
    },

    getScore: async () => {
      const val = storage.get('score')
      return val ? parseInt(val, 10) || 0 : 0
    },

    isGameOver: async () => {
      const val = storage.get('gameOver')
      return val === 'true' || val === '1'
    },

    getAchievements: async () => {
      return storage.get('achievements') ?? '[]'
    },

    syncTasks: async (tasksJson: string) => {
      storage.set('pendingTasks', tasksJson)
      reload()
      return true
    },

    getLastGameScore: async () => {
      const val = storage.get('lastGame_score')
      return val ? parseInt(val, 10) || 0 : 0
    },

    getLastGameAchievements: async () => {
      return storage.get('lastGame_achievements') ?? '[]'
    },

    clearLastGameData: async () => {
      storage.remove('lastGame_score')
      storage.remove('lastGame_achievements')
      return true
    },
  }
}

// Android: 기존 네이티브 모듈 사용
function createAndroidBridge(): WidgetBridge | null {
  if (Platform.OS !== 'android' || !TetrisWidgetBridge) return null

  // 네이티브 메서드가 동기 throw하거나 undefined인 경우에도
  // .catch()가 동작하도록 항상 Promise로 감싼다 (bridgeless 모드 호환)
  const safe = <T>(fn: () => unknown, fallback: T): Promise<T> => {
    try {
      const result = fn()
      if (result && typeof (result as Promise<T>).then === 'function') {
        return (result as Promise<T>).catch(() => fallback)
      }
      return Promise.resolve((result as T) ?? fallback)
    } catch {
      return Promise.resolve(fallback)
    }
  }

  return {
    addBlockToQueue: (type, colorId, sourceRecordId, content) =>
      safe(() => TetrisWidgetBridge.addBlockToQueue(type, colorId, sourceRecordId, content), true),
    addPenalties: (count) =>
      safe(() => TetrisWidgetBridge.addPenalties(count), true),
    updateScore: (score) =>
      safe(() => TetrisWidgetBridge.updateScore(score), true),
    resetGame: () =>
      safe(() => TetrisWidgetBridge.resetGame(), true),
    refreshWidget: () =>
      safe(() => TetrisWidgetBridge.refreshWidget(), true),
    getScore: () =>
      safe<number>(() => TetrisWidgetBridge.getScore(), 0),
    isGameOver: () =>
      safe<boolean>(() => TetrisWidgetBridge.isGameOver(), false),
    getAchievements: () =>
      safe<string>(() => TetrisWidgetBridge.getAchievements(), '[]'),
    syncTasks: (tasksJson) =>
      safe(() => TetrisWidgetBridge.syncTasks(tasksJson), true),
    getLastGameScore: () =>
      safe<number>(() => TetrisWidgetBridge.getLastGameScore(), 0),
    getLastGameAchievements: () =>
      safe<string>(() => TetrisWidgetBridge.getLastGameAchievements(), '[]'),
    clearLastGameData: () =>
      safe(() => TetrisWidgetBridge.clearLastGameData(), true),
  }
}

// 플랫폼별 브릿지 선택
const bridge: WidgetBridge = createIosBridge()
  ?? createAndroidBridge()
  ?? {
    addBlockToQueue: noop,
    addPenalties: noop,
    updateScore: noop,
    resetGame: noop,
    refreshWidget: noop,
    getScore: async () => 0,
    isGameOver: async () => false,
    getAchievements: noopString,
    syncTasks: noop,
    getLastGameScore: async () => 0,
    getLastGameAchievements: noopString,
    clearLastGameData: noop,
  }

export default bridge
