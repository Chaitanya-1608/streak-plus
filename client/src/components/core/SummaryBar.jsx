import useHabitStore from '../../store/useHabitStore'

export default function SummaryBar() {
  const { habits, getTodayCount, getTopStreak, getAllTimeCompletions } = useHabitStore()

  const todayCount    = getTodayCount()
  const topStreak     = getTopStreak()
  const allTime       = getAllTimeCompletions()
  const total         = habits.length

  const stats = [
    { value: `${todayCount}/${total}`, label: 'Today',      accent: false },
    { value: topStreak,                label: 'Top streak',  accent: true  },
    { value: allTime,                  label: 'All time',    accent: false },
  ]

  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      {stats.map(({ value, label, accent }) => (
        <div
          key={label}
          className={`rounded-[20px] border p-4 ${
            accent
              ? 'bg-accent/10 border-accent/25'
              : 'bg-surface border-surface2'
          }`}
        >
          <div className={`text-2xl font-heading ${accent ? 'text-accent' : 'text-white'}`}>
            {value}
          </div>
          <div className="text-zinc-500 text-xs mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}
