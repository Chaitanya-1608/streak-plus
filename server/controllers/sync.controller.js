const supabase = require('../config/supabase')

// POST /api/sync  — push local state to cloud (upsert, never delete)
exports.push = async (req, res) => {
  const userId = req.user.id
  const { habits = [], completions = {} } = req.body

  if (habits.length > 0) {
    const rows = habits.map(h => ({
      id:                 Number(h.id),
      user_id:            userId,
      name:               h.name,
      emoji:              h.emoji || '🔥',
      created_at:         h.createdAt || h.created_at || '',
      mode:               h.mode               || 'maintaining',
      build_stage:        h.buildStage          || 0,
      identity_statement: h.identityStatement   || null,
      cue:                h.cue                 || null,
      habit_stack:        h.habitStack          || null,
      minimum_version:    h.minimumVersion      || null,
      reward:             h.reward              || null,
      graduated_at:       h.graduatedAt         || null,
      grace_used_at:      h.graceUsedAt         || null,
    }))
    const { error } = await supabase.from('habits').upsert(rows, { onConflict: 'user_id,id' })
    if (error) console.error('[sync push] habits:', error.message)
  }

  const compRows = []
  for (const [habitId, dates] of Object.entries(completions)) {
    for (const date of dates) {
      compRows.push({ user_id: userId, habit_id: Number(habitId), completed_on: date })
    }
  }
  if (compRows.length > 0) {
    const { error } = await supabase
      .from('completions')
      .upsert(compRows, { onConflict: 'user_id,habit_id,completed_on' })
    if (error) console.error('[sync push] completions:', error.message)
  }

  res.json({ ok: true })
}

// GET /api/sync  — pull cloud state for this user
exports.pull = async (req, res) => {
  const userId = req.user.id

  const [{ data: habits, error: he }, { data: comps, error: ce }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('completions').select('*').eq('user_id', userId),
  ])

  if (he || ce) {
    return res.status(500).json({ ok: false, message: (he || ce).message })
  }

  const completions = {}
  for (const c of comps) {
    const key = String(c.habit_id)
    if (!completions[key]) completions[key] = []
    completions[key].push(c.completed_on)
  }

  res.json({ ok: true, habits, completions })
}
