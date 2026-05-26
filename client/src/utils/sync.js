const API = 'https://streak-plus-api.onrender.com/api'

function getToken() {
  try { return JSON.parse(localStorage.getItem('streak-auth'))?.token || null }
  catch { return null }
}

// Fire-and-forget — called after every local write
export function pushToCloud(habits, completions) {
  const token = getToken()
  if (!token || !navigator.onLine) return
  fetch(`${API}/sync`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify({ habits, completions }),
  }).catch(() => {})
}

// Called on login / coming online — returns merged cloud data or null
export async function pullFromCloud() {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API}/sync`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return null
    return await res.json()   // { ok, habits, completions }
  } catch {
    return null
  }
}
