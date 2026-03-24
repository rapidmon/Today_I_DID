import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GameHistory } from '@/types/game'

interface HistoryStore {
  histories: GameHistory[]
  addHistory: (history: GameHistory) => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      histories: [],

      addHistory: (history) =>
        set((s) => ({ histories: [history, ...s.histories] })),
    }),
    {
      name: 'history-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
