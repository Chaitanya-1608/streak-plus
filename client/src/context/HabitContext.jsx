import {

  createContext,
  useContext,
  useEffect,
  useState

} from 'react'

const HabitContext =
  createContext()

export function HabitProvider({

  children

}) {

  const [habits, setHabits] =
    useState([])

  const [loaded, setLoaded] =
    useState(false)

  useEffect(() => {

    const saved =
      localStorage.getItem('streak-habits')

    if (saved) {

      setHabits(JSON.parse(saved))

    }

    setLoaded(true)

  }, [])

  useEffect(() => {

    if (!loaded) return

    localStorage.setItem(

      'streak-habits',

      JSON.stringify(habits)

    )

  }, [habits, loaded])

  const addHabit = (habit) => {

    setHabits(prev => [

      ...prev,

      {
        id: Date.now(),
        streak: 0,
        completed: false,
        ...habit
      }

    ])

  }

  const completeHabit = (id) => {

    setHabits(prev =>

      prev.map(habit =>

        habit.id === id
          ? {
              ...habit,
              completed: true,
              streak: habit.streak + 1
            }
          : habit

      )

    )

  }

  return (

    <HabitContext.Provider
      value={{
        habits,
        addHabit,
        completeHabit
      }}
    >

      {children}

    </HabitContext.Provider>

  )

}

export function useHabits() {

  return useContext(HabitContext)

}