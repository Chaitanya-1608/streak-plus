import { useState, useEffect } from 'react'

import WelcomeScreen     from '../screens/WelcomeScreen'
import LoginScreen       from '../screens/LoginScreen'
import DashboardScreen   from '../screens/DashboardScreen'
import HabitDetailScreen from '../screens/HabitDetailScreen'
import MilestoneScreen   from '../screens/MilestoneScreen'
import InstallPrompt     from '../components/ui/InstallPrompt'
import { scheduleNudges, isNotifEnabled } from '../utils/notifications'

export default function AppNavigator() {
  const [screen,        setScreen]        = useState('welcome')
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [showInstall,   setShowInstall]   = useState(false)

  // Capture browser install prompt before it fires
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      window.__deferredInstallPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (localStorage.getItem('streak-auth')) {
      setScreen('dashboard')
      // Re-schedule nudges if permission already granted
      if (isNotifEnabled()) scheduleNudges()
    }
  }, [])

  const handleLogin = () => {
    setScreen('dashboard')
    // Short delay so the dashboard renders first, then slide up install prompt
    setTimeout(() => setShowInstall(true), 600)
  }

  const openHabit = (habit) => {
    setSelectedHabit(habit)
    setScreen('habit')
  }

  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen onContinue={() => setScreen('login')} />
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

      {/* Install prompt — floats above all screens, scoped inside shell */}
      <InstallPrompt show={showInstall} onDismiss={() => setShowInstall(false)} />
    </>
  )
}
