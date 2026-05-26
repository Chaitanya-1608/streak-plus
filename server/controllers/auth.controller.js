const supabase = require('../config/supabase')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const { sendWelcomeEmail, sendAdminNewUser } = require('../utils/email')

const makeToken = (user) =>
  jwt.sign({ id: String(user.id), email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' })

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    if (!firstName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const name = `${firstName.trim()} ${(lastName || '').trim()}`.trim()

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email: email.toLowerCase().trim(), password: hashedPassword }])
      .select()
      .single()

    if (error) {
      // Duplicate email → unique constraint violation
      const isDupe = error.code === '23505' || (error.message || '').includes('unique')
      return res.status(400).json({
        success: false,
        message: isDupe ? 'Email already registered' : error.message,
      })
    }

    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const userNumber = (count || 1) + 99

    // Fire-and-forget notifications
    sendWelcomeEmail(data.email, firstName).catch(() => {})
    sendAdminNewUser({ name, email: data.email, userNumber }).catch(() => {})

    res.json({ success: true, token: makeToken(data), userId: String(data.id), userNumber })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, data.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' })
    }

    res.json({
      success: true,
      token: makeToken(data),
      userId: String(data.id),
      user: { id: String(data.id), name: data.name, email: data.email },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}
