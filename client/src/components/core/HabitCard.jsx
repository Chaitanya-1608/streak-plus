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

  const streak  = getCurrentStreak(habit.id)
  const done    = isCompletedToday(habit.id)
  const [burst, setBurst] = useState(false)

  const isBuilding = habit.mode === 'building'
  const trialDay   = Math.min(streak, 7)
  const trialPct   = trialDay / 7

  const handleComplete = () => {
    if (done) return
    completeHabit(habit.id)
    if (navigator.vibrate) navigator.vibrate(40)
    setBurst(true)
    setTimeout(() => setBurst(false), 480)
  }

  const detailText = isBuilding
    ? done ? `Day ${trialDay} of 7 · Done ✓` : `Day ${trialDay} of 7 · Building`
    : done ? `${habit.frequency || 'Daily'} · Done ✓` : habit.frequency || 'Daily'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] bg-surface border border-surface2 mb-2.5 overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <button
          onClick={() => openHabit(habit)}
          className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
            done ? 'bg-accent/20' : isBuilding ? 'bg-teal/10' : 'bg-surface2'
          }`}
        >
          {habit.emoji || '🔥'}
        </button>

        {/* Name + detail */}
        <button onClick={() => openHabit(habit)} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-white text-[15px] font-medium leading-tight truncate">{habit.name}</p>
            {isBuilding && (
              <span className="text-[9px] text-teal border border-teal/30 rounded-full px-1.5 py-0.5 flex-shrink-0">
                BUILDING
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 ${done ? 'text-accent/60' : isBuilding ? 'text-teal/60' : 'text-zinc-600'}`}>
            {detailText}
          </p>
        </button>

        {/* Streak or trial day */}
        {streak > 0 && (
          <div className="text-right flex-shrink-0 mr-1">
            <p className={`font-heading text-lg leading-none ${isBuilding ? 'text-teal' : 'text-accent'}`}>
              {streak}
            </p>
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
                ? isBuilding ? 'bg-teal text-bg' : 'bg-accent text-bg'
                : 'border-2 border-zinc-700 text-transparent'
            }`}
          >
            {done ? '✓' : ''}
          </motion.button>
        </div>
      </div>

      {/* 7-day trial progress bar */}
      {isBuilding && (
        <div className="px-4 pb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest">7-day trial</span>
            <span className="text-[9px] text-teal">
              {trialDay === 7 ? 'Graduating soon! 🎓' : `${trialDay} / 7 days`}
            </span>
          </div>
          <div className="h-1 bg-surface2 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: trialDay === 7 ? '#DBAD28' : '#9CBD44' }}
              initial={{ width: 0 }}
              animate={{ width: `${trialPct * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
