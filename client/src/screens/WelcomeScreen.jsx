import { motion } from 'framer-motion'

const FEATURES = [
  { icon: '⚡', text: 'Tiny actions compound daily' },
  { icon: '🔥', text: 'Protect your streak momentum' },
  { icon: '🧠', text: 'Become your future identity'  },
]

export default function WelcomeScreen({ onContinue }) {
  return (
    <div className="min-h-screen bg-bg text-white flex flex-col justify-between px-6 py-12 overflow-hidden relative">
      <div className="absolute -top-28 -right-16 w-72 h-72 bg-accent/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-gold to-accent flex items-center justify-center text-4xl shadow-[0_0_48px_rgba(219,173,40,0.4)]"
        >
          🔥
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-heading text-5xl leading-[1] mt-8 tracking-tight"
        >
          Protect your<br />momentum.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-zinc-400 text-lg mt-5 leading-relaxed"
        >
          Build habits that feel emotionally rewarding, not exhausting.
        </motion.p>

        <div className="mt-10 space-y-3">
          {FEATURES.map(({ icon, text }, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
              className="flex items-center gap-4 text-zinc-300"
            >
              <div className="w-10 h-10 rounded-2xl bg-surface2 flex items-center justify-center text-xl flex-shrink-0">
                {icon}
              </div>
              <p className="text-sm">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10"
      >
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-[20px] bg-accent text-white font-heading text-lg shadow-[0_0_32px_rgba(219,173,40,0.35)] active:scale-[0.97] transition-transform"
        >
          Enter Streak+
        </button>
        <p className="text-center text-zinc-600 text-xs mt-4">Your momentum starts today</p>
      </motion.div>
    </div>
  )
}
