const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getUserName() {
  try {
    const auth = JSON.parse(localStorage.getItem('streak-auth') || '{}')
    return auth.firstName || 'You'
  } catch {
    return 'You'
  }
}

function getInitials(name) {
  return (name || 'ME').slice(0, 2).toUpperCase()
}

export default function Header() {
  const name     = getUserName()
  const greeting = getGreeting()
  const initials = getInitials(name)

  return (
    <div className="pt-10 flex items-center justify-between">
      <div>
        <p className="text-zinc-500 text-[11px] uppercase tracking-widest">{greeting}</p>
        <h1 className="font-heading text-2xl text-white mt-0.5">
          {name} <span className="text-accent text-lg">✦</span>
        </h1>
      </div>

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-accent flex items-center justify-center text-[11px] font-bold text-bg tracking-wide">
        {initials}
      </div>
    </div>
  )
}
