import Header from '../components/core/Header'
import SummaryBar from '../components/core/SummaryBar'
import Tabs from '../components/core/Tabs'
import HabitList from '../components/core/HabitList'
import AddHabitSheet from '../components/bottomsheet/AddHabitSheet'

import { useHabits } from '../context/HabitContext'

export default function HomeScreen({

  openHabit

}) {

const {

  habits,
  addHabit,
  completeHabit

} = useHabits()

  return (

    <div className="min-h-screen bg-[#070B14] text-white">

      <div className="max-w-md mx-auto px-5 pb-32">

        <Header />

        <SummaryBar />

        <Tabs />

        <HabitList
          habits={habits}
          openHabit={openHabit}
          completeHabit={completeHabit}
        />

      </div>

      <AddHabitSheet
        addHabit={addHabit}
      />

    </div>

  )

}