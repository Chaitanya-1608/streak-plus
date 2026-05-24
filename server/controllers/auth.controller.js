const supabase = require('../config/supabase')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

exports.register = async (req, res) => {
  try {

    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword
        }
      ])
      .select()

    if (error) {
      return res.status(400).json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      message: 'User registered successfully',
      data
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }
}

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    const isMatch = await bcrypt.compare(
      password,
      data.password
    )

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      })
    }
    const token = jwt.sign(
  {
    id: data.id,
    email: data.email
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '7d'
  }
)

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email
      }
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }

}