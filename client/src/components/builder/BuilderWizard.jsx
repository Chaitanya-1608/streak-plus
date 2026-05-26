import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useHabitStore from '../../store/useHabitStore'

// ── Step 1: Identity ──────────────────────────────────────────────────────────
function IdentityStep({ habitName, value, onChange }) {
  const examples = ['reads every day', 'exercises daily', 'meditates', 'eats well']
  return (
    <div>
      <span className="text-4xl mb-4 block">🪞</span>
      <h2 className="font-heading text-[26px] text-white leading-tight mb-2">
        Who do you want to become?
      </h2>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        Every habit you build is a vote for the person you want to be.
        Atomic Habits calls this an identity-based habit.
      </p>
      <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">I am someone who…</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`e.g. "${habitName.toLowerCase()} every single day"`}
        style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
        className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-zinc-700 transition-colors"
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {examples.map(ex => (
          <button
            key={ex}
            onClick={() => onChange(ex)}
            className="px-3 py-1.5 rounded-full bg-surface border border-surface2 text-zinc-400 text-xs active:scale-95 transition-transform"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Cue ───────────────────────────────────────────────────────────────
function CueStep({ value, onChange }) {
  const times = [
    { id: 'Morning',   emoji: '🌅' },
    { id: 'Afternoon', emoji: '☀️' },
    { id: 'Evening',   emoji: '🌆' },
    { id: 'Night',     emoji: '🌙' },
  ]
  return (
    <div>
      <span className="text-4xl mb-4 block">📍</span>
      <h2 className="font-heading text-[26px] text-white leading-tight mb-2">
        Where and when?
      </h2>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        A clear cue tells your brain exactly when to start.
        The more specific, the more automatic it becomes.
      </p>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Location</p>
          <input
            value={value.where}
            onChange={e => onChange({ ...value, where: e.target.value })}
            placeholder="e.g. my bedroom, the gym, the kitchen"
            style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
            className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-zinc-700 transition-colors"
          />
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Time of day</p>
          <div className="grid grid-cols-2 gap-2">
            {times.map(({ id, emoji }) => (
              <button
                key={id}
                onClick={() => onChange({ ...value, when: id })}
                className={`py-3 rounded-2xl border text-sm transition-all duration-200 ${
                  value.when === id
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-surface2 bg-surface text-zinc-400'
                }`}
              >
                {emoji} {id}
              </button>
            ))}
          </div>
        </div>
      </div>
      {value.where && value.when && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3 rounded-2xl bg-surface border border-accent/20"
        >
          <p className="text-zinc-500 text-xs mb-1">Your cue</p>
          <p className="text-white text-sm">
            {value.when} · <span className="text-accent">{value.where}</span>
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ── Step 3: Habit Stack ───────────────────────────────────────────────────────
function StackStep({ habitName, value, onChange }) {
  const anchors = ['pour my morning coffee', 'brush my teeth', 'sit down at my desk', 'finish lunch']
  return (
    <div>
      <span className="text-4xl mb-4 block">🔗</span>
      <h2 className="font-heading text-[26px] text-white leading-tight mb-2">
        Stack it onto something
      </h2>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        Link your new habit to something you already do reliably.
        This is called implementation intention.
      </p>
      <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">After I…</p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. pour my morning coffee"
        style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
        className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-zinc-700 transition-colors"
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {anchors.map(a => (
          <button key={a} onClick={() => onChange(a)}
            className="px-3 py-1.5 rounded-full bg-surface border border-surface2 text-zinc-400 text-xs active:scale-95 transition-transform">
            {a}
          </button>
        ))}
      </div>
      {value.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3.5 rounded-2xl bg-surface border border-accent/20"
        >
          <p className="text-zinc-500 text-xs mb-1.5">Your habit stack</p>
          <p className="text-white text-sm leading-relaxed">
            After I <span className="text-accent">{value}</span>,<br/>
            I will <span className="text-accent">{habitName}</span>.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ── Step 4: 2-Minute Rule ─────────────────────────────────────────────────────
function TwoMinuteStep({ habitName, value, onChange }) {
  const examples = ['Just open the book', 'Just put on workout clothes', 'Write one sentence', 'Do one rep']
  return (
    <div>
      <span className="text-4xl mb-4 block">⏱</span>
      <h2 className="font-heading text-[26px] text-white leading-tight mb-2">
        Make it trivially easy
      </h2>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        The 2-minute rule: scale your habit down to something so small
        you'd never skip it. Showing up is the whole job at first.
      </p>
      <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">
        Instead of "{habitName}", I'll start with…
      </p>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. just open the app"
        style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
        className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-zinc-700 transition-colors"
      />
      <div className="flex flex-wrap gap-2 mt-4">
        {examples.map(ex => (
          <button key={ex} onClick={() => onChange(ex)}
            className="px-3 py-1.5 rounded-full bg-surface border border-surface2 text-zinc-400 text-xs active:scale-95 transition-transform">
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 5: Reward ────────────────────────────────────────────────────────────
function RewardStep({ value, onChange }) {
  const milestones = [7, 14, 21, 30]
  return (
    <div>
      <span className="text-4xl mb-4 block">🏆</span>
      <h2 className="font-heading text-[26px] text-white leading-tight mb-2">
        Design your reward
      </h2>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        Rewards close the habit loop. Pick something genuinely meaningful —
        not junk food after a workout. Make the identity match the reward.
      </p>
      <div className="space-y-4">
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">
            When I hit my milestone, I'll…
          </p>
          <input
            value={value.what}
            onChange={e => onChange({ ...value, what: e.target.value })}
            placeholder="e.g. buy new running shoes"
            style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
            className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 text-white text-[15px] outline-none placeholder-zinc-700 transition-colors"
          />
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">Milestone</p>
          <div className="flex gap-2">
            {milestones.map(m => (
              <button
                key={m}
                onClick={() => onChange({ ...value, milestone: m })}
                className={`flex-1 py-3 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                  value.milestone === m
                    ? 'border-accent/50 bg-accent/10 text-accent'
                    : 'border-surface2 bg-surface text-zinc-400'
                }`}
              >
                {m}d
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Wizard shell ──────────────────────────────────────────────────────────────
const STEP_LABELS = ['Identity', 'Cue', 'Stack', '2 Min', 'Reward']

export default function BuilderWizard({ habitName, habitEmoji, onDone, onCancel }) {
  const { addBuildHabit } = useHabitStore()
  const [step,     setStep]     = useState(0)
  const [identity, setIdentity] = useState('')
  const [cue,      setCue]      = useState({ where: '', when: '' })
  const [stack,    setStack]    = useState('')
  const [twoMin,   setTwoMin]   = useState('')
  const [reward,   setReward]   = useState({ what: '', milestone: 21 })

  const canNext = [
    identity.trim().length > 0,
    cue.where.trim().length > 0 && Boolean(cue.when),
    stack.trim().length > 0,
    twoMin.trim().length > 0,
    reward.what.trim().length > 0,
  ][step]

  const handleFinish = () => {
    addBuildHabit({
      name:              habitName,
      emoji:             habitEmoji,
      identityStatement: identity,
      cue:               `${cue.when} · ${cue.where}`,
      habitStack:        stack,
      minimumVersion:    twoMin,
      reward:            `${reward.what} (at ${reward.milestone} days)`,
    })
    onDone()
  }

  const steps = [
    <IdentityStep  habitName={habitName} value={identity} onChange={setIdentity} />,
    <CueStep       value={cue}   onChange={setCue}   />,
    <StackStep     habitName={habitName} value={stack}    onChange={setStack}   />,
    <TwoMinuteStep habitName={habitName} value={twoMin}   onChange={setTwoMin}  />,
    <RewardStep    value={reward}  onChange={setReward}  />,
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      className="min-h-screen bg-bg text-white"
    >
      <div className="max-w-md mx-auto px-5 pb-28 pt-safe">

        {/* Top nav */}
        <div className="flex items-center justify-between pt-10 mb-3">
          <button
            onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
            className="text-zinc-500 text-sm px-1"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <span className="text-zinc-600 text-xs">{step + 1} of {STEP_LABELS.length}</span>
          <div className="w-16" />
        </div>

        {/* Segmented progress */}
        <div className="flex gap-1.5 mb-8">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-surface2">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
                transition={{ duration: 0.35 }}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-8 pt-4 bg-gradient-to-t from-bg via-bg/90 to-transparent">
        <motion.button
          whileTap={{ scale: canNext ? 0.96 : 1 }}
          onClick={step < 4 ? () => setStep(s => s + 1) : handleFinish}
          disabled={!canNext}
          className={`w-full py-4 rounded-[18px] font-heading text-base transition-all duration-200 ${
            canNext ? 'bg-accent text-bg' : 'bg-surface2 text-zinc-700 cursor-not-allowed'
          }`}
        >
          {step < 4 ? `Next — ${STEP_LABELS[step + 1]}` : 'Start my 7-day trial 🔥'}
        </motion.button>
      </div>
    </motion.div>
  )
}
