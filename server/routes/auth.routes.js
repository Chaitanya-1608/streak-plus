const express = require('express')
const dns     = require('dns').promises

const router = express.Router()

const { protect }          = require('../middleware/auth.middleware')
const { sendWelcomeEmail } = require('../utils/email')

const {
  register,
  login
} = require('../controllers/auth.controller')

// Validate email domain via MX record lookup (no OTP required)
async function domainHasMX(email) {
  try {
    const domain  = email.trim().split('@')[1]
    const records = await dns.resolveMx(domain)
    return Array.isArray(records) && records.length > 0
  } catch {
    return false
  }
}

// POST /api/auth/welcome
// Called by the client after local sign-up.
// 1) Checks the email domain is real (MX record).
// 2) Sends a welcome email via Resend.
// Returns 400 if the domain is invalid; 200 otherwise (email errors are non-fatal).
router.post('/welcome', async (req, res) => {
  const { email, firstName } = req.body

  if (!email || !firstName) {
    return res.status(400).json({ ok: false, message: 'Missing fields' })
  }

  const valid = await domainHasMX(email)
  if (!valid) {
    return res.status(400).json({
      ok: false,
      field: 'email',
      message: 'This email address doesn\'t look real. Please use a valid email.',
    })
  }

  // Send welcome email — non-fatal if it fails
  try {
    await sendWelcomeEmail(email.trim(), firstName.trim())
  } catch (err) {
    console.error('[welcome] email error (non-fatal):', err.message)
  }

  res.json({ ok: true })
})

router.post('/register', register)

router.post('/login', login)

router.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes working'
  })
})

router.get('/profile', protect, (req, res) => {

  res.json({
    success: true,
    message: 'Protected profile route',
    user: req.user
  })

})

module.exports = router