const express = require('express')

const router = express.Router()

const { protect } = require('../middleware/auth.middleware')

const {
  register,
  login
} = require('../controllers/auth.controller')

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