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
      widgetBridge.addBlockToQueue(block.type, block.colorId, block.sourceRecordId, content)
        .catch(() => { /* 위젯 동기화 실패 무시 */ })

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
      widgetBridge.addPenalties(count)
        .catch(() => { /* 위젯 동기화 실패 무시 */ })

      const withPenalties = { ...s.gameState, pendingPenalties: count }
      return { gameState: applyPenalties(withPenalties) }
    }),

  applyDailyBonus: (todayStr) =>
    set((s) => {
      const newState = applyDailyBonus(s.gameState, todayStr)
      widgetBridge.updateScore(newState.score)
        .catch(() => { /* 위젯 동기화 실패 무시 */ })
      return { gameState: newState }
    }),

  syncScore: (score) =>
    set((s) => ({ gameState: { ...s.gameState, score } })),

  resetGame: () => {
    widgetBridge.resetGame()
      .catch(() => { /* 위젯 동기화 실패 무시 */ })
    return set({ gameState: createInitialState() })
  },
}))
