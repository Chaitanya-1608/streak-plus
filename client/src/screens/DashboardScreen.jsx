import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/core/Header'
import SummaryBar from '../components/core/SummaryBar'
import HabitList from '../components/core/HabitList'
import AddHabitSheet from '../components/bottomsheet/AddHabitSheet'
import useHabitStore from '../store/useHabitStore'

const TODAY_ISO = new Date().toISOString().split('T')[0]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Circumference of SVG ring (r=52): 2 * PI * 52 ≈ 326.7
const CIRC = 2 * Math.PI * 52

function StreakRing({ streak }) {
  const fraction  = Math.min(streak / 365, 1)
  const offset    = CIRC * (1 - fraction)
  const ringRef   = useRef(null)

  useEffect(() => {
    if (!ringRef.current) return
    ringRef.current.style.setProperty('--ring-offset', String(offset))
    ringRef.current.style.strokeDashoffset = CIRC  // start full-empty
    requestAnimationFrame(() => {
      if (!ringRef.current) return
      ringRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)'
      ringRef.current.style.strokeDashoffset = offset
    })
  }, [offset])

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="60" cy="60" r="52" fill="none" stroke="#1c1508" strokeWidth="10" />
        {/* Fill */}
        <circle
          ref={ringRef}
          cx="60" cy="60" r="52"
          fill="none"
          stroke="#DBAD28"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl leading-none">🔥</span>
        <span className="font-heading text-lg text-white leading-tight mt-0.5">{streak}</span>
        <span className="text-[9px] text-zinc-500 leading-none">days</span>
      </div>
    </div>
  )
}

function WeekStrip({ weekSummary }) {
  return (
    <div className="flex gap-2 mt-5">
      {weekSummary.map(({ date, completedCount, totalHabits }, i) => {
        const isToday = date === TODAY_ISO
        const pct     = totalHabits === 0 ? 0 : completedCount / totalHabits
        const dotColor =
          pct === 0   ? 'bg-surface2'
          : pct < 0.5 ? 'bg-teal/30'
          : pct < 1   ? 'bg-teal/70'
          :              'bg-teal'

        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-zinc-500">{DAY_LABELS[i]}</span>
            <div className={`w-7 h-7 rounded-full transition-all duration-300 ${dotColor} ${
              isToday ? 'ring-2 ring-gold ring-offset-1 ring-offset-bg' : ''
            }`} />
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardScreen({ openHabit, openMilestone }) {
  const {
    habits,
    addHabit,
    getTodayCount,
    getTopStreak,
    getWeekSummary,
  } = useHabitStore()

  const todayCount  = getTodayCount()
  const topStreak   = getTopStreak()
  const weekSummary = getWeekSummary()
  const total       = habits.length
  const todayPct    = total === 0 ? 0 : todayCount / total

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-md mx-auto px-5 pb-36 pt-safe">
        <Header />

        {/* Hero card — streak ring + progress + week strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 bg-surface rounded-[28px] p-5 border border-surface2"
        >
          <div className="flex items-center gap-5">
            <StreakRing streak={topStreak} />

            <div className="flex-1 min-w-0">
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Top streak</p>
              <h2 className="font-heading text-4xl text-white mt-0.5">{topStreak} <span className="text-xl text-zinc-400">days</span></h2>

              {/* Today's progress */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-400">Today</span>
                  <span className="text-xs text-teal font-medium">{todayCount}/{total}</span>
                </div>
                <div className="h-2 rounded-full bg-surface2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayPct * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-teal"
                  />
                </div>
              </div>
            </div>
          </div>

          <WeekStrip weekSummary={weekSummary} />
        </motion.div>

        <SummaryBar />

        <HabitList habits={habits} openHabit={openHabit} />
      </div>

      <AddHabitSheet addHabit={addHabit} />
    </div>
  )
}
