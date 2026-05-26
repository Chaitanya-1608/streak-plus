import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../../store/useHabitStore'

const STEPS = [
  {
    question:    'Who are you becoming?',
    sub:         'Name the person, not the habit.',
    prefix:      'I am someone who…',
    placeholder: 'reads every single day',
    suggestions: [
      'reads every day',
      'exercises daily',
      'eats healthy consistently',
      'meditates every morning',
    ],
  },
  {
    question:    'Where and when?',
    sub:         'Specific beats vague. Every time.',
    prefix:      'I will do this…',
    placeholder: 'mornings in my bedroom',
    suggestions: [
      'mornings before work',
      'evenings after dinner',
      'right after waking up',
      'during lunch break',
    ],
  },
  {
    question:    'What comes right before?',
    sub:         'Link it to something you already do.',
    prefix:      'After I…',
    placeholder: 'pour my morning coffee',
    suggestions: [
      'pour my morning coffee',
      'brush my teeth',
      'sit down at my desk',
      'finish dinner',
    ],
  },
  {
    question:    'What\'s the smallest version?',
    sub:         'Make it too easy to skip.',
    prefix:      'I\'ll start by just…',
    placeholder: 'opening the book',
    suggestions: [
      'doing just 2 minutes',
      'opening the app',
      'doing one rep',
      'reading one page',
    ],
  },
  {
    question:    'What\'s your reward?',
    sub:         'Make the identity match the prize.',
    prefix:      'When I hit my milestone…',
    placeholder: 'buy new running shoes',
    suggestions: [
      'treat myself to something nice',
      'take a full rest day guilt-free',
      'buy something I\'ve been wanting',
      'celebrate with a meal out',
    ],
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

      {/* Top bar */}
      <div className="flex-shrink-0 px-5 pt-safe">
        <div className="pt-10 flex items-center justify-between">
          <button onClick={retreat} className="text-zinc-500 text-sm">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
        </div>

        {/* Wizard title — static */}
        <p className="text-zinc-600 text-[11px] uppercase tracking-widest mt-3">
          Let's build your habit
        </p>

        <ProgressDots step={step} />
      </div>

      {/* Sliding step content */}
      <div className="flex-1 relative overflow-hidden mt-8">
        <AnimatePresence custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 px-5 flex flex-col overflow-y-auto"
          >
            {/* Heading */}
            <h1
              className="text-white leading-tight mb-2"
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: 34, fontWeight: 700, letterSpacing: '-0.01em' }}
            >
              {s.question}
            </h1>
            <p className="text-zinc-500 text-sm mb-6">{s.sub}</p>

            {/* Identity echo on final step */}
            {step === 4 && values[0].trim() && (
              <p className="text-zinc-600 text-xs italic mb-4 leading-relaxed">
                You said you're becoming someone who {values[0]}.
              </p>
            )}

            {/* Prefix label */}
            <p className="text-zinc-600 text-[11px] uppercase tracking-widest mb-2">
              {s.prefix}
            </p>

            {/* Journaling input */}
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
              rows={2}
              style={{
                colorScheme: 'dark',
                WebkitTextFillColor: '#fff',
                resize: 'none',
                fontSize: 20,
                lineHeight: 1.55,
              }}
              className="w-full bg-transparent border-b border-zinc-800 focus:border-accent/40 pb-3 text-white placeholder-zinc-800 outline-none transition-colors"
            />

            {/* Quick-pick chips */}
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest mt-5 mb-2">
              Quick pick
            </p>
            <div className="flex flex-wrap gap-2 pb-4">
              {s.suggestions.map(sug => (
                <button
                  key={sug}
                  onClick={() => updateVal(sug)}
                  className={`px-3 py-2 rounded-full text-xs transition-all duration-150 active:scale-95 ${
                    val === sug
                      ? 'bg-accent/20 border border-accent/40 text-accent'
                      : 'bg-surface border border-surface2 text-zinc-400'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA — appears only after 2+ chars */}
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
