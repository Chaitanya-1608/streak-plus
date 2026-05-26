import { useState, useEffect } from 'react'

import WelcomeScreen     from '../screens/WelcomeScreen'
import OnboardingScreen  from '../screens/OnboardingScreen'
import LoginScreen       from '../screens/LoginScreen'
import DashboardScreen   from '../screens/DashboardScreen'
import HabitDetailScreen from '../screens/HabitDetailScreen'
import MilestoneScreen   from '../screens/MilestoneScreen'
import InstallPrompt     from '../components/ui/InstallPrompt'
import { scheduleNudges, isNotifEnabled } from '../utils/notifications'
import useHabitStore          from '../store/useHabitStore'
import { pushToCloud }        from '../utils/sync'

function initialScreen() {
  if (localStorage.getItem('streak-auth'))       return 'dashboard'
  if (localStorage.getItem('streak-onboarded'))  return 'welcome'
  return 'welcome'
}

export default function AppNavigator() {
  const [screen,        setScreen]        = useState(initialScreen)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showInstall,   setShowInstall]   = useState(false)

  // Capture browser install prompt before it fires
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); window.__deferredInstallPrompt = e }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Re-schedule nudges if returning user already granted permission
  useEffect(() => {
    if (localStorage.getItem('streak-auth') && isNotifEnabled()) scheduleNudges()
  }, [])

  // When device comes back online, push any locally queued changes to cloud
  useEffect(() => {
    const flush = () => {
      const { habits, completions } = useHabitStore.getState()
      pushToCloud(habits, completions)
    }
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [])

  const handleWelcomeContinue = () => {
    // First-time users get the interactive onboarding; returning visitors go straight to login
    if (localStorage.getItem('streak-onboarded')) {
      setScreen('login')
    } else {
      setScreen('onboarding')
    }
  }

  const handleLogin = (email) => {
    useHabitStore.getState().loadForUser(email)
    setScreen('dashboard')
    setTimeout(() => setShowInstall(true), 600)
  }

  const openHabit = (habit) => {
    setSelectedHabit(habit)
    setScreen('habit')
  }

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onContinue={handleWelcomeContinue} />
      )}

      {screen === 'onboarding' && (
        <OnboardingScreen onDone={() => setScreen('login')} />
      )}

      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {screen === 'dashboard' && (
        <DashboardScreen openHabit={openHabit} openMilestone={() => setScreen('milestone')} />
      )}

      {screen === 'habit' && (
        <HabitDetailScreen habit={selectedHabit} goBack={() => setScreen('dashboard')} />
      )}

      {screen === 'milestone' && (
        <MilestoneScreen goBack={() => setScreen('dashboard')} />
      )}

      <InstallPrompt show={showInstall} onDismiss={() => setShowInstall(false)} />
    </>
  )
}
