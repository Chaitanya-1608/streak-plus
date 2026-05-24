const express = require('express')

const router = express.Router()

const { protect } = require('../middleware/auth.middleware')

const {
  createHabit,
  getHabits,
  completeHabit,
  getHabitStreak
} = require('../controllers/habit.controller')

router.post('/', protect, createHabit)

router.get('/', protect, getHabits)

router.post('/:id/complete', protect, completeHabit)

router.get('/:id/streak', protect, getHabitStreak)

module.exports = router