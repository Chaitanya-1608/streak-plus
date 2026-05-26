const supabase = require('../config/supabase')

function checkSecret(req, res) {
  const secret = req.headers['x-admin-secret'] || req.query.secret
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

// Compute current streak from an array of ISO date strings
function computeStreak(dates) {
  if (!dates.length) return 0
  const unique = [...new Set(dates)].sort().reverse()
  const today  = new Date().toISOString().split('T')[0]
  let streak = 0, cursor = today
  for (const d of unique) {
    if (d === cursor) {
      streak++
      const prev = new Date(cursor + 'T12:00:00')
      prev.setDate(prev.getDate() - 1)
      cursor = prev.toISOString().split('T')[0]
    } else if (d < cursor) break
  }
  return streak
}

exports.stats = async (req, res) => {
  if (!checkSecret(req, res)) return

  const today   = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [
    { count: totalUsers },
    { count: newThisWeek },
    { data: todayComps },
    { count: totalHabits },
    { count: totalCompletions },
    { data: allCompletions },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
    supabase.from('completions').select('user_id').eq('completed_on', today),
    supabase.from('habits').select('*', { count: 'exact', head: true }),
    supabase.from('completions').select('*', { count: 'exact', head: true }),
    supabase.from('completions').select('user_id, habit_id, completed_on'),
  ])

  // Active users today
  const activeToday = new Set((todayComps || []).map(c => c.user_id)).size

  // Compute max streak per user across all their habits
  const habitDates = {}
  for (const { user_id, habit_id, completed_on } of (allCompletions || [])) {
    const key = `${user_id}::${habit_id}`
    if (!habitDates[key]) habitDates[key] = { user_id, dates: [] }
    habitDates[key].dates.push(completed_on)
  }

  const userMaxStreak = {}
  for (const { user_id, dates } of Object.values(habitDates)) {
    const s = computeStreak(dates)
    userMaxStreak[user_id] = Math.max(userMaxStreak[user_id] || 0, s)
  }

  const streakVals     = Object.values(userMaxStreak)
  const avgStreak      = streakVals.length ? Math.round(streakVals.reduce((a, b) => a + b, 0) / streakVals.length) : 0
  const longestStreak  = streakVals.length ? Math.max(...streakVals) : 0
  const usersStreak7   = streakVals.filter(s => s >= 7).length

  res.json({
    totalUsers:      totalUsers   || 0,
    newThisWeek:     newThisWeek  || 0,
    activeToday,
    totalHabits:     totalHabits  || 0,
    totalCompletions: totalCompletions || 0,
    avgStreak,
    longestStreak,
    usersStreak7,
    updatedAt: new Date().toISOString(),
  })
}

exports.dashboard = (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Streak+ Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #070500;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      padding: 24px 16px 48px;
    }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 720px;
      margin: 0 auto 32px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #EAC775, #DBAD28);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 700;
      color: #DBAD28;
      letter-spacing: -0.3px;
    }

    .updated {
      font-size: 11px;
      color: #3f3f46;
    }

    /* ── Auth gate ── */
    #gate {
      max-width: 340px;
      margin: 80px auto 0;
      text-align: center;
    }

    #gate h2 { font-size: 22px; margin-bottom: 8px; }
    #gate p  { color: #52525b; font-size: 13px; margin-bottom: 24px; }

    #gate input {
      width: 100%;
      background: #100c05;
      border: 1px solid #1c1508;
      border-radius: 14px;
      padding: 14px 16px;
      color: #fff;
      font-size: 15px;
      outline: none;
      margin-bottom: 12px;
      transition: border-color 0.15s;
    }

    #gate input:focus { border-color: #DBAD28; }

    #gate button {
      width: 100%;
      padding: 14px;
      background: #DBAD28;
      color: #1a0f00;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }

    #gate .err {
      font-size: 12px;
      color: #f87171;
      margin-top: 8px;
      display: none;
    }

    /* ── Dashboard ── */
    #dash { max-width: 720px; margin: 0 auto; display: none; }

    .section-label {
      font-size: 10px;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }

    .card {
      background: #100c05;
      border: 1px solid #1c1508;
      border-radius: 18px;
      padding: 20px;
    }

    .card .value {
      font-size: 36px;
      font-weight: 800;
      color: #DBAD28;
      line-height: 1;
      margin-bottom: 6px;
    }

    .card .label {
      font-size: 12px;
      color: #71717a;
    }

    .card .sub {
      font-size: 11px;
      color: #3f3f46;
      margin-top: 4px;
    }

    .highlight .value { color: #9CBD44; }

    .refresh-btn {
      background: #1c1508;
      border: 1px solid #27190a;
      color: #71717a;
      border-radius: 10px;
      padding: 6px 14px;
      font-size: 12px;
      cursor: pointer;
      transition: color 0.15s;
    }

    .refresh-btn:hover { color: #DBAD28; }
  </style>
</head>
<body>

<!-- Auth gate -->
<div id="gate">
  <div style="font-size:40px;margin-bottom:16px;">🔥</div>
  <h2>Streak+ Admin</h2>
  <p>Enter your admin secret to continue.</p>
  <input id="secret-input" type="password" placeholder="Admin secret" />
  <button onclick="login()">Access dashboard</button>
  <p class="err" id="err-msg">Wrong secret. Try again.</p>
</div>

<!-- Dashboard -->
<div id="dash">
  <header>
    <div class="brand">
      <div class="brand-icon">🔥</div>
      <span class="brand-name">Streak+ Admin</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="updated" id="updated-at">–</span>
      <button class="refresh-btn" onclick="load()">↻ Refresh</button>
    </div>
  </header>

  <p class="section-label">Users</p>
  <div class="grid">
    <div class="card">
      <div class="value" id="totalUsers">–</div>
      <div class="label">Total users</div>
    </div>
    <div class="card">
      <div class="value" id="newThisWeek">–</div>
      <div class="label">New this week</div>
    </div>
    <div class="card">
      <div class="value" id="activeToday">–</div>
      <div class="label">Active today</div>
      <div class="sub">Completed ≥ 1 habit</div>
    </div>
  </div>

  <p class="section-label">Streaks</p>
  <div class="grid">
    <div class="card highlight">
      <div class="value" id="longestStreak">–</div>
      <div class="label">Longest active streak</div>
      <div class="sub">days by any user</div>
    </div>
    <div class="card">
      <div class="value" id="avgStreak">–</div>
      <div class="label">Avg streak</div>
      <div class="sub">across all users</div>
    </div>
    <div class="card">
      <div class="value" id="usersStreak7">–</div>
      <div class="label">Users with 7+ day streak</div>
    </div>
  </div>
</div>

<script>
  const API = '/api/admin/stats'
  let secret = sessionStorage.getItem('admin-secret') || ''

  function fmt(n) { return n == null ? '–' : String(n) }

  function set(id, val) {
    const el = document.getElementById(id)
    if (el) el.textContent = fmt(val)
  }

  async function load() {
    try {
      const res  = await fetch(API + '?secret=' + encodeURIComponent(secret))
      if (res.status === 401) { logout(); return }
      const data = await res.json()

      set('totalUsers',    data.totalUsers)
      set('newThisWeek',   data.newThisWeek)
      set('activeToday',   data.activeToday)
      set('longestStreak', data.longestStreak)
      set('avgStreak',     data.avgStreak)
      set('usersStreak7',  data.usersStreak7)

      const d = new Date(data.updatedAt)
      document.getElementById('updated-at').textContent =
        'Updated ' + d.toLocaleTimeString()
    } catch (e) {
      document.getElementById('updated-at').textContent = 'Error loading'
    }
  }

  async function login() {
    secret = document.getElementById('secret-input').value.trim()
    const res = await fetch(API + '?secret=' + encodeURIComponent(secret))
    if (res.status === 401) {
      document.getElementById('err-msg').style.display = 'block'
      return
    }
    sessionStorage.setItem('admin-secret', secret)
    document.getElementById('gate').style.display = 'none'
    document.getElementById('dash').style.display = 'block'
    const data = await res.json()
    renderData(data)
    setInterval(load, 30000)
  }

  function renderData(data) {
    set('totalUsers',    data.totalUsers)
    set('newThisWeek',   data.newThisWeek)
    set('activeToday',   data.activeToday)
    set('longestStreak', data.longestStreak)
    set('avgStreak',     data.avgStreak)
    set('usersStreak7',  data.usersStreak7)
    const d = new Date(data.updatedAt)
    document.getElementById('updated-at').textContent =
      'Updated ' + d.toLocaleTimeString()
  }

  function logout() {
    sessionStorage.removeItem('admin-secret')
    secret = ''
    document.getElementById('gate').style.display = 'block'
    document.getElementById('dash').style.display = 'none'
  }

  // Auto-login if secret already in session
  if (secret) {
    fetch(API + '?secret=' + encodeURIComponent(secret)).then(r => {
      if (r.status === 401) { logout(); return }
      r.json().then(data => {
        document.getElementById('gate').style.display = 'none'
        document.getElementById('dash').style.display = 'block'
        renderData(data)
        setInterval(load, 30000)
      })
    })
  }

  document.getElementById('secret-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') login()
  })
</script>
</body>
</html>`)
}
