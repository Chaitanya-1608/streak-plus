import { useState } from 'react'
import { motion } from 'framer-motion'
import useHabitStore from '../store/useHabitStore'

const MOODS = [
  { emoji: '😣', label: 'Rough',  value: 1 },
  { emoji: '😕', label: 'Hard',   value: 2 },
  { emoji: '😐', label: 'Okay',   value: 3 },
  { emoji: '🙂', label: 'Good',   value: 4 },
  { emoji: '😄', label: 'Great',  value: 5 },
]

const MILESTONES = [
  { days: 7,   label: '7 Days',   emoji: '🌱' },
  { days: 14,  label: '14 Days',  emoji: '⚡' },
  { days: 21,  label: '21 Days',  emoji: '🔥' },
  { days: 30,  label: '30 Days',  emoji: '💫' },
  { days: 60,  label: '60 Days',  emoji: '🏅' },
  { days: 100, label: '100 Days', emoji: '🏆' },
]

const TODAY = new Date().toISOString().split('T')[0]

function buildHeatmap(allDates) {
  const doneSet = new Set(allDates)
  const cells = []
  const end = new Date(); end.setHours(0, 0, 0, 0)
  for (let i = 90; i >= 0; i--) {
    const d = new Date(end); d.setDate(end.getDate() - i)
    cells.push({ date: d.toISOString().split('T')[0], done: doneSet.has(d.toISOString().split('T')[0]) })
  }
  return cells
}

function FlameHero({ streak, longest }) {
  return (
    <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-b from-rust/20 to-bg p-6 pb-8 border border-rust/20">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-rust/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          animate={{ scaleY: [1, 1.06, 0.96, 1.04, 1], scaleX: [1, 0.96, 1.03, 0.97, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl drop-shadow-[0_0_24px_rgba(219,173,40,0.7)]"
        >
          🔥
        </motion.div>
        <h2 className="font-heading text-5xl text-white mt-3">{streak}</h2>
        <p className="text-zinc-400 text-sm mt-1">day streak</p>
        <div className="flex gap-6 mt-5">
          <div className="text-center">
            <p className="font-heading text-xl text-gold">{longest}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Best ever</p>
          </div>
          <div className="w-px bg-white/10" />
          <div className="text-center">
            <p className="font-heading text-xl text-teal">
              {longest > 0 ? Math.round((streak / longest) * 100) : 0}%
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">Of best</p>
          </div>
        </div>
      </div>
    </div>
  )
}

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
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">How did it feel today?</p>
      <div className="flex gap-2 justify-between">
        {MOODS.map(({ emoji, label, value }) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.88 }}
            onClick={() => pick(value)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all duration-200 ${
              selected === value
                ? 'border-gold bg-gold/10 shadow-[0_0_14px_rgba(255,200,87,0.3)]'
                : 'border-surface2 bg-surface'
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[10px] text-zinc-500">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function MilestoneRow({ streak }) {
  return (
    <div className="mt-6">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Milestones</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {MILESTONES.map(({ days, label, emoji }) => {
          const unlocked = streak >= days
          return (
            <div
              key={days}
              className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-4 rounded-[20px] border min-w-[72px] transition-all ${
                unlocked
                  ? 'bg-gold/10 border-gold/40 shadow-[0_0_14px_rgba(255,200,87,0.2)]'
                  : 'bg-surface border-surface2 opacity-50'
              }`}
            >
              <span className="text-2xl">{unlocked ? emoji : '🔒'}</span>
              <span className={`text-xs font-medium ${unlocked ? 'text-gold' : 'text-zinc-600'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HeatmapGrid({ allDates }) {
  const cells = buildHeatmap(allDates)
  // 13 columns × 7 rows
  const weeks = Array.from({ length: 13 }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7)
  )

  return (
    <div className="mt-6">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Activity (13 weeks)</p>
      <div className="flex gap-1">
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1 flex-1">
            {week.map((cell, d) => (
              <motion.div
                key={cell.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (w * 7 + d) * 0.004 }}
                title={cell.date}
                className={`aspect-square rounded-[3px] ${
                  cell.date === TODAY ? 'ring-1 ring-gold' : ''
                } ${cell.done ? 'bg-accent' : 'bg-surface2'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

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
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-bg text-white"
    >
      <div className="max-w-md mx-auto px-5 pb-24 pt-safe">
        {/* Nav bar */}
        <div className="flex items-center gap-4 pt-10 mb-6">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-2xl bg-surface border border-surface2 flex items-center justify-center text-zinc-400 text-lg"
          >
            ←
          </button>
          <span className="text-2xl">{habit.emoji || '🔥'}</span>
          <h1 className="font-heading text-xl text-white truncate flex-1">{habit.name}</h1>
        </div>

        <FlameHero streak={streak} longest={Math.max(streak, longest)} />

        <motion.button
          whileTap={{ scale: done ? 1 : 0.96 }}
          onClick={handleComplete}
          className={`w-full mt-4 py-4 rounded-[20px] font-heading text-lg transition-all duration-300 ${
            done
              ? 'bg-accent/15 text-accent border border-accent/30 cursor-default'
              : 'bg-accent text-white shadow-[0_0_24px_rgba(219,173,40,0.35)]'
          }`}
        >
          {done ? '✓ Done today' : 'Mark complete'}
        </motion.button>

        <MoodCheckIn habitId={habit.id} />
        <MilestoneRow streak={streak} />
        <HeatmapGrid allDates={allDates} />
      </div>
    </motion.div>
  )
}
