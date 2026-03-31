import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import type { Task, Routine } from '@/types/record'
import widgetBridge from '@/lib/widgetBridge'

const genId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

interface TaskStore {
  tasks: Task[]
  routines: Routine[]
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  setTasks: (updater: (prev: Task[]) => Task[]) => void
  addRoutine: (routine: Routine) => void
  removeRoutine: (routineId: string) => void
  genId: (prefix: string) => string
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      routines: [],

      addTask: (task) =>
        set((s) => ({ tasks: [task, ...s.tasks] })),

      updateTask: (taskId, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        })),

      setTasks: (updater) =>
        set((s) => ({ tasks: updater(s.tasks) })),

      addRoutine: (routine) =>
        set((s) => ({ routines: [...s.routines, routine] })),

      removeRoutine: (routineId) =>
        set((s) => ({ routines: s.routines.filter((r) => r.id !== routineId) })),

      genId,
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// tasks 변경 시 위젯 SharedPreferences에 동기화
if (Platform.OS === 'android') {
  let prevPendingJson = ''
  useTaskStore.subscribe((state) => {
    const pending = state.tasks
      .filter((t) => t.status === 'pending')
      .map((t) => ({ content: t.content, status: t.status }))
    const json = JSON.stringify(pending)
    if (json !== prevPendingJson) {
      prevPendingJson = json
      widgetBridge.syncTasks(json).catch(() => {})
    }
  })
}
