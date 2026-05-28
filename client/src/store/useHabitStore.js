import { create } from 'zustand'
import { pushToCloud, pullFromCloud } from '../utils/sync'

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

// Normalize a habit row coming from cloud (snake_case → camelCase)
function normalizeCloudHabit(h) {
  return {
    id:                  h.id,
    name:                h.name,
    emoji:               h.emoji,
    createdAt:           h.created_at,
    frequency:           h.frequency || 'daily',
    days:                h.days      || [0, 1, 2, 3, 4, 5, 6],
    mode:                h.mode               || 'maintaining',
    buildStage:          h.build_stage         || 0,
    identityStatement:   h.identity_statement  || '',
    cue:                 h.cue                 || '',
    habitStack:          h.habit_stack         || '',
    minimumVersion:      h.minimum_version     || '',
    reward:              h.reward              || '',
    graduatedAt:         h.graduated_at        || null,
    graceUsedAt:         h.grace_used_at       || null,
  }
}

const initialEmail = getInitialEmail()
const saved        = load(initialEmail)

const useHabitStore = create((set, get) => ({
  habits:      saved.habits,
  completions: saved.completions,
  userEmail:   initialEmail,

  // Called after login/sign-up — loads local instantly, merges cloud in background
  loadForUser: async (email) => {
    const data = load(email)
    set({ habits: data.habits, completions: data.completions, userEmail: email })

    const cloud = await pullFromCloud()
    if (!cloud?.ok) return

    // Merge habits: add any from cloud not already local; cloud mode wins (graduation on other device)
    const localMap = new Map(data.habits.map(h => [h.id, h]))
    const merged   = [...data.habits]
    for (const ch of cloud.habits) {
      if (localMap.has(ch.id)) {
        // Let cloud mode field win (e.g. graduated on another device)
        const local = localMap.get(ch.id)
        if (ch.mode === 'maintaining' && local.mode === 'building') {
          const idx = merged.findIndex(h => h.id === ch.id)
          merged[idx] = { ...local, mode: 'maintaining', graduatedAt: ch.graduated_at || local.graduatedAt }
        }
      } else {
        merged.push(normalizeCloudHabit(ch))
      }
    }

    // Merge completions: union of dates per habit
    const mergedComp = { ...data.completions }
    for (const [habitId, dates] of Object.entries(cloud.completions)) {
      const key   = Number(habitId)
      const local = new Set(mergedComp[key] || [])
      for (const d of dates) local.add(d)
      mergedComp[key] = [...local]
    }

    persist(email, merged, mergedComp)
    set({ habits: merged, completions: mergedComp })
  },

  // Quick-add (Maintain mode)
  addHabit: (habit) => {
    const exists = get().habits.some(
      h => h.name.toLowerCase() === habit.name.toLowerCase()
    )
    if (exists) return
    const newHabit = {
      id: Date.now(), createdAt: TODAY(),
      mode: 'maintaining', buildStage: 0,
      identityStatement: '', cue: '', habitStack: '', minimumVersion: '', reward: '', graduatedAt: null,
      graceUsedAt: null,
      ...habit,
    }
    const habits = [...get().habits, newHabit]
    persist(get().userEmail, habits, get().completions)
    set({ habits })
    pushToCloud(habits, get().completions)
  },

  // Guided Build mode — 5-step wizard result
  addBuildHabit: ({ name, emoji, identityStatement, cue, habitStack, minimumVersion, reward }) => {
    const exists = get().habits.some(h => h.name.toLowerCase() === name.toLowerCase())
    if (exists) return
    const habit = {
      id: Date.now(), createdAt: TODAY(),
      name, emoji: emoji || '🔥',
      frequency: 'daily', days: [0, 1, 2, 3, 4, 5, 6],
      mode: 'building', buildStage: 5,
      identityStatement, cue, habitStack, minimumVersion, reward,
      graduatedAt: null, graceUsedAt: null,
    }
    const habits = [...get().habits, habit]
    persist(get().userEmail, habits, get().completions)
    set({ habits })
    pushToCloud(habits, get().completions)
  },

  // Flip a building habit to maintaining after 21-day trial
  graduateHabit: (id) => {
    const habits = get().habits.map(h =>
      h.id === id ? { ...h, mode: 'maintaining', graduatedAt: TODAY() } : h
    )
    persist(get().userEmail, habits, get().completions)
    set({ habits })
    pushToCloud(habits, get().completions)
  },

  // Returns habits that have just hit 21-day streak and need graduation
  checkGraduations: () => {
    const { habits, completions } = get()
    return habits.filter(h =>
      h.mode === 'building' &&
      !h.graduatedAt &&
      computeStreak(completions[h.id] || []) >= 21
    )
  },

  // Returns the first maintaining habit that just hit a streak milestone and hasn't been celebrated yet
  checkMilestones: () => {
    const { habits, completions, userEmail } = get()
    const key = `streak-milestones-${userEmail || 'anon'}`
    const celebrated = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } })()
    for (const h of habits) {
      if (h.mode !== 'maintaining') continue
      const streak = computeStreak(completions[h.id] || [])
      if ([7, 14, 21, 30, 60, 100, 200, 365].includes(streak) && !celebrated[`${h.id}_${streak}`]) {
        return { habit: h, streak }
      }
    }
    return null
  },

  markMilestoneCelebrated: (habitId, streak) => {
    const key = `streak-milestones-${get().userEmail || 'anon'}`
    const celebrated = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} } })()
    celebrated[`${habitId}_${streak}`] = true
    localStorage.setItem(key, JSON.stringify(celebrated))
  },

  removeHabit: (id) => {
    const habits = get().habits.filter(h => h.id !== id)
    const { [id]: _removed, ...completions } = get().completions
    persist(get().userEmail, habits, completions)
    set({ habits, completions })
    pushToCloud(habits, completions)
  },

  completeHabit: (id) => {
    const today = TODAY()
    const prev  = get().completions[id] || []
    if (prev.includes(today)) return
    const completions = { ...get().completions, [id]: [...prev, today] }
    persist(get().userEmail, get().habits, completions)
    set({ completions })
    pushToCloud(get().habits, completions)
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

  // Returns the most-recent completion date for a habit, or null
  getLastCompletion: (id) => {
    const dates = get().completions[id] || []
    if (!dates.length) return null
    return [...dates].sort().reverse()[0]
  },

  // Returns first habit eligible for a grace recovery, or null
  checkGraceEligible: () => {
    const { habits, completions } = get()
    const today      = new Date()
    const yesterday  = new Date(today); yesterday.setDate(today.getDate() - 1)
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2)
    const yesterdayISO  = localISO(yesterday)
    const twoDaysAgoISO = localISO(twoDaysAgo)
    const now = Date.now()

    return habits.find(h => {
      const dates = completions[h.id] || []
      if (!dates.length) return false
      const last = [...dates].sort().reverse()[0]
      // Last completion must be exactly 2 days ago (missed only yesterday)
      if (last !== twoDaysAgoISO) return false
      // Haven't already recovered yesterday
      if (dates.includes(yesterdayISO)) return false
      // Grace not used in the last 30 days
      if (!h.graceUsedAt) return true
      return (now - new Date(h.graceUsedAt).getTime()) > 30 * 24 * 60 * 60 * 1000
    }) || null
  },

  // Marks yesterday completed for a habit and stamps graceUsedAt
  graceRecoverHabit: (id) => {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayISO = localISO(yesterday)
    const completions  = { ...get().completions }
    const prev = completions[id] || []
    if (!prev.includes(yesterdayISO)) {
      completions[id] = [...prev, yesterdayISO]
    }
    const habits = get().habits.map(h =>
      h.id === id ? { ...h, graceUsedAt: new Date().toISOString() } : h
    )
    persist(get().userEmail, habits, completions)
    set({ habits, completions })
    pushToCloud(habits, completions)
  },

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
