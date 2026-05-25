import { useState, useEffect } from 'react'

import WelcomeScreen from '../screens/WelcomeScreen'
import LoginScreen from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import HabitDetailScreen from '../screens/HabitDetailScreen'
import MilestoneScreen from '../screens/MilestoneScreen'

export default function AppNavigator() {

  const [screen, setScreen] =
    useState('welcome')

  const [selectedHabit, setSelectedHabit] =
    useState(null)

  useEffect(() => {

    const auth =
      localStorage.getItem('streak-auth')

    if(auth){

      setScreen('dashboard')

    }

  }, [])

  const openHabit = (habit) => {

    setSelectedHabit(habit)

    setScreen('habit')

  }

  return (

    <>

      {screen === 'welcome' && (

        <WelcomeScreen
          onContinue={() =>
            setScreen('login')
          }
        />

      )}

      {screen === 'login' && (

        <LoginScreen
          onLogin={() =>
            setScreen('dashboard')
          }
        />

      )}

      {screen === 'dashboard' && (

        <DashboardScreen
          openHabit={openHabit}
          openMilestone={() =>
            setScreen('milestone')
          }
        />

      )}

      {screen === 'habit' && (

        <HabitDetailScreen
          habit={selectedHabit}
          goBack={() =>
            setScreen('dashboard')
          }
        />

      )}

      {screen === 'milestone' && (

        <MilestoneScreen
          goBack={() =>
            setScreen('dashboard')
          }
        />

      )}

    </>

  )

}