const express   = require('express')
const cors      = require('cors')
const rateLimit = require('express-rate-limit')

require('dotenv').config()

const authRoutes =
  require('./routes/auth.routes')

const habitRoutes =
  require('./routes/habit.routes')

const analyticsRoutes =
  require('./routes/analytics.routes')

const syncRoutes =
  require('./routes/sync.routes')

const feedbackRoutes =
  require('./routes/feedback.routes')

const app = express()

// Trust Render's reverse proxy so rate limiting uses real client IPs
app.set('trust proxy', 1)

// CORS

app.use(cors({

  origin: '*',

  methods: [

    'GET',
    'POST',
    'PUT',
    'DELETE'

  ],

  credentials: true

}))

// BODY PARSER

app.use(express.json())

// RATE LIMITING

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
})

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many feedback submissions.' },
})

// ROUTES

app.use(
  '/api/auth',
  authLimiter,
  authRoutes
)

app.use(
  '/api/habits',
  habitRoutes
)

app.use(
  '/api/analytics',
  analyticsRoutes
)

app.use(
  '/api/sync',
  syncRoutes
)

app.use(
  '/api/feedback',
  feedbackLimiter,
  feedbackRoutes
)

// HEALTH CHECK

app.get('/', (req, res) => {

  res.json({

    success: true,

    message:
      'Streak+ API running successfully'

  })

})

// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {

  console.error(err)

  res.status(500).json({

    success: false,

    message:
      'Internal server error'

  })

})

// START SERVER

const PORT =
  process.env.PORT || 5000

app.listen(PORT, () => {

  console.log(

    `🚀 Server running on port ${PORT}`

  )

})