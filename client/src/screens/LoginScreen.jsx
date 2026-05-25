import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LoginScreen({ onLogin }) {
  const [firstName, setFirstName] = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')

  const canSubmit = firstName.trim() && email.trim() && password.length >= 6

  const handleSubmit = () => {
    if (!canSubmit) return
    setError('')

    const user = { firstName: firstName.trim(), email: email.trim() }
    localStorage.setItem('streak-auth', JSON.stringify(user))
    onLogin()
  }

  return (
    <div className="min-h-screen bg-bg text-white px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-4xl">Welcome.</h1>
        <p className="text-zinc-500 mt-2 text-sm">Start building your streaks.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-10 space-y-3"
      >
        <input
          placeholder="First name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 outline-none text-white placeholder-zinc-600 transition-colors"
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 outline-none text-white placeholder-zinc-600 transition-colors"
        />
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-surface border border-surface2 focus:border-accent/50 rounded-2xl px-4 py-3.5 outline-none text-white placeholder-zinc-600 transition-colors pr-16"
          />
          <button
            onClick={() => setShowPass(v => !v)}
            className="absolute right-4 top-3.5 text-zinc-500 text-sm"
          >
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: canSubmit ? 0.96 : 1 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full mt-8 py-4 rounded-[20px] font-heading text-lg transition-all duration-200 ${
          canSubmit
            ? 'bg-accent text-white shadow-[0_0_24px_rgba(219,173,40,0.35)]'
            : 'bg-surface2 text-zinc-600 opacity-40 cursor-not-allowed'
        }`}
      >
        Enter Streak+
      </motion.button>
    </div>
  )
}
