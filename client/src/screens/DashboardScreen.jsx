import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/core/Header'
import HabitList from '../components/core/HabitList'
import AddHabitSheet from '../components/bottomsheet/AddHabitSheet'
import useHabitStore, { localISO } from '../store/useHabitStore'
import { requestAndSchedule, isNotifEnabled } from '../utils/notifications'

const TODAY_ISO  = localISO()   // local calendar date — avoids UTC day-offset bug
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const CIRC       = 2 * Math.PI * 44   // r=44 in 100×100 viewBox

const MILESTONE_NAMES = {
  7: 'Sprout', 14: 'Builder', 21: 'Habit',
  30: 'Warrior', 60: 'Champion', 100: 'Legend', 200: 'Master', 365: 'Obsidian',
}

function nextMilestone(streak) {
  return [7, 14, 21, 30, 60, 100, 200, 365].find(m => m > streak) || null
}

// ── Streak ring ─────────────────────────────────────────────────────────────
function StreakRing({ streak }) {
  const next     = nextMilestone(streak) || Math.max(streak, 1)
  const fraction = Math.min(streak / next, 1)
  const offset   = CIRC * (1 - fraction)
  const ringRef  = useRef(null)

  useEffect(() => {
    if (!ringRef.current) return
    ringRef.current.style.strokeDashoffset = CIRC
    requestAnimationFrame(() => {
      if (!ringRef.current) return
      ringRef.current.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)'
      ringRef.current.style.strokeDashoffset = offset
    })
  }, [offset])

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#1c1508" strokeWidth="8" />
        <circle
          ref={ringRef}
          cx="50" cy="50" r="44"
          fill="none" stroke="#DBAD28" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[26px] text-white leading-none">{streak}</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">days</span>
      </div>
    </div>
  )
}

// ── Hero copy + pills ───────────────────────────────────────────────────────
function HeroCopy({ streak, personalBest }) {
  const next        = nextMilestone(streak)
  const daysToNext  = next ? next - streak : null
  const isPersonalBest = streak > 0 && streak >= personalBest

  let headline, subline
  if (streak === 0) {
    headline = 'Start your streak 🌱'
    subline  = 'Complete a habit today to begin.'
  } else if (streak < 7) {
    headline = 'Building momentum 💪'
    subline  = daysToNext ? `${daysToNext} more days to your first badge.` : 'Keep showing up!'
  } else if (isPersonalBest) {
    headline = 'Your longest ever! 🔥'
    subline  = daysToNext
      ? `You're on fire. ${daysToNext} more days to unlock the ${MILESTONE_NAMES[next]} badge.`
      : 'You set a new personal record!'
  } else {
    headline = `${streak}-day streak 🔥`
    subline  = daysToNext ? `${daysToNext} more days to the ${MILESTONE_NAMES[next]} badge.` : 'Incredible dedication!'
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="font-heading text-[15px] text-white leading-snug">{headline}</p>
      <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{subline}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {streak > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20 text-accent text-[11px]">
            🔥 On fire
          </span>
        )}
        {isPersonalBest && (
          <span className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px]">
            🏆 Personal best
          </span>
        )}
      </div>
    </div>
  )
}

// ── Week strip ──────────────────────────────────────────────────────────────
function WeekStrip({ weekSummary }) {
  return (
    <div className="mt-5 pt-4 border-t border-surface2">
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">This week</p>
      <div className="flex justify-between">
        {weekSummary.map(({ date, completedCount, totalHabits }, i) => {
          const isToday  = date === TODAY_ISO
          const isPast   = date < TODAY_ISO
          const allDone  = totalHabits > 0 && completedCount >= totalHabits

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-zinc-600">{DAY_LABELS[i]}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold ${
                allDone
                  ? 'bg-accent text-bg'
                  : isToday
                  ? 'border-2 border-accent/40 text-transparent'
                  : isPast
                  ? 'bg-surface2 text-transparent'
                  : 'bg-surface2 opacity-25 text-transparent'
              }`}>
                {allDone ? '✓' : ''}
                {isToday && !allDone ? <span className="w-1.5 h-1.5 rounded-full bg-accent/50 block" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mini heatmap (10 weeks × 7 days) — circles ─────────────────────────────
function MiniHeatmap() {
  const { habits, completions } = useHabitStore()

  const today = new Date()
  const cells = Array.from({ length: 70 }, (_, i) => {
    const d   = new Date(today); d.setDate(today.getDate() - (69 - i))
    const iso = localISO(d)   // local date — matches how completions are stored
    const count = habits.filter(h => (completions[h.id] || []).includes(iso)).length
    const pct   = habits.length > 0 ? count / habits.length : 0
    return { iso, pct }
  })

  const cols = Array.from({ length: 10 }, (_, w) => cells.slice(w * 7, w * 7 + 7))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-6 pb-4"
    >
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Activity</p>
      <div className="flex gap-1.5">
        {cols.map((col, w) => (
          <div key={w} className="flex flex-col gap-1.5 flex-1">
            {col.map(({ iso, pct }) => (
              <div
                key={iso}
                className={`aspect-square rounded-full ${iso === TODAY_ISO ? 'ring-2 ring-gold/50 ring-offset-1 ring-offset-bg' : ''} ${
                  pct === 0 ? 'bg-surface2' :
                  pct < 0.5 ? 'bg-accent/30' :
                  pct < 1   ? 'bg-accent/60' :
                              'bg-accent'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Soft notification nudge card ────────────────────────────────────────────
function NotifCard() {
  const [visible, setVisible] = useState(
    'Notification' in window && Notification.permission === 'default'
  )

  const enable = async () => {
    const ok = await requestAndSchedule()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border border-surface2"
        >
          <span className="text-lg flex-shrink-0">🔔</span>
          <p className="flex-1 text-zinc-500 text-xs leading-snug">
            Get a soft nudge twice a day with your remaining habits.
          </p>
          <button
            onClick={enable}
            className="flex-shrink-0 px-3 py-1.5 rounded-[10px] bg-accent/15 text-accent text-xs font-medium"
          >
            Enable
          </button>
          <button onClick={() => setVisible(false)} className="text-zinc-700 text-sm flex-shrink-0">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export default function DashboardScreen({ openHabit }) {
  const { habits, addHabit, getTodayCount, getTopStreak, getPersonalBest, getWeekSummary } = useHabitStore()

  const todayCount   = getTodayCount()
  const topStreak    = getTopStreak()
  const personalBest = getPersonalBest()
  const weekSummary  = getWeekSummary()
  const total        = habits.length

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-md mx-auto px-5 pb-36 pt-safe">
        <Header />

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 bg-surface rounded-[22px] p-5 border border-surface2"
        >
          <div className="flex items-center gap-4">
            <StreakRing streak={topStreak} />
            <HeroCopy streak={topStreak} personalBest={personalBest} />
          </div>
          <WeekStrip weekSummary={weekSummary} />
        </motion.div>

        <NotifCard />

        {/* Today's habits */}
        <div className="flex items-center justify-between mt-7 mb-1">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Today's habits</p>
          {total > 0 && (
            <p className="text-[11px] font-medium text-accent">{todayCount} of {total} done</p>
          )}
        </div>

        <HabitList habits={habits} openHabit={openHabit} />

        {habits.length > 0 && <MiniHeatmap />}
      </div>

      <AddHabitSheet addHabit={addHabit} />
    </div>
  )
}
