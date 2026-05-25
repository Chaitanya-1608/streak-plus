import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../store/useHabitStore'

const QUOTES = [
  'Identity is built one small action at a time.',
  'You don\'t rise to the level of your goals — you fall to the level of your systems.',
  'Every rep, every page, every day. That\'s who you\'re becoming.',
  'The flame you protect today lights the path you walk tomorrow.',
  'Discipline is choosing who you want to be over who you feel like being.',
]

// 24 particles spread at random angles
const PARTICLE_COUNT = 24
const COLORS = ['#DBAD28', '#EAC775', '#9CBD44', '#AF643F']

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  angle: (i / PARTICLE_COUNT) * 360 + Math.random() * 15 - 7,
  distance: 80 + Math.random() * 80,
  size: 6 + Math.random() * 8,
  color: COLORS[i % COLORS.length],
  delay: Math.random() * 0.12,
}))

function Particles({ active }) {
  return (
    <AnimatePresence>
      {active && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: p.delay }}
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
        />
      ))}
    </AnimatePresence>
  )
}

export default function MilestoneScreen({ goBack, milestone }) {
  const [burst, setBurst] = useState(false)
  const topStreak = useHabitStore(s => s.getTopStreak())

  const streakToShow = milestone || topStreak
  const quote = QUOTES[streakToShow % QUOTES.length]

  useEffect(() => {
    // Trigger burst on mount after short delay
    const t = setTimeout(() => setBurst(true), 300)
    if (navigator.vibrate) navigator.vibrate([60, 40, 80])
    return () => clearTimeout(t)
  }, [])

  const milestoneLabel =
    streakToShow >= 100 ? '100 Day Legend'
    : streakToShow >= 60  ? '60 Day Champion'
    : streakToShow >= 30  ? '30 Day Warrior'
    : streakToShow >= 21  ? '21 Day Habit'
    : streakToShow >= 14  ? '14 Day Builder'
    :                       '7 Day Streak'

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-gold/10 blur-3xl rounded-full pointer-events-none" />

      {/* Particle origin */}
      <div className="relative">
        <Particles active={burst} />

        {/* Trophy */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="text-8xl text-center drop-shadow-[0_0_30px_rgba(255,200,87,0.6)]"
          >
            🏆
          </motion.div>
        </motion.div>
      </div>

      {/* Streak count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Achievement unlocked</p>
        <h1 className="font-heading text-5xl text-white mt-2">{milestoneLabel}</h1>
        <p className="text-accent text-2xl font-heading mt-1">{streakToShow} days 🔥</p>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-8 mx-auto max-w-xs text-center"
      >
        <p className="text-zinc-400 text-base leading-relaxed italic">"{quote}"</p>
      </motion.div>

      {/* Stat ring row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex gap-6"
      >
        {[
          { value: streakToShow, label: 'Streak', color: 'text-accent' },
          { value: '🔥',        label: 'Flame',  color: 'text-gold'   },
          { value: '100%',      label: 'You',    color: 'text-teal'   },
        ].map(({ value, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className={`font-heading text-2xl ${color}`}>{value}</span>
            <span className="text-xs text-zinc-600">{label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileTap={{ scale: 0.96 }}
        onClick={goBack}
        className="mt-12 px-12 py-4 rounded-[20px] bg-accent text-white font-heading text-lg shadow-[0_0_28px_rgba(219,173,40,0.4)]"
      >
        Keep going →
      </motion.button>
    </div>
  )
}
