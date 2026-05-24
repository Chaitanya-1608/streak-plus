const supabase = require('../config/supabase')

exports.createHabit = async (req, res) => {

  try {

    const { title, description } = req.body

    const userId = req.user.id

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          user_id: userId,
          title,
          description
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
      message: 'Habit created successfully',
      data
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }

}
exports.getHabits = async (req, res) => {

  try {

    const userId = req.user.id

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false
      })

    if (error) {
      return res.status(400).json({
        success: false,
        error
      })
    }

    res.json({
      success: true,
      habits: data
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }

}
exports.completeHabit = async (req, res) => {

  try {

    const habitId = req.params.id

    const userId = req.user.id

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('habit_entries')
      .insert([
        {
          habit_id: habitId,
          user_id: userId,
          completed_date: today
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
      message: 'Habit marked complete',
      data
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }

}
exports.getHabitStreak = async (req, res) => {

  try {

    const habitId = req.params.id

    const { data, error } = await supabase
      .from('habit_entries')
      .select('*')
      .eq('habit_id', habitId)
      .order('completed_date', {
        ascending: false
      })

    if (error) {
      return res.status(400).json({
        success: false,
        error
      })
    }

    let streak = 0

    const today = new Date()

    for (let i = 0; i < data.length; i++) {

      const entryDate = new Date(data[i].completed_date)

      const diffTime = today - entryDate

      const diffDays = Math.floor(
        diffTime / (1000 * 60 * 60 * 24)
      )

      if (diffDays === i) {
        streak++
      } else {
        break
      }

    }

    res.json({
      success: true,
      streak,
      completions: data
    })

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    })

  }

}