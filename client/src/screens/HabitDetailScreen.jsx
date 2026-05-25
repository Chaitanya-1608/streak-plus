import { useState } from 'react'
import { motion } from 'framer-motion'
import useHabitStore from '../store/useHabitStore'

const MOODS = [
  { emoji: '😣', label: 'Rough',   value: 1 },
  { emoji: '😕', label: 'Okay',    value: 2 },
  { emoji: '😐', label: 'Good',    value: 3 },
  { emoji: '🔥', label: 'On fire', value: 4 },
  { emoji: '🌟', label: 'Peak',    value: 5 },
]

const MILESTONES = [
  { days: 7,   label: 'Seed',     emoji: '🌱' },
  { days: 14,  label: 'Sprout',   emoji: '🌿' },
  { days: 21,  label: 'Habit',    emoji: '🔥' },
  { days: 30,  label: 'Crystal',  emoji: '💎' },
  { days: 60,  label: 'Champion', emoji: '🏅' },
  { days: 100, label: 'Legend',   emoji: '🏆' },
]

// Motivational quotes keyed loosely by streak phase
const QUOTES = [
  'You\'ve shown up every morning. That\'s not luck — that\'s who you are now.',
  'Identity is built one small action at a time.',
  'You don\'t rise to the level of your goals — you fall to the level of your systems.',
  'Every rep, every page, every day. That\'s who you\'re becoming.',
  'The flame you protect today lights the path you walk tomorrow.',
]

const TODAY = new Date().toISOString().split('T')[0]

function buildHeatmap(allDates) {
  const doneSet = new Set(allDates)
  const end = new Date(); end.setHours(0, 0, 0, 0)
  return Array.from({ length: 91 }, (_, i) => {
    const d   = new Date(end); d.setDate(end.getDate() - (90 - i))
    const iso = d.toISOString().split('T')[0]
    return { date: iso, done: doneSet.has(iso) }
  })
}

// ── Minimal streak hero ─────────────────────────────────────────────────────
function StreakHero({ streak }) {
  const quote = QUOTES[streak % QUOTES.length]

  return (
    <div className="text-center pt-2 pb-4">
      <motion.p
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="font-heading text-7xl text-accent leading-none"
      >
        {streak}
      </motion.p>
      <p className="text-zinc-500 text-sm mt-2">day streak</p>
      <p className="text-zinc-500 text-xs italic mt-4 leading-relaxed max-w-[260px] mx-auto">
        "{quote}"
      </p>
    </div>
  )
}

// ── Mood check-in ───────────────────────────────────────────────────────────
function MoodCheckIn({ habitId }) {
  const key = `mood-${habitId}-${TODAY}`
  const [selected, setSelected] = useState(() => Number(localStorage.getItem(key)) || null)

  const pick = (value) => {
    setSelected(value)
    localStorage.setItem(key, value)
    if (navigator.vibrate) navigator.vibrate(30)
  }

  return (
    <div className="mt-6">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">How did today's session feel?</p>
      <div className="flex gap-2 justify-between">
        {MOODS.map(({ emoji, label, value }) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.88 }}
            onClick={() => pick(value)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[16px] border transition-all duration-200 ${
              selected === value
                ? 'border-accent/60 bg-accent/10'
                : 'border-surface2 bg-surface'
            }`}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[10px] text-zinc-500">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Milestone row ───────────────────────────────────────────────────────────
function MilestoneRow({ streak }) {
  return (
    <div className="mt-6">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Streak milestones</p>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {MILESTONES.map(({ days, label, emoji }) => {
          const unlocked = streak >= days
          const current  = streak >= days && (MILESTONES.find((m, i) => streak < m.days && i > 0) || MILESTONES[MILESTONES.length - 1]).days === days
          return (
            <div
              key={days}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-4 rounded-[18px] border min-w-[70px] transition-all ${
                unlocked
                  ? 'bg-accent/10 border-accent/35'
                  : 'bg-surface border-surface2 opacity-40'
              }`}
            >
              <span className="text-xl">{unlocked ? emoji : '🔒'}</span>
              <div className="text-center">
                <p className={`text-[10px] font-medium ${unlocked ? 'text-accent' : 'text-zinc-600'}`}>{label}</p>
                <p className="text-[9px] text-zinc-700">{days}d</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Activity heatmap ────────────────────────────────────────────────────────
function HeatmapGrid({ allDates }) {
  const cells = buildHeatmap(allDates)
  const weeks = Array.from({ length: 13 }, (_, w) => cells.slice(w * 7, w * 7 + 7))

  return (
    <div className="mt-6">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Activity heatmap</p>
      <div className="flex gap-1">
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1 flex-1">
            {week.map((cell) => (
              <motion.div
                key={cell.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.003 * w }}
                title={cell.date}
                className={`aspect-square rounded-[2px] ${cell.date === TODAY ? 'ring-1 ring-gold/60' : ''} ${
                  cell.done ? 'bg-accent' : 'bg-surface2'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function HabitDetailScreen({ habit, goBack }) {
  const { getCurrentStreak, getLongestStreak, getAllDates, isCompletedToday, completeHabit } = useHabitStore()

  if (!habit) return null

  const streak   = getCurrentStreak(habit.id)
  const longest  = getLongestStreak(habit.id)
  const allDates = getAllDates(habit.id)
  const done     = isCompletedToday(habit.id)

  const handleComplete = () => {
    if (done) return
    completeHabit(habit.id)
    if (navigator.vibrate) navigator.vibrate(50)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-bg text-white"
    >
      <div className="max-w-md mx-auto px-5 pb-24 pt-safe">
        {/* Nav */}
        <div className="flex items-center gap-3 pt-10 mb-6">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-[12px] bg-surface border border-surface2 flex items-center justify-center text-zinc-400 text-base"
          >
            ←
          </button>
          <span className="text-xl">{habit.emoji || '🔥'}</span>
          <h1 className="font-heading text-lg text-white truncate flex-1">{habit.name}</h1>
          {longest > 0 && (
            <span className="text-[10px] text-zinc-600">Best: {longest}d</span>
          )}
        </div>

        <StreakHero streak={streak} />

        {/* Complete CTA */}
        <motion.button
          whileTap={{ scale: done ? 1 : 0.96 }}
          onClick={handleComplete}
          className={`w-full mt-4 py-4 rounded-[18px] font-heading text-base transition-all duration-300 ${
            done
              ? 'bg-accent/12 text-accent border border-accent/25 cursor-default'
              : 'bg-accent text-bg'
          }`}
        >
          {done ? '✓  Done today' : 'Mark complete'}
        </motion.button>

        <MoodCheckIn habitId={habit.id} />
        <MilestoneRow streak={streak} />
        <HeatmapGrid allDates={allDates} />
      </div>
    </motion.div>
  )
}
