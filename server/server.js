const express = require('express')

const cors = require('cors')

require('dotenv').config()

const authRoutes =
  require('./routes/auth.routes')

const habitRoutes =
  require('./routes/habit.routes')

const analyticsRoutes =
require('./routes/analytics.routes')

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)

app.use('/api/habits', habitRoutes)

app.use(
  '/api/analytics',
  analyticsRoutes
)

app.get('/', (req, res) => {

  res.json({
    message:
      'Backend running successfully'
  })

})

const PORT =
  process.env.PORT || 5000

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  )

})