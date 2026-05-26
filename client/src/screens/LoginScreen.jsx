import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = 'https://streak-plus-api.onrender.com/api'

// ── Local user store ──────────────────────────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('streak-users') || '[]') }
  catch { return [] }
}

function saveUser(user) {
  const users = getUsers()
  users.push({
    email:     user.email.toLowerCase(),
    firstName: user.firstName,
    lastName:  user.lastName,
    password:  user.password,           // stored for local sign-in verification
  })
  localStorage.setItem('streak-users', JSON.stringify(users))
}

function findUser(email) {
  return getUsers().find(u => u.email === email.trim().toLowerCase()) || null
}

function isEmailTaken(email) {
  return !!findUser(email)
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ── Color-coded input ────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, isValid, error, autoComplete }) {
  const [focused, setFocused] = useState(false)

  const borderColor =
    error            ? 'border-red-500/60'
    : value && isValid ? 'border-teal/50'
    : focused          ? 'border-accent/60'
    :                    'border-surface2'

  const labelColor =
    error            ? 'text-red-400'
    : value && isValid ? 'text-teal/80'
    : focused          ? 'text-accent/80'
    :                    'text-zinc-600'

  return (
    <div>
      <p className={`text-[11px] mb-1.5 font-medium transition-colors ${labelColor}`}>
        {error || label}
      </p>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoComplete={autoComplete || (type === 'password' ? 'current-password' : 'off')}
        style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
        className={`w-full bg-surface border rounded-2xl px-4 py-3.5 outline-none placeholder-zinc-700 transition-all duration-200 text-white text-[15px] ${borderColor}`}
      />
    </div>
  )
}

// ── Password field with show/hide ────────────────────────────────────────────
function PasswordField({ value, onChange, valid, error, autoComplete, placeholder = 'Min 6 characters' }) {
  const [show, setShow] = useState(false)
  const [focused, setFocused] = useState(false)

  const border =
    error         ? 'border-red-500/60'
    : value && valid ? 'border-teal/50'
    : focused        ? 'border-accent/60'
    :                  'border-surface2'

  const label =
    error              ? error
    : value && !valid  ? 'Min 6 characters'
    :                    'Password'

  const labelColor =
    error              ? 'text-red-400'
    : value && !valid  ? 'text-red-400/70'
    : value && valid   ? 'text-teal/80'
    : focused          ? 'text-accent/80'
    :                    'text-zinc-600'

  return (
    <div>
      <p className={`text-[11px] mb-1.5 font-medium transition-colors ${labelColor}`}>{label}</p>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={autoComplete || 'current-password'}
          style={{ colorScheme: 'dark', WebkitTextFillColor: '#fff' }}
          className={`w-full bg-surface border rounded-2xl px-4 py-3.5 pr-16 outline-none placeholder-zinc-700 transition-all duration-200 text-white text-[15px] ${border}`}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-medium"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

// ── Sign-up form ─────────────────────────────────────────────────────────────
function SignUp({ onSuccess, onSwitch }) {
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [emailErr,  setEmailErr]  = useState('')
  const [loading,   setLoading]   = useState(false)

  const emailValid = isValidEmail(email)
  const passValid  = password.length >= 6
  const canSubmit  = firstName.trim() && lastName.trim() && emailValid && passValid && !emailErr && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return

    if (isEmailTaken(email)) {
      setEmailErr('Account already exists. Sign in instead.')
      return
    }

    setLoading(true)

    // MX domain check
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
    } catch {
      // backend unreachable — proceed anyway
    }

    const user = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password }
    saveUser(user)

    // Register with backend to get JWT for cloud sync
    let token = null
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName: user.firstName, lastName: user.lastName, email: user.email, password }),
      })
      const data = await res.json()
      if (data.token) token = data.token
      if (data.userNumber) localStorage.setItem('streak-user-number', String(data.userNumber))
    } catch {
      // backend unreachable — sync will happen next time online
    }

    localStorage.setItem('streak-auth', JSON.stringify({
      firstName: user.firstName, lastName: user.lastName, email: user.email, ...(token && { token }),
    }))
    setLoading(false)
    onSuccess(user.email)
  }

  return (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22 }}
    >
      <h1 className="font-heading text-[30px] text-white leading-tight">Create account</h1>
      <p className="text-zinc-600 text-sm mt-1">Your streak starts the moment you sign up.</p>

      <div className="mt-7 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={firstName} onChange={e => setFirstName(e.target.value)}
            placeholder="First" isValid={firstName.trim().length > 0} />
          <Field label="Last name" value={lastName} onChange={e => setLastName(e.target.value)}
            placeholder="Last" isValid={lastName.trim().length > 0} />
        </div>

        <Field
          label="Email" type="email" value={email} placeholder="you@example.com"
          onChange={e => { setEmail(e.target.value); setEmailErr('') }}
          isValid={emailValid && !emailErr} error={emailErr}
        />

        <PasswordField
          value={password} onChange={e => setPassword(e.target.value)}
          valid={passValid} autoComplete="new-password"
        />
      </div>

      <motion.button
        whileTap={{ scale: canSubmit ? 0.96 : 1 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full mt-7 py-4 rounded-[18px] font-heading text-base transition-all duration-200 flex items-center justify-center gap-2 ${
          canSubmit ? 'bg-accent text-bg' : 'bg-surface2 text-zinc-700 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full inline-block"
            />
            Sending welcome email…
          </>
        ) : 'Create account'}
      </motion.button>

      <p className="text-center text-zinc-600 text-sm mt-5">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-accent font-medium">Sign in</button>
      </p>
    </motion.div>
  )
}

// ── Sign-in form ─────────────────────────────────────────────────────────────
function SignIn({ onSuccess, onSwitch }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const emailValid = isValidEmail(email)
  const canSubmit  = emailValid && password.length >= 1 && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    const user = findUser(email)
    if (!user) {
      setError('No account found with that email.')
      setLoading(false)
      return
    }
    if (user.password !== password) {
      setError('Incorrect password.')
      setLoading(false)
      return
    }

    // Get JWT from backend for cloud sync
    let token = null
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email, password }),
      })
      const data = await res.json()
      if (data.token) token = data.token
    } catch {
      // backend unreachable — local-only session
    }

    localStorage.setItem('streak-auth', JSON.stringify({
      firstName: user.firstName, lastName: user.lastName, email: user.email, ...(token && { token }),
    }))
    setLoading(false)
    onSuccess(user.email)
  }

  return (
    <motion.div
      key="signin"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22 }}
    >
      <h1 className="font-heading text-[30px] text-white leading-tight">Welcome back.</h1>
      <p className="text-zinc-600 text-sm mt-1">Sign in to protect your streak.</p>

      <div className="mt-7 space-y-4">
        <Field
          label="Email" type="email" value={email} placeholder="you@example.com"
          onChange={e => { setEmail(e.target.value); setError('') }}
          isValid={emailValid} error={error && error.includes('email') ? error : ''}
          autoComplete="email"
        />

        <PasswordField
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          valid={password.length >= 1}
          error={error && error.includes('password') ? error : ''}
          placeholder="Your password"
          autoComplete="current-password"
        />

        {error && !error.includes('password') && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>

      <motion.button
        whileTap={{ scale: canSubmit ? 0.96 : 1 }}
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full mt-7 py-4 rounded-[18px] font-heading text-base transition-all duration-200 ${
          canSubmit ? 'bg-accent text-bg' : 'bg-surface2 text-zinc-700 cursor-not-allowed'
        }`}
      >
        Sign in
      </motion.button>

      <p className="text-center text-zinc-600 text-sm mt-5">
        New here?{' '}
        <button onClick={onSwitch} className="text-accent font-medium">Create account</button>
      </p>
    </motion.div>
  )
}

// ── Screen shell ─────────────────────────────────────────────────────────────
export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(
    // Default to sign-in if any user has registered before
    getUsers().length > 0 ? 'signin' : 'signup'
  )

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col px-6 py-12">
      {/* Brand mark */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-gold to-accent flex items-center justify-center text-xl">
          🔥
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'signup'
          ? <SignUp key="signup" onSuccess={onLogin} onSwitch={() => setMode('signin')} />
          : <SignIn key="signin" onSuccess={onLogin} onSwitch={() => setMode('signup')} />
        }
      </AnimatePresence>
    </div>
  )
}
