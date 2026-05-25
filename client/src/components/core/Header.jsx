const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getDateLabel() {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

function getUserName() {
  try {
    const auth = JSON.parse(localStorage.getItem('streak-auth') || '{}')
    return auth.firstName || 'You'
  } catch {
    return 'You'
  }
}

export default function Header() {
  const name = getUserName()
  const date = getDateLabel()

  return (
    <div className="pt-10 flex items-center justify-between">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">
          streak<span className="text-accent">+</span>
        </h1>
        <p className="text-zinc-500 mt-0.5 text-sm">
          {name} · {date}
        </p>
      </div>

      <div className="w-11 h-11 rounded-2xl bg-surface2 border border-surface2 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(219,173,40,0.12)]">
        🔥
      </div>
    </div>
  )
}
