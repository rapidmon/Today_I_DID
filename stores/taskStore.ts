import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Task, Routine } from '@/types/record'

let idCounter = 0
const genId = (prefix: string) => `${prefix}_${++idCounter}_${Date.now()}`

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
