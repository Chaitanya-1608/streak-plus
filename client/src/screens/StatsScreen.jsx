import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useHabitStore, { localISO } from '../store/useHabitStore'

function daysSince(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return localISO(d)
  })
}

function KpiCard({ label, value, sub, accent = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface border border-surface2 rounded-[20px] p-5"
    >
      <p className={`font-heading text-[36px] leading-none mb-1 ${accent ? 'text-teal' : 'text-accent'}`}>
        {value}
      </p>
      <p className="text-zinc-400 text-sm leading-snug">{label}</p>
      {sub && <p className="text-zinc-600 text-[11px] mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function StatsScreen() {
  const {
    habits,
    completions,
    getTopStreak,
    getPersonalBest,
    getAllTimeCompletions,
    getTodayCount,
    getCurrentStreak,
    getLongestStreak,
  } = useHabitStore()

  const topStreak       = getTopStreak()
  const personalBest    = getPersonalBest()
  const totalCompletions = getAllTimeCompletions()
  const todayCount      = getTodayCount()
  const totalHabits     = habits.length

  // Consistency & days missed — last 30 days
  const { consistency, daysMissed, daysActive } = useMemo(() => {
    const last30 = new Set(daysSince(30))
    const activeDays = new Set()
    for (const dates of Object.values(completions)) {
      for (const d of dates) {
        if (last30.has(d)) activeDays.add(d)
      }
    }
    const active  = activeDays.size
    const missed  = 30 - active
    const pct     = Math.round((active / 30) * 100)
    return { consistency: pct, daysMissed: missed, daysActive: active }
  }, [completions])

  // XP & level
  const xp    = totalCompletions * 10
  const level = Math.floor(xp / 100) + 1
  const xpInLevel = xp % 100

  // Per-habit rows sorted by current streak desc
  const habitRows = useMemo(() =>
    [...habits]
      .map(h => ({
        ...h,
        streak:  getCurrentStreak(h.id),
        longest: getLongestStreak(h.id),
        total:   (completions[h.id] || []).length,
      }))
      .sort((a, b) => b.streak - a.streak),
  [habits, completions]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-md mx-auto px-5 pt-14 pb-40">

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest mb-0.5">Your progress</p>
          <h1 className="font-heading text-2xl text-white">Stats</h1>
        </motion.div>

        {/* Streaks */}
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Streak</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KpiCard label="Current streak" value={`${topStreak}d`} sub="across all habits" delay={0.05} />
          <KpiCard label="Personal best" value={`${personalBest}d`} sub="all time" delay={0.1} accent />
        </div>

        {/* Completions */}
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Completions</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KpiCard label="All-time completions" value={totalCompletions} delay={0.15} />
          <KpiCard label="Done today" value={`${todayCount} / ${totalHabits}`} sub="habits" delay={0.2} accent />
        </div>

        {/* Last 30 days */}
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Last 30 days</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KpiCard label="Consistency" value={`${consistency}%`} sub={`${daysActive} active days`} delay={0.25} />
          <KpiCard label="Days missed" value={daysMissed} sub="out of 30" delay={0.3} accent />
        </div>

        {/* Level / XP */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-surface border border-surface2 rounded-[20px] p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-zinc-400 text-sm">Level {level}</p>
              <p className="font-heading text-[28px] text-accent leading-none">{xp} XP</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="font-heading text-accent text-lg">{level}</span>
            </div>
          </div>
          <div className="h-2 bg-surface2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <p className="text-zinc-600 text-[11px] mt-1.5">{100 - xpInLevel} XP to level {level + 1}</p>
        </motion.div>

        {/* Per-habit breakdown */}
        {habitRows.length > 0 && (
          <>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Habits</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-surface border border-surface2 rounded-[20px] overflow-hidden"
            >
              {habitRows.map((h, i) => (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i < habitRows.length - 1 ? 'border-b border-surface2/50' : ''
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{h.emoji || '🔥'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{h.name}</p>
                    <p className="text-zinc-600 text-[11px] mt-0.5">{h.total} completions</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-heading text-accent text-base leading-none">{h.streak}d</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">best {h.longest}d</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}

        {habits.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-zinc-500 text-sm">Add a habit to see your stats.</p>
          </div>
        )}

      </div>
    </div>
  )
}
