const express = require('express')

const cors = require('cors')

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

// ROUTES

app.use(
  '/api/auth',
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