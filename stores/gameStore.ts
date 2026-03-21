import { create } from 'zustand'
import {
  createInitialState,
  processAction,
  advanceAnimation,
  spawnPiece,
  applyPenalties,
  applyDailyBonus,
} from '@/lib/tetrisEngine'
import widgetBridge from '@/lib/widgetBridge'
import type { GameState, GameAction, QueuedBlock } from '@/types/game'

interface GameStore {
  gameState: GameState
  dispatch: (action: GameAction) => void
  advanceAnimation: () => void
  addBlock: (block: QueuedBlock, content: string) => void
  addPenalties: (count: number) => void
  applyDailyBonus: (todayStr: string) => void
  syncScore: (score: number) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: createInitialState(),

  dispatch: (action) =>
    set((s) => ({ gameState: processAction(s.gameState, action) })),

  advanceAnimation: () =>
    set((s) => ({ gameState: advanceAnimation(s.gameState) })),

  addBlock: (block, content) =>
    set((s) => {
      // SharedPreferences에 블록 추가 (위젯 동기화)
      widgetBridge.addBlockToQueue(block.type, block.colorId, block.sourceRecordId, content)

      const newState = {
        ...s.gameState,
        blockQueue: [...s.gameState.blockQueue, block],
      }
      if (!newState.activePiece && !newState.gameOver) {
        return { gameState: spawnPiece(newState) }
      }
      return { gameState: newState }
    }),

  addPenalties: (count) =>
    set((s) => {
      // SharedPreferences에 페널티 전달 (위젯 동기화)
      widgetBridge.addPenalties(count)

      const withPenalties = { ...s.gameState, pendingPenalties: count }
      return { gameState: applyPenalties(withPenalties) }
    }),

  applyDailyBonus: (todayStr) =>
    set((s) => {
      const newState = applyDailyBonus(s.gameState, todayStr)
      // 점수 변경 시 위젯 동기화
      widgetBridge.updateScore(newState.score)
      return { gameState: newState }
    }),

  // 위젯 score를 앱에 동기화 (위젯에서 줄 클리어 시 점수가 올라가므로)
  syncScore: (score) =>
    set((s) => ({ gameState: { ...s.gameState, score } })),

  resetGame: () => {
    widgetBridge.resetGame()
    return set({ gameState: createInitialState() })
  },
}))
