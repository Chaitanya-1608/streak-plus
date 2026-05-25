import { create } from 'zustand'

const TODAY = () => new Date().toISOString().split('T')[0]

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('streak-habits-v2')) || { habits: [], completions: {} }
  } catch {
    return { habits: [], completions: {} }
  }
}

const persist = (habits, completions) => {
  localStorage.setItem('streak-habits-v2', JSON.stringify({ habits, completions }))
}

const computeStreak = (dates) => {
  if (!dates.length) return 0
  const sorted = [...dates].sort().reverse()
  let streak = 0
  let cursor = TODAY()

  for (const d of sorted) {
    if (d === cursor) {
      streak++
      const prev = new Date(cursor)
      prev.setDate(prev.getDate() - 1)
      cursor = prev.toISOString().split('T')[0]
    } else if (d < cursor) {
      break
    }
  }
  return streak
}

const computeLongest = (dates) => {
  if (!dates.length) return 0
  const sorted = [...dates].sort()
  let longest = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
    if (diff === 1) { current++; if (current > longest) longest = current }
    else if (diff > 1) { current = 1 }
  }
  return longest
}

// Returns 7 dots for Mon–Sun of the current week
const weekDots = (completions, habitId, createdAt) => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1
  monday.setDate(today.getDate() - dayIdx)

  const doneSet = new Set(completions[habitId] || [])
  const created = createdAt ? new Date(createdAt) : new Date(0)
  created.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    let state
    if (d > today)    state = 'future'
    else if (d < created) state = 'future'
    else if (doneSet.has(iso)) state = 'done'
    else               state = 'missed'
    return { date: iso, state }
  })
}

const saved = load()

const useHabitStore = create((set, get) => ({
  habits:      saved.habits,
  completions: saved.completions,

  addHabit: (habit) => {
    const exists = get().habits.some(
      h => h.name.toLowerCase() === habit.name.toLowerCase()
    )
    if (exists) return

    const newHabit = { id: Date.now(), createdAt: TODAY(), ...habit }
    const habits = [...get().habits, newHabit]
    persist(habits, get().completions)
    set({ habits })
  },

  completeHabit: (id) => {
    const today = TODAY()
    const prev = get().completions[id] || []
    if (prev.includes(today)) return

    const completions = { ...get().completions, [id]: [...prev, today] }
    persist(get().habits, completions)
    set({ completions })
  },

  // Derived selectors
  getWeekDots: (id) => {
    const habit = get().habits.find(h => h.id === id)
    return weekDots(get().completions, id, habit?.createdAt)
  },
  getCurrentStreak: (id) => computeStreak(get().completions[id] || []),
  getLongestStreak: (id) => computeLongest(get().completions[id] || []),
  isCompletedToday: (id) => (get().completions[id] || []).includes(TODAY()),
  getAllDates:       (id) => [...(get().completions[id] || [])].sort(),

  // Aggregate stats across all habits
  getTodayCount: () => {
    const today = TODAY()
    return get().habits.filter(h => (get().completions[h.id] || []).includes(today)).length
  },
  getTopStreak: () => {
    return Math.max(0, ...get().habits.map(h => computeStreak(get().completions[h.id] || [])))
  },
  getPersonalBest: () => {
    return Math.max(0, ...get().habits.map(h => computeLongest(get().completions[h.id] || [])))
  },
  getAllTimeCompletions: () => {
    return Object.values(get().completions).reduce((sum, arr) => sum + arr.length, 0)
  },

  // Returns 7 objects { date, completedCount, totalHabits } for Mon–Sun of current week
  getWeekSummary: () => {
    const habits = get().habits
    const completions = get().completions
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const monday = new Date(today)
    const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1
    monday.setDate(today.getDate() - dayIdx)

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + i)
      const iso = d.toISOString().split('T')[0]
      const completedCount = habits.filter(h => (completions[h.id] || []).includes(iso)).length
      return { date: iso, completedCount, totalHabits: habits.length }
    })
  },
}))

export default useHabitStore
