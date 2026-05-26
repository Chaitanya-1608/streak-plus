import { create } from 'zustand'

// Always use LOCAL calendar date — toISOString() returns UTC which causes day-offset bugs
// when the user's timezone is ahead of UTC (e.g. IST = UTC+5:30).
export const localISO = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const TODAY = () => localISO()

// Each user gets an isolated storage key so accounts don't share habit data
const storageKey = (email) =>
  email ? `streak-habits-v2-${email.toLowerCase()}` : 'streak-habits-v2'

const getInitialEmail = () => {
  try { return JSON.parse(localStorage.getItem('streak-auth'))?.email || null }
  catch { return null }
}

const load = (email) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey(email))) || { habits: [], completions: {} }
  } catch {
    return { habits: [], completions: {} }
  }
}

const persist = (email, habits, completions) => {
  localStorage.setItem(storageKey(email), JSON.stringify({ habits, completions }))
}

const computeStreak = (dates) => {
  if (!dates.length) return 0
  const sorted = [...dates].sort().reverse()
  let streak = 0
  let cursor = TODAY()

  for (const d of sorted) {
    if (d === cursor) {
      streak++
      const prev = new Date(cursor + 'T12:00:00') // noon avoids DST edge cases
      prev.setDate(prev.getDate() - 1)
      cursor = localISO(prev)
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
    const a   = new Date(sorted[i - 1] + 'T12:00:00')
    const b   = new Date(sorted[i]     + 'T12:00:00')
    const diff = Math.round((b - a) / 86400000)
    if (diff === 1) { current++; if (current > longest) longest = current }
    else if (diff > 1) { current = 1 }
  }
  return longest
}

// Returns 7 dots for Mon–Sun of the current week using LOCAL dates
const weekDots = (completions, habitId, createdAt) => {
  const today  = new Date()
  const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayIdx)
  monday.setHours(0, 0, 0, 0)

  const doneSet = new Set(completions[habitId] || [])
  const created = createdAt ? new Date(createdAt + 'T00:00:00') : new Date(0)

  return Array.from({ length: 7 }, (_, i) => {
    const d   = new Date(monday); d.setDate(monday.getDate() + i)
    const iso = localISO(d)
    const state =
      d > today   ? 'future'
      : d < created ? 'future'
      : doneSet.has(iso) ? 'done'
      : 'missed'
    return { date: iso, state }
  })
}

const initialEmail = getInitialEmail()
const saved        = load(initialEmail)

const useHabitStore = create((set, get) => ({
  habits:      saved.habits,
  completions: saved.completions,
  userEmail:   initialEmail,

  // Called after login/sign-up to swap in the correct user's data
  loadForUser: (email) => {
    const data = load(email)
    set({ habits: data.habits, completions: data.completions, userEmail: email })
  },

  addHabit: (habit) => {
    const exists = get().habits.some(
      h => h.name.toLowerCase() === habit.name.toLowerCase()
    )
    if (exists) return
    const newHabit = { id: Date.now(), createdAt: TODAY(), ...habit }
    const habits   = [...get().habits, newHabit]
    persist(get().userEmail, habits, get().completions)
    set({ habits })
  },

  completeHabit: (id) => {
    const today = TODAY()
    const prev  = get().completions[id] || []
    if (prev.includes(today)) return
    const completions = { ...get().completions, [id]: [...prev, today] }
    persist(get().userEmail, get().habits, completions)
    set({ completions })
  },

  // Selectors
  getWeekDots:      (id) => weekDots(get().completions, id, get().habits.find(h => h.id === id)?.createdAt),
  getCurrentStreak: (id) => computeStreak(get().completions[id] || []),
  getLongestStreak: (id) => computeLongest(get().completions[id] || []),
  isCompletedToday: (id) => (get().completions[id] || []).includes(TODAY()),
  getAllDates:       (id) => [...(get().completions[id] || [])].sort(),

  getTodayCount: () => {
    const today = TODAY()
    return get().habits.filter(h => (get().completions[h.id] || []).includes(today)).length
  },
  getTopStreak:    () => Math.max(0, ...get().habits.map(h => computeStreak(get().completions[h.id] || []))),
  getPersonalBest: () => Math.max(0, ...get().habits.map(h => computeLongest(get().completions[h.id] || []))),
  getAllTimeCompletions: () => Object.values(get().completions).reduce((sum, arr) => sum + arr.length, 0),

  // 7 slots Mon–Sun using LOCAL dates
  getWeekSummary: () => {
    const { habits, completions } = get()
    const today  = new Date()
    const dayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1
    const monday = new Date(today)
    monday.setDate(today.getDate() - dayIdx)
    monday.setHours(0, 0, 0, 0)

    return Array.from({ length: 7 }, (_, i) => {
      const d              = new Date(monday); d.setDate(monday.getDate() + i)
      const iso            = localISO(d)
      const completedCount = habits.filter(h => (completions[h.id] || []).includes(iso)).length
      return { date: iso, completedCount, totalHabits: habits.length }
    })
  },
}))

export default useHabitStore
