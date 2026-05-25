const mongoose = require('mongoose')

const HabitSchema =
new mongoose.Schema({

  userId: String,

  name: String,

  emoji: String,

  target: Number,

  unit: String,

  progress: Number,

  streak: Number

})

module.exports =
mongoose.model(
  'Habit',
  HabitSchema
)