import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = ['🔥', '💪', '📚', '💧', '🧘', '🏃', '✍️', '🎯', '😴', '🥗', '🎵', '🧹']

const FREQUENCIES = [
  { id: 'daily',    label: 'Daily'    },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'custom',   label: 'Custom'   },
]

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function AddHabitSheet({ addHabit, onOpenBuilder }) {
  const [open,      setOpen]      = useState(false)
  const [tab,       setTab]       = useState('quick') // 'quick' | 'build'
  const [name,      setName]      = useState('')
  const [emoji,     setEmoji]     = useState('🔥')
  const [frequency, setFrequency] = useState('daily')
  const [days,      setDays]      = useState([0, 1, 2, 3, 4])

  const canSubmit = name.trim().length > 0

  const toggleDay = (i) =>
    setDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])

  const reset = () => {
    setName(''); setEmoji('🔥'); setFrequency('daily'); setDays([0, 1, 2, 3, 4]); setTab('quick')
  }

  const handleQuickAdd = () => {
    if (!canSubmit) return
    addHabit({ name: name.trim(), emoji, frequency, days })
    reset()
    setOpen(false)
  }

  const handleStartBuild = () => {
    if (!canSubmit) return
    const data = { name: name.trim(), emoji }
    reset()
    setOpen(false)
    onOpenBuilder(data)
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full bg-accent text-white text-3xl flex items-center justify-center shadow-[0_0_28px_rgba(219,173,40,0.5)] z-40"
      >
        +
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[28px] px-5 pt-5 pb-6 z-50"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-5" />

            {/* Mode tabs */}
            <div className="flex gap-2 mb-5 p-1 bg-surface2 rounded-[14px]">
              {[
                { id: 'quick', label: '⚡ Quick add'   },
                { id: 'build', label: '🌱 Build mode'  },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex-1 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                    tab === id
                      ? 'bg-accent text-bg shadow-sm'
                      : 'text-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Build mode explainer */}
            <AnimatePresence>
              {tab === 'build' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 px-3 py-3 rounded-2xl bg-teal/8 border border-teal/20">
                    <p className="text-teal text-xs leading-relaxed">
                      5-step Blueprint wizard → identity, cue, habit stack, minimum version, reward.
                      Your habit enters a 7-day trial then graduates automatically.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name input */}
            <input
              placeholder="Habit name…"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
              className="w-full bg-surface2 border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white placeholder-zinc-600 outline-none transition-colors text-base"
            />

            {/* Icon grid */}
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-5 mb-3">Icon</p>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(icon => (
                <motion.button
                  key={icon}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setEmoji(icon)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    emoji === icon
                      ? 'bg-accent/20 border-2 border-accent shadow-[0_0_12px_rgba(219,173,40,0.35)]'
                      : 'bg-surface2 border-2 border-transparent'
                  }`}
                >
                  {icon}
                </motion.button>
              ))}
            </div>

            {/* Frequency (Quick mode only) */}
            <AnimatePresence>
              {tab === 'quick' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-5 mb-3">Frequency</p>
                  <div className="flex gap-2">
                    {FREQUENCIES.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setFrequency(id)}
                        className={`flex-1 py-2.5 rounded-[14px] text-sm font-medium transition-all ${
                          frequency === id ? 'bg-accent text-white' : 'bg-surface2 text-zinc-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {frequency === 'custom' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-3">
                          {WEEKDAYS.map((d, i) => (
                            <button
                              key={i}
                              onClick={() => toggleDay(i)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                                days.includes(i)
                                  ? 'bg-teal/20 text-teal border border-teal/50'
                                  : 'bg-surface2 text-zinc-600 border border-transparent'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.button
              whileTap={{ scale: canSubmit ? 0.96 : 1 }}
              onClick={tab === 'quick' ? handleQuickAdd : handleStartBuild}
              disabled={!canSubmit}
              className={`w-full mt-6 mb-3 py-4 rounded-[20px] font-heading text-lg transition-all duration-200 ${
                canSubmit
                  ? 'bg-accent text-white shadow-[0_0_24px_rgba(219,173,40,0.35)]'
                  : 'bg-surface2 text-zinc-600 opacity-40 cursor-not-allowed'
              }`}
            >
              {tab === 'quick' ? 'Create Habit' : "Let's begin building →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
