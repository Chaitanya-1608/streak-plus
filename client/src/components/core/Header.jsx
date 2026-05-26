import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

function handleLogout() {
  localStorage.removeItem('streak-auth')
  window.location.reload()
}

export default function Header() {
  const name     = getUserName()
  const greeting = getGreeting()
  const initials = getInitials(name)
  const [menu, setMenu] = useState(false)

  return (
    <div className="pt-10 flex items-center justify-between relative">
      <div>
        <p className="text-zinc-500 text-[11px] uppercase tracking-widest">{greeting}</p>
        <h1 className="font-heading text-2xl text-white mt-0.5">
          {name} <span className="text-accent text-lg">✦</span>
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenu(v => !v)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-accent flex items-center justify-center text-[11px] font-bold text-bg tracking-wide"
        >
          {initials}
        </button>

        <AnimatePresence>
          {menu && (
            <>
              {/* Dismiss overlay */}
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.14 }}
                className="absolute right-0 top-12 z-50 bg-surface border border-surface2 rounded-[14px] shadow-xl overflow-hidden min-w-[130px]"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-300 hover:bg-surface2 transition-colors text-left"
                >
                  <span className="text-base">↪</span> Sign out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
