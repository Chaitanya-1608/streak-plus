import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = 'https://streak-plus-api.onrender.com/api'

// ── Helpers ──────────────────────────────────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('streak-users') || '[]') }
  catch { return [] }
}

function saveUser(user) {
  const users = getUsers()
  users.push({ email: user.email.toLowerCase(), firstName: user.firstName, lastName: user.lastName })
  localStorage.setItem('streak-users', JSON.stringify(users))
}

function isEmailTaken(email) {
  return getUsers().some(u => u.email === email.trim().toLowerCase())
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ── Color-coded input ────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, isValid, error }) {
  const [focused, setFocused] = useState(false)

  const borderColor =
    error   ? 'border-red-500/60 focus:border-red-500/80'
    : value && isValid ? 'border-teal/50 focus:border-teal/70'
    : focused ? 'border-accent/60 focus:border-accent/70'
    : 'border-surface2 focus:border-accent/40'

  const labelColor =
    error         ? 'text-red-400'
    : value && isValid ? 'text-teal/80'
    : focused      ? 'text-accent/80'
    : 'text-zinc-600'

  return (
    <div>
      <motion.p
        animate={{ opacity: value || focused ? 1 : 0, y: value || focused ? 0 : 4 }}
        className={`text-[11px] mb-1.5 font-medium transition-colors ${labelColor}`}
      >
        {error || label}
      </motion.p>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
        className={`w-full bg-surface border rounded-2xl px-4 py-3.5 outline-none placeholder-zinc-700 transition-all duration-200 text-white text-[15px] ${borderColor}`}
      />
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function LoginScreen({ onLogin }) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [emailErr,  setEmailErr]  = useState('')
  const [loading,   setLoading]   = useState(false)

  const emailValid = isValidEmail(email)
  const passValid  = password.length >= 6
  const canSubmit  = firstName.trim() && lastName.trim() && emailValid && passValid && !emailErr && !loading

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailErr('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    if (isEmailTaken(email)) {
      setEmailErr('This email is already registered.')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/auth/welcome`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), firstName: firstName.trim() }),
      })
      const data = await res.json()

      if (!res.ok && data.field === 'email') {
        setEmailErr(data.message)
        setLoading(false)
        return
      }
      // Non-fatal errors (server down, email failed) — still let them in
    } catch {
      // Backend unreachable — skip validation, proceed
    }

    const user = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() }
    saveUser(user)
    localStorage.setItem('streak-auth', JSON.stringify(user))
    setLoading(false)
    onLogin()
  }

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col px-6 py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-gold to-accent flex items-center justify-center text-xl mb-6">
          🔥
        </div>
        <h1 className="font-heading text-[32px] text-white leading-tight">Create account</h1>
        <p className="text-zinc-600 text-sm mt-2">Your streak starts the moment you sign up.</p>
      </motion.div>

      {/* Fields */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 space-y-4"
      >
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First"
            isValid={firstName.trim().length > 0}
          />
          <Field
            label="Last name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last"
            isValid={lastName.trim().length > 0}
          />
        </div>

        <Field
          label="Email"
          value={email}
          onChange={handleEmailChange}
          type="email"
          placeholder="you@example.com"
          isValid={emailValid && !emailErr}
          error={emailErr}
        />

        {/* Password with show/hide */}
        <div>
          <motion.p
            animate={{ opacity: password || true ? 1 : 0 }}
            className={`text-[11px] mb-1.5 font-medium ${
              password && !passValid ? 'text-red-400'
              : password && passValid ? 'text-teal/80'
              : 'text-zinc-600'
            }`}
          >
            {password && !passValid ? 'Min 6 characters' : 'Password'}
          </motion.p>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              autoComplete="new-password"
              style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
              className={`w-full bg-surface border rounded-2xl px-4 py-3.5 pr-16 outline-none placeholder-zinc-700 transition-all duration-200 text-white text-[15px] ${
                password && !passValid ? 'border-red-500/60'
                : password && passValid ? 'border-teal/50'
                : 'border-surface2 focus:border-accent/50'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-medium"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="mt-8"
      >
        <motion.button
          whileTap={{ scale: canSubmit ? 0.96 : 1 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-[18px] font-heading text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            canSubmit
              ? 'bg-accent text-bg'
              : 'bg-surface2 text-zinc-700 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full"
              />
              Sending welcome email…
            </>
          ) : 'Enter Streak+'}
        </motion.button>

        <p className="text-center text-zinc-700 text-xs mt-4">
          Your momentum starts today.
        </p>
      </motion.div>
    </div>
  )
}
