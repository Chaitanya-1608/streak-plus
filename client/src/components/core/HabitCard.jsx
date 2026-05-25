import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../../store/useHabitStore'

const PARTICLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  angle: (i / 6) * 360,
  color: ['#DBAD28', '#EAC775', '#9CBD44'][i % 3],
}))

export default function HabitCard({ habit, openHabit }) {
  const { completeHabit, getCurrentStreak, isCompletedToday } = useHabitStore()

  const streak = getCurrentStreak(habit.id)
  const done   = isCompletedToday(habit.id)
  const [burst, setBurst] = useState(false)

  const handleComplete = () => {
    if (done) return
    completeHabit(habit.id)
    if (navigator.vibrate) navigator.vibrate(40)
    setBurst(true)
    setTimeout(() => setBurst(false), 480)
  }

  const detailText = done
    ? `${habit.frequency || 'Daily'} · Done ✓`
    : habit.frequency || 'Daily'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] bg-surface border border-surface2 mb-2.5"
    >
      {/* Icon */}
      <button
        onClick={() => openHabit(habit)}
        className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
          done ? 'bg-accent/20' : 'bg-surface2'
        }`}
      >
        {habit.emoji || '🔥'}
      </button>

      {/* Name + detail */}
      <button onClick={() => openHabit(habit)} className="flex-1 min-w-0 text-left">
        <p className="text-white text-[15px] font-medium leading-tight truncate">{habit.name}</p>
        <p className={`text-xs mt-0.5 ${done ? 'text-accent/60' : 'text-zinc-600'}`}>{detailText}</p>
      </button>

      {/* Streak number */}
      {streak > 0 && (
        <div className="text-right flex-shrink-0 mr-1">
          <p className="font-heading text-lg text-accent leading-none">{streak}</p>
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider mt-0.5">streak</p>
        </div>
      )}

      {/* Complete button */}
      <div className="relative flex-shrink-0">
        <AnimatePresence>
          {burst && PARTICLES.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * 24,
                y: Math.sin((p.angle * Math.PI) / 180) * 24,
                opacity: 0, scale: 0.2,
              }}
              transition={{ duration: 0.42, ease: 'easeOut' }}
              className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full pointer-events-none z-20"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: done ? 1 : 0.85 }}
          onClick={handleComplete}
          aria-label="Complete habit"
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10 ${
            done
              ? 'bg-accent text-bg'
              : 'border-2 border-zinc-700 text-transparent'
          }`}
        >
          {done ? '✓' : ''}
        </motion.button>
      </div>
    </motion.div>
  )
}
