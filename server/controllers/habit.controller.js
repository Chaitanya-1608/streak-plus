const supabase = require('../config/supabase')

exports.createHabit = async (req, res) => {
  try {
    const { name, emoji = '🔥', color = '#ff5c1a', frequency = 'daily' } = req.body
    const userId = req.user.id

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'name is required' })
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([{ user_id: userId, name: name.trim(), emoji, color, frequency }])
      .select()

    if (error) return res.status(400).json({ success: false, error })

    // Create the streaks row for this habit
    await supabase.from('streaks').insert([{ habit_id: data[0].id }])

    res.json({ success: true, data: data[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getHabits = async (req, res) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from('habits')
      .select('*, streaks(current_streak, longest_streak, last_completed)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ success: false, error })

    res.json({ success: true, habits: data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.completeHabit = async (req, res) => {
  try {
    const habitId = req.params.id
    const userId  = req.user.id
    const today   = new Date().toISOString().split('T')[0]

    // Idempotency check
    const { data: existing } = await supabase
      .from('completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('completed_at', today)
      .single()

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already completed today' })
    }

    // Insert completion
    const { error: insertErr } = await supabase
      .from('completions')
      .insert([{ habit_id: habitId, user_id: userId, completed_at: today }])

    if (insertErr) return res.status(400).json({ success: false, error: insertErr })

    // Recalculate streak
    const { data: allCompletions } = await supabase
      .from('completions')
      .select('completed_at')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false })

    const dates  = allCompletions.map(c => c.completed_at)
    const streak = calcCurrentStreak(dates)
    const longest = calcLongestStreak(dates)

    // Upsert streaks table
    await supabase
      .from('streaks')
      .upsert({
        habit_id:        habitId,
        current_streak:  streak,
        longest_streak:  longest,
        last_completed:  today,
      }, { onConflict: 'habit_id' })

    res.json({ success: true, streak, longest })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getHabitStreak = async (req, res) => {
  try {
    const habitId = req.params.id

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('habit_id', habitId)
      .single()

    if (error) return res.status(400).json({ success: false, error })

    res.json({ success: true, streak: data })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id

    const [{ data: habits }, { data: completions }] = await Promise.all([
      supabase.from('habits').select('id').eq('user_id', userId),
      supabase.from('completions').select('completed_at').eq('user_id', userId),
    ])

    const totalHabits      = habits.length
    const totalCompletions = completions.length
    const dates            = completions.map(c => c.completed_at)
    const currentStreak    = calcCurrentStreak(dates)
    const longestStreak    = calcLongestStreak(dates)
    const consistency      = totalHabits === 0 ? 0 : Math.round((totalCompletions / (totalHabits * 30)) * 100)

    res.json({
      success: true,
      analytics: { totalHabits, totalCompletions, currentStreak, longestStreak, consistency },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// --- helpers ---

function calcCurrentStreak(sortedDescDates) {
  if (!sortedDescDates.length) return 0
  const sorted = [...sortedDescDates].sort().reverse()
  let streak = 0
  let cursor = new Date().toISOString().split('T')[0]
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

function calcLongestStreak(dates) {
  if (!dates.length) return 0
  const sorted = [...dates].sort()
  let longest = 1, current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
    if (diff === 1)      { current++; if (current > longest) longest = current }
    else if (diff > 1)   { current = 1 }
  }
  return longest
}
