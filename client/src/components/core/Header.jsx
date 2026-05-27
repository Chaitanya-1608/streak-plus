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

// ── Our Intention modal ───────────────────────────────────────────────────────
function IntentionModal({ onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface rounded-t-[28px] px-6 pt-6 pb-10 z-50"
      >
        <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-6" />

        <div className="text-3xl mb-4">🔥</div>
        <h2 className="font-heading text-[22px] text-white mb-4">Our intention</h2>

        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          We built Streak+ because we believe small daily actions compound into identity over time.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          Not productivity. Not hustle culture. Just one habit, protected, every single day.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Every check-in is a vote for who you're becoming. That's it. We stay out of your way.
        </p>

        <div className="px-4 py-3 rounded-2xl bg-surface2 border border-accent/10 mb-6">
          <p className="text-zinc-500 text-xs italic leading-relaxed">
            "Every action is a vote for the type of person you want to become."
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-[18px] bg-surface2 text-zinc-400 font-heading text-sm"
        >
          Close
        </button>
      </motion.div>
    </>
  )
}

// ── Feedback modal ────────────────────────────────────────────────────────────
const CATEGORIES = ['🐛 Bug', '✨ Feature', '💬 Feedback']

function FeedbackModal({ onClose }) {
  const [category, setCategory] = useState('💬 Feedback')
  const [stars,    setStars]    = useState(0)
  const [message,  setMessage]  = useState('')
  const [done,     setDone]     = useState(false)

  const canSubmit = stars > 0 && message.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const auth = (() => { try { return JSON.parse(localStorage.getItem('streak-auth') || '{}') } catch { return {} } })()
    const entry = {
      category,
      stars,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      user: auth.email || 'unknown',
    }
    const history = JSON.parse(localStorage.getItem('streak-feedback-history') || '[]')
    history.push(entry)
    localStorage.setItem('streak-feedback-history', JSON.stringify(history))

    // Fire-and-forget to admin email
    fetch('https://streak-plus-api.onrender.com/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify({ category, stars, message: message.trim(), userEmail: auth.email }),
    }).catch(() => {})

    setDone(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface rounded-t-[28px] px-6 pt-6 pb-10 z-50"
      >
        <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-6" />

        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🙏</div>
            <h2 className="font-heading text-[22px] text-white mb-2">Thank you.</h2>
            <p className="text-zinc-500 text-sm mb-8">Your feedback helps us build better.</p>
            <button onClick={onClose} className="text-accent text-sm font-medium">Close</button>
          </div>
        ) : (
          <>
            <h2 className="font-heading text-[20px] text-white mb-5">Help us improve</h2>

            {/* Category */}
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Category</p>
            <div className="flex gap-2 mb-5">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex-1 py-2 rounded-[12px] text-xs font-medium transition-all ${
                    category === c ? 'bg-accent text-bg' : 'bg-surface2 text-zinc-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Stars */}
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Rating</p>
            <div className="flex gap-2 mb-5">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setStars(s)}
                  className={`flex-1 py-2 rounded-[12px] text-lg transition-all ${
                    stars >= s ? 'text-accent' : 'text-zinc-700'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Message */}
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Your thoughts</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us what's on your mind…"
              rows={4}
              style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff', resize: 'none' }}
              className="w-full bg-surface2 border border-surface2 focus:border-accent/40 rounded-2xl px-4 py-3 text-white placeholder-zinc-700 outline-none text-sm leading-relaxed mb-5"
            />

            <motion.button
              whileTap={{ scale: canSubmit ? 0.96 : 1 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-[18px] font-heading text-base transition-all ${
                canSubmit ? 'bg-accent text-bg' : 'bg-surface2 text-zinc-700 cursor-not-allowed'
              }`}
            >
              Submit feedback
            </motion.button>
          </>
        )}
      </motion.div>
    </>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header() {
  const name     = getUserName()
  const greeting = getGreeting()
  const initials = getInitials(name)
  const [menu,  setMenu]  = useState(false)
  const [modal, setModal] = useState(null) // 'intention' | 'feedback'

  const closeMenu = () => setMenu(false)

  const menuItems = [
    {
      icon: '💡', label: 'Our intention',
      action: () => { closeMenu(); setModal('intention') },
    },
    {
      icon: '💬', label: 'Help us improve',
      action: () => { closeMenu(); setModal('feedback') },
    },
    {
      icon: '📸', label: 'Follow us',
      action: () => { closeMenu(); window.open('https://www.instagram.com/buildhabitswithcp', '_blank', 'noopener') },
      sub: '@buildhabitswithcp',
    },
    {
      icon: '🔗', label: 'Share Streak+',
      action: () => {
        closeMenu()
        const data = { title: 'Streak+', text: 'Build habits. Protect your momentum.', url: 'https://streak-plus.vercel.app/' }
        if (navigator.share) {
          navigator.share(data).catch(() => {})
        } else {
          navigator.clipboard.writeText('https://streak-plus.vercel.app/').catch(() => {})
        }
      },
    },
    {
      icon: '↪', label: 'Sign out',
      action: () => { closeMenu(); handleLogout() },
      danger: true,
    },
  ]

  return (
    <>
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
                <div className="fixed inset-0 z-40" onClick={closeMenu} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-12 z-50 bg-surface border border-surface2 rounded-[16px] shadow-xl overflow-hidden min-w-[190px]"
                >
                  {menuItems.map(({ icon, label, sub, action, danger }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-surface2 transition-colors text-left border-b border-surface2/50 last:border-0 ${
                        danger ? 'text-zinc-500' : 'text-zinc-300'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span className="flex-1">
                        {label}
                        {sub && <span className="block text-[10px] text-zinc-600 mt-0.5">{sub}</span>}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'intention' && <IntentionModal onClose={() => setModal(null)} />}
        {modal === 'feedback'  && <FeedbackModal  onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  )
}
