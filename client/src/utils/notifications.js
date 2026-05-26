// Schedule local nudge notifications at 9 AM and 8 PM
// Works when PWA is running; no server needed.

const NUDGE_TIMES = [
  { hour: 9,  minute: 0 },
  { hour: 20, minute: 0 },
]

const INIT_KEY = 'streak-notif-init'

function getIncompleteNames() {
  try {
    const email = JSON.parse(localStorage.getItem('streak-auth') || '{}').email || ''
    const key   = email ? `streak-habits-v2-${email.toLowerCase()}` : 'streak-habits-v2'
    const raw   = JSON.parse(localStorage.getItem(key) || '{}')
    const today = new Date().toISOString().split('T')[0]
    return (raw.habits || [])
      .filter(h => !(raw.completions?.[h.id] || []).includes(today))
      .map(h => h.name)
  } catch {
    return []
  }
}

function msUntil(hour, minute) {
  const now  = new Date()
  const next = new Date(now)
  next.setHours(hour, minute, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next - now
}

function fire(hour, minute) {
  const names = getIncompleteNames()
  if (names.length > 0 && Notification.permission === 'granted') {
    new Notification('Streak+', {
      body: `Still to do today: ${names.join(' · ')}`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag:  'streak-nudge',
      silent: false,
    })
  }
  // Reschedule for same slot tomorrow
  setTimeout(() => fire(hour, minute), msUntil(hour, minute))
}

export function scheduleNudges() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  NUDGE_TIMES.forEach(({ hour, minute }) => {
    setTimeout(() => fire(hour, minute), msUntil(hour, minute))
  })
}

export async function requestAndSchedule() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') {
    scheduleNudges()
    return true
  }
  const result = await Notification.requestPermission()
  if (result === 'granted') {
    scheduleNudges()
    localStorage.setItem(INIT_KEY, '1')
    return true
  }
  return false
}

export function isNotifEnabled() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted'
}
