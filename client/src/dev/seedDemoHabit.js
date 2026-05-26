// DEV-only — never runs in production builds (import.meta.env.DEV guard in main.jsx)

import useHabitStore, { localISO } from '../store/useHabitStore'

export async function seedDemoHabit() {
  let auth = {}
  try { auth = JSON.parse(localStorage.getItem('streak-auth') || '{}') } catch {}

  if (!auth.email) {
    console.error('[seedDemoHabit] No user logged in — sign in first')
    return
  }

  const store = useHabitStore.getState()

  // Upsert guard: skip creating if habit already exists for this user
  const existing = store.habits.find(
    h => h.name.toLowerCase() === 'morning meditation'
  )

  if (!existing) {
    store.addBuildHabit({
      name:              'Morning Meditation',
      emoji:             '🧘',
      identityStatement: 'someone who starts every day with intention',
      cue:               'After my alarm, at my desk',
      habitStack:        'After I make coffee, I will meditate for 10 mins',
      minimumVersion:    'Just sit quietly for 2 minutes',
      reward:            'A long walk after 7 days',
    })
  }

  // Re-read after potential insert
  const habit = useHabitStore.getState().habits.find(
    h => h.name.toLowerCase() === 'morning meditation'
  )
  if (!habit) return

  // Build 6-day streak: today minus 5 days through today (idempotent)
  const streakDates = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (5 - i))
    return localISO(d)
  })

  const { completions, habits, userEmail } = useHabitStore.getState()
  const merged = {
    ...completions,
    [habit.id]: [...new Set([...(completions[habit.id] || []), ...streakDates])],
  }

  localStorage.setItem(
    `streak-habits-v2-${userEmail.toLowerCase()}`,
    JSON.stringify({ habits, completions: merged })
  )
  useHabitStore.setState({ completions: merged })
}

if (import.meta.env.DEV) {
  seedDemoHabit().then(() => {
    console.log('✅ Demo habit seeded')
  })
}
