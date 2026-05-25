import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MILESTONES = [
  { days: 7,  label: 'Seed',    emoji: '🌱' },
  { days: 14, label: 'Sprout',  emoji: '🌿' },
  { days: 21, label: 'Habit',   emoji: '🔥' },
  { days: 30, label: 'Crystal', emoji: '💎' },
]

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i, angle: (i / 8) * 360,
  color: ['#DBAD28', '#EAC775', '#9CBD44'][i % 3],
}))

// ── Slide 0: Streak counter hook ─────────────────────────────────────────────
function SlideStreak() {
  const STEPS    = [1, 7, 21, 30, 100]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => (i + 1 < STEPS.length ? i + 1 : i))
    }, 700)
    return () => clearInterval(t)
  }, [])

  const count = STEPS[idx]

  return (
    <div className="flex flex-col items-center text-center px-6 w-full">
      <motion.div
        animate={{ scaleY: [1, 1.1, 0.94, 1.05, 1], scaleX: [1, 0.95, 1.04, 0.97, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-8xl drop-shadow-[0_0_20px_rgba(219,173,40,0.5)]"
      >
        🔥
      </motion.div>

      <motion.p
        key={count}
        initial={{ scale: 0.5, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 14 }}
        className="font-heading text-7xl text-accent mt-5 leading-none"
      >
        {count}
      </motion.p>
      <p className="text-zinc-500 text-sm mt-2 tracking-wide">day streak</p>

      <h2 className="font-heading text-[26px] text-white mt-8 leading-tight">
        Don't break<br />the chain.
      </h2>
      <p className="text-zinc-500 text-[13px] mt-3 leading-relaxed max-w-[260px]">
        One small action every day builds the identity you want to become.
      </p>
    </div>
  )
}

// ── Slide 1: Interactive mock habit ──────────────────────────────────────────
function SlideTry({ onAutoAdvance }) {
  const [done,  setDone]  = useState(false)
  const [burst, setBurst] = useState(false)

  const handleTap = () => {
    if (done) return
    setDone(true)
    setBurst(true)
    if (navigator.vibrate) navigator.vibrate([40, 30, 60])
    setTimeout(() => setBurst(false), 500)
    setTimeout(() => onAutoAdvance(), 1400)
  }

  return (
    <div className="flex flex-col items-center px-6 w-full">
      <h2 className="font-heading text-[22px] text-white text-center">Feel the reward</h2>
      <p className="text-zinc-500 text-[13px] mt-2 text-center">
        {done ? "That feeling? You'll chase it every day. 🔥" : 'Tap to complete your first habit →'}
      </p>

      {/* Mock habit card */}
      <motion.div
        animate={done ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
        className={`w-full mt-8 flex items-center gap-3 px-4 py-4 rounded-[18px] border transition-all duration-400 ${
          done ? 'bg-accent/10 border-accent/30' : 'bg-surface border-surface2'
        }`}
      >
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${done ? 'bg-accent/20' : 'bg-surface2'}`}>
          🏃
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-[15px]">Morning Run</p>
          <p className={`text-xs mt-0.5 transition-colors ${done ? 'text-accent/60' : 'text-zinc-600'}`}>
            {done ? 'Daily · Done ✓' : 'Daily'}
          </p>
        </div>

        {/* Button with particles */}
        <div className="relative flex-shrink-0">
          <AnimatePresence>
            {burst && PARTICLES.map(p => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos((p.angle * Math.PI) / 180) * 28, y: Math.sin((p.angle * Math.PI) / 180) * 28, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.48, ease: 'easeOut' }}
                className="absolute top-2.5 left-2.5 w-3 h-3 rounded-full pointer-events-none z-20"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: done ? 1 : 0.82 }}
            animate={burst ? { scale: [1, 1.35, 1] } : {}}
            onClick={handleTap}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10 ${
              done ? 'bg-accent text-bg' : 'border-2 border-zinc-700 text-transparent'
            }`}
          >
            {done ? '✓' : ''}
          </motion.button>
        </div>
      </motion.div>

      {/* Streak counter pops in */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.25 }}
            className="mt-6 text-center"
          >
            <p className="font-heading text-5xl text-accent">1</p>
            <p className="text-zinc-500 text-sm mt-1">day streak started 🔥</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Slide 2: Milestone preview ───────────────────────────────────────────────
function SlideMilestones({ onGetStarted }) {
  return (
    <div className="flex flex-col items-center px-6 w-full">
      <h2 className="font-heading text-[22px] text-white text-center">Unlock as you grow</h2>
      <p className="text-zinc-500 text-[13px] mt-2 text-center leading-relaxed">
        Keep your streak and earn badges that mark your journey.
      </p>

      <div className="grid grid-cols-4 gap-2.5 mt-8 w-full">
        {MILESTONES.map(({ days, label, emoji }, i) => (
          <motion.div
            key={days}
            initial={{ opacity: 0, scale: 0.4, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 280, damping: 16 }}
            className="flex flex-col items-center gap-2 py-4 px-2 bg-accent/10 border border-accent/25 rounded-[16px]"
          >
            <span className="text-2xl">{emoji}</span>
            <p className="text-accent text-[10px] font-medium">{label}</p>
            <p className="text-zinc-600 text-[9px]">{days}d</p>
          </motion.div>
        ))}
      </div>

      {/* Identity message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 w-full bg-surface border border-surface2 rounded-[16px] px-4 py-4 text-center"
      >
        <p className="text-zinc-400 text-[13px] italic leading-relaxed">
          "Identity is built one small action at a time."
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.96 }}
        onClick={onGetStarted}
        className="w-full mt-7 py-4 rounded-[18px] bg-accent text-bg font-heading text-base"
      >
        Start my streak →
      </motion.button>
    </div>
  )
}

// ── Main onboarding ──────────────────────────────────────────────────────────
export default function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0)
  const TOTAL = 3

  const next = () => setSlide(s => Math.min(s + 1, TOTAL - 1))

  const slideVariants = {
    enter:  { x: 40, opacity: 0 },
    center: { x: 0,  opacity: 1 },
    exit:   { x: -40, opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      {/* Slide indicator */}
      <div className="flex justify-center gap-2 pt-12 pb-2">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === slide ? 24 : 6, opacity: i === slide ? 1 : 0.25 }}
            transition={{ duration: 0.3 }}
            className="h-1.5 rounded-full bg-accent"
          />
        ))}
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="w-full flex items-center justify-center py-6"
          >
            {slide === 0 && <SlideStreak />}
            {slide === 1 && <SlideTry onAutoAdvance={next} />}
            {slide === 2 && <SlideMilestones onGetStarted={() => { localStorage.setItem('streak-onboarded', '1'); onDone() }} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — only on slides 0 and 1 (slide 1 auto-advances, but show as fallback) */}
      <div className="px-6 pb-12">
        {slide < 2 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => { localStorage.setItem('streak-onboarded', '1'); onDone() }}
              className="text-zinc-600 text-sm py-3 px-2"
            >
              Skip
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="px-8 py-3.5 rounded-[16px] bg-surface border border-surface2 text-zinc-300 text-sm font-medium"
            >
              {slide === 0 ? 'Next →' : 'Next →'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
