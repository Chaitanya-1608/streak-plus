import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../../store/useHabitStore'

const STEPS = [
  {
    question:    'Who are you becoming?',
    sub:         'Name the person, not the habit.',
    prefix:      'I am someone who…',
    placeholder: 'reads every single day',
  },
  {
    question:    'Where and when?',
    sub:         'Specific beats vague. Every time.',
    prefix:      'I will do this…',
    placeholder: 'mornings in my bedroom',
  },
  {
    question:    'What comes right before?',
    sub:         'Link it to something you already do.',
    prefix:      'After I…',
    placeholder: 'pour my morning coffee',
  },
  {
    question:    'What\'s the smallest version?',
    sub:         'Make it too easy to skip.',
    prefix:      'I\'ll start by just…',
    placeholder: 'opening the book',
  },
  {
    question:    'What\'s your reward?',
    sub:         'Make the identity match the prize.',
    prefix:      'When I hit my milestone…',
    placeholder: 'buy new running shoes',
  },
]

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%' }),
}

function ProgressDots({ step }) {
  return (
    <div className="flex justify-center gap-2.5 mt-8">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < step   ? 'w-2 h-2 bg-accent' :
            i === step ? 'w-2.5 h-2.5 bg-accent/50' :
                        'w-2 h-2 bg-surface2'
          }`}
        />
      ))}
    </div>
  )
}

export default function BuilderWizard({ habitName, habitEmoji, onDone, onCancel }) {
  const { addBuildHabit } = useHabitStore()
  const [step,   setStep]   = useState(0)
  const [values, setValues] = useState(['', '', '', '', ''])
  const [dir,    setDir]    = useState(1)

  const s      = STEPS[step]
  const val    = values[step]
  const canGo  = val.trim().length >= 2
  const isLast = step === STEPS.length - 1

  const updateVal = (v) => {
    const next = [...values]; next[step] = v; setValues(next)
  }

  const advance = () => {
    if (!canGo) return
    if (isLast) {
      addBuildHabit({
        name:              habitName,
        emoji:             habitEmoji,
        identityStatement: values[0],
        cue:               values[1],
        habitStack:        values[2],
        minimumVersion:    values[3],
        reward:            values[4],
      })
      onDone()
      return
    }
    setDir(1); setStep(s => s + 1)
  }

  const retreat = () => {
    if (step === 0) { onCancel(); return }
    setDir(-1); setStep(s => s - 1)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden">

      {/* Top bar: back + dots */}
      <div className="flex-shrink-0 px-5 pt-safe">
        <div className="pt-10 flex items-center justify-between">
          <button onClick={retreat} className="text-zinc-500 text-sm">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
        </div>
        <ProgressDots step={step} />
      </div>

      {/* Sliding step content */}
      <div className="flex-1 relative overflow-hidden mt-10">
        <AnimatePresence custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 px-5 flex flex-col"
          >
            {/* Heading — Syne 800, 38px */}
            <h1
              className="font-heading text-white leading-tight mb-3"
              style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              {s.question}
            </h1>

            {/* Sub — max 10 words */}
            <p className="text-zinc-500 text-sm mb-8">{s.sub}</p>

            {/* Identity echo on final step */}
            {step === 4 && values[0].trim() && (
              <p className="text-zinc-600 text-xs italic mb-5 leading-relaxed">
                You said you're becoming someone who {values[0]}.
              </p>
            )}

            {/* Prefix label */}
            <p className="text-zinc-600 text-[11px] uppercase tracking-widest mb-3">
              {s.prefix}
            </p>

            {/* Journaling-style input: large, borderless except bottom rule */}
            <textarea
              value={val}
              onChange={e => updateVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && canGo) {
                  e.preventDefault()
                  advance()
                }
              }}
              placeholder={s.placeholder}
              autoFocus
              rows={3}
              style={{
                colorScheme: 'dark',
                WebkitTextFillColor: '#fff',
                resize: 'none',
                fontSize: 22,
                lineHeight: 1.55,
              }}
              className="w-full bg-transparent border-b border-zinc-800 focus:border-accent/40 pb-3 text-white placeholder-zinc-800 outline-none transition-colors"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA — appears only after 2+ chars */}
      <div className="flex-shrink-0 px-5 pb-10 pt-4 min-h-[92px] flex items-end">
        <AnimatePresence>
          {canGo && (
            <motion.button
              key="cta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18 }}
              onClick={advance}
              className="w-full py-4 rounded-[18px] bg-accent text-bg font-heading text-base"
              style={{ fontWeight: 800 }}
            >
              {isLast ? 'Start my 7-day trial 🔥' : 'Next →'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
