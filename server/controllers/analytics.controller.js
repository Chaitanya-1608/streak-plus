const supabase =
  require('../config/supabase')

const calculateStreak = (
  dates
) => {

  if (!dates.length)
    return 0

  const sortedDates =
    dates
      .map(date =>
        new Date(date)
      )
      .sort(
        (a, b) => b - a
      )

  let streak = 0

  const today =
    new Date()

  today.setHours(0, 0, 0, 0)

  for (
    let i = 0;
    i < sortedDates.length;
    i++
  ) {

    const entryDate =
      new Date(
        sortedDates[i]
      )

    entryDate.setHours(
      0, 0, 0, 0
    )

    const diffTime =
      today - entryDate

    const diffDays =
      Math.floor(
        diffTime /
        (
          1000 *
          60 *
          60 *
          24
        )
      )

    if (diffDays === i) {

      streak++

    } else {

      break

    }

  }

  return streak

}

const calculateLongestStreak = (
  dates
) => {

  if (!dates.length)
    return 0

  const sorted =
    dates
      .map(date =>
        new Date(date)
      )
      .sort(
        (a, b) => a - b
      )

  let longest = 1

  let current = 1

  for (
    let i = 1;
    i < sorted.length;
    i++
  ) {

    const prev =
      sorted[i - 1]

    const curr =
      sorted[i]

    const diff =
      (
        curr - prev
      ) / (
        1000 *
        60 *
        60 *
        24
      )

    if (diff === 1) {

      current++

      if (
        current > longest
      ) {

        longest = current

      }

    } else {

      current = 1

    }

  }

  return longest

}

const getOverview =
async (req, res) => {

  try {

    const { data: habits } =
      await supabase
        .from('habits')
        .select('*')

    const { data: entries } =
      await supabase
        .from('habit_entries')
        .select('*')

    const totalHabits =
      habits.length

    const totalCompletions =
      entries.length

    const xp =
      totalCompletions * 10

    const level =
      Math.floor(xp / 100) + 1

    const consistency =
      totalHabits === 0
        ? 0
        : Math.round(
            (
              totalCompletions /
              (totalHabits * 30)
            ) * 100
          )

    const dates =
      entries.map(
        entry =>
          entry.completed_date
      )

    const currentStreak =
      calculateStreak(
        dates
      )

    const longestStreak =
      calculateLongestStreak(
        dates
      )

    const heatmapMap = {}

    entries.forEach((entry) => {

      const date =
        entry.completed_date

      if (!heatmapMap[date]) {

        heatmapMap[date] = 0

      }

      heatmapMap[date]++

    })

    const heatmapData = []

    for (
      let i = 29;
      i >= 0;
      i--
    ) {

      const date =
        new Date()

      date.setDate(
        date.getDate() - i
      )

      const formatted =
        date
          .toISOString()
          .split('T')[0]

      heatmapData.push({

        date: formatted,

        count:
          heatmapMap[
            formatted
          ] || 0

      })

    }
const insights = []

if (currentStreak > 0) {

  insights.push(
    `🔥 You're on a ${currentStreak} day streak`
  )

}

if (longestStreak >= 2) {

  insights.push(
    `🏆 Your longest streak is ${longestStreak} days`
  )

}

if (consistency >= 5) {

  insights.push(
    '📈 Your consistency is improving'
  )

}

if (
  xp % 100 <= 30
) {

  insights.push(
    `⚡ ${
      100 - (xp % 100)
    } XP left for next level`
  )

}

if (
  totalCompletions >= 10
) {

  insights.push(
    `✅ You've completed ${totalCompletions} habits`
  )

}

if (
  insights.length === 0
) {

  insights.push(
    '🚀 Start completing habits to build momentum'
  )


}
    res.json({

      success: true,

      analytics: {

        totalHabits,

        totalCompletions,

        xp,

        level,

        consistency,

        currentStreak,

        longestStreak,

        heatmapData,
        insights

      }

    })

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message

    })

  }

}

module.exports = {
  getOverview
}