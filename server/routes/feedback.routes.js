const express  = require('express')
const router   = express.Router()
const { submit } = require('../controllers/feedback.controller')

// Optional JWT auth — attach req.user if token present, but don't require it
const jwt = require('jsonwebtoken')
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
    } catch {}
  }
  next()
}

router.post('/', optionalAuth, submit)

module.exports = router
