import { motion } from 'framer-motion'
import HabitCard from './HabitCard'

export default function HabitList({ habits, openHabit }) {
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-20 text-center px-4"
      >
        <div className="text-7xl animate-flicker">🔥</div>
        <h2 className="font-heading text-2xl text-white mt-6">Start your streak.</h2>
        <p className="text-zinc-500 mt-3 leading-relaxed text-sm">
          Small daily actions become identity over time.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="mt-5 space-y-4">
      {habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} openHabit={openHabit} />
      ))}
    </div>
  )
}
