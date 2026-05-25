import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../../store/useHabitStore'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const DOT_CLS = {
  done:   'bg-accent shadow-[0_0_10px_rgba(219,173,40,0.6)] scale-100',
  missed: 'bg-red-900/50 scale-90',
  future: 'bg-surface2 scale-90',
}

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i / 8) * 360,
  color: ['#DBAD28', '#EAC775', '#9CBD44'][i % 3],
}))

export default function HabitCard({ habit, openHabit }) {
  const { completeHabit, getWeekDots, getCurrentStreak, isCompletedToday } = useHabitStore()

  const dots   = getWeekDots(habit.id)
  const streak = getCurrentStreak(habit.id)
  const done   = isCompletedToday(habit.id)

  const [burst,       setBurst]       = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimer                  = useRef(null)

  const handleComplete = () => {
    if (done) return
    completeHabit(habit.id)
    if (navigator.vibrate) navigator.vibrate(50)
    setBurst(true)
    setTimeout(() => setBurst(false), 600)
  }

  const handleStreakPress = () => {
    setShowTooltip(true)
    clearTimeout(tooltipTimer.current)
    tooltipTimer.current = setTimeout(() => setShowTooltip(false), 2200)
  }

  const tooltipMsg = streak === 0
    ? 'Start your streak today!'
    : streak < 7  ? `${streak}-day streak — keep going!`
    : streak < 30 ? `${streak} days strong 🔥`
    :               `${streak} days — you're unstoppable 🏆`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[28px] border p-5 transition-colors duration-300 ${
        done ? 'bg-gradient-to-br from-accent/10 to-surface border-accent/30' : 'bg-surface border-surface2'
      }`}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Top row */}
      <div className="flex items-center justify-between relative z-10">
        <button onClick={() => openHabit(habit)} className="flex items-center gap-4 text-left flex-1 min-w-0">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
            done ? 'bg-gradient-to-br from-gold to-accent shadow-[0_0_24px_rgba(219,173,40,0.5)]' : 'bg-surface2'
          }`}>
            {habit.emoji || '🔥'}
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-heading text-lg leading-tight truncate">{habit.name}</h2>

            {/* Streak label + tooltip */}
            <div className="relative inline-block mt-0.5">
              <button onPointerDown={handleStreakPress} className="text-sm font-medium">
                {done
                  ? <span className="text-accent">Momentum protected 🔥</span>
                  : <span className="text-zinc-400">{streak > 0 ? `${streak}-day streak` : 'Start today'}</span>
                }
              </button>

              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.16 }}
                    className="absolute bottom-7 left-0 whitespace-nowrap z-50 px-3 py-2 rounded-xl bg-surface2 border border-white/5 text-xs text-white shadow-xl"
                  >
                    {tooltipMsg}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-surface2 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </button>

        {/* Complete button */}
        <div className="relative flex-shrink-0">
          <AnimatePresence>
            {burst && PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((p.angle * Math.PI) / 180) * 34,
                  y: Math.sin((p.angle * Math.PI) / 180) * 34,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 0.52, ease: 'easeOut' }}
                className="absolute top-3 left-3 w-3 h-3 rounded-full pointer-events-none z-20"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: done ? 1 : 0.88 }}
            animate={burst ? { scale: [1, 1.38, 1] } : {}}
            transition={{ duration: 0.35 }}
            onClick={handleComplete}
            aria-label="Complete habit"
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 relative z-10 ${
              done
                ? 'bg-gradient-to-br from-gold to-accent text-bg shadow-[0_0_24px_rgba(219,173,40,0.5)]'
                : 'border-2 border-accent/60 text-accent'
            }`}
          >
            ✓
          </motion.button>
        </div>
      </div>

      {/* Week dots */}
      <div className="flex justify-between mt-5 gap-1 relative z-10">
        {dots.map(({ date, state }, i) => (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-zinc-600 font-medium">{DAY_LABELS[i]}</span>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
              className={`w-7 h-7 rounded-full transition-all duration-300 ${DOT_CLS[state]}`}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
