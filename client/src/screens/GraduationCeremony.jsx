import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  color: ['#DBAD28', '#EAC775', '#9CBD44', '#FFEAB3'][i % 4],
  dist:  56 + Math.random() * 32,
}))

const QUOTES = [
  'Every action is a vote for the type of person you want to become.',
  'You do not rise to the level of your goals. You fall to the level of your systems.',
  'The identity you build today is the life you live tomorrow.',
]

export default function GraduationCeremony({ habit, onDone }) {
  const [burst, setBurst] = useState(false)
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg text-white flex flex-col items-center justify-center px-6"
    >
      {/* Particle burst */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-6">
        <AnimatePresence>
          {burst && PARTICLES.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
                y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
                opacity: 0, scale: 0.3,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.15 }}
          className="text-7xl select-none"
        >
          🎓
        </motion.div>
      </div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-[11px] text-teal uppercase tracking-widest mb-3">
          7-day trial complete
        </p>
        <h1 className="font-heading text-[28px] text-white leading-tight mb-2">
          {habit?.emoji || '🔥'} {habit?.name || 'Your habit'}
        </h1>
        <p className="font-heading text-[20px] text-accent mb-6">
          has graduated to Maintain mode.
        </p>

        {/* Identity statement */}
        {habit?.identityStatement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6 px-4 py-3 rounded-2xl bg-surface border border-accent/20"
          >
            <p className="text-zinc-500 text-xs mb-1">You proved the identity</p>
            <p className="text-white text-sm">
              I am someone who <span className="text-accent">{habit.identityStatement}</span>.
            </p>
          </motion.div>
        )}

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-zinc-500 text-xs italic leading-relaxed max-w-[280px] mx-auto mb-10"
        >
          "{quote}"
        </motion.p>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="w-full max-w-[320px] py-4 rounded-[18px] bg-accent text-bg font-heading text-base"
      >
        Continue →
      </motion.button>
    </motion.div>
  )
}
