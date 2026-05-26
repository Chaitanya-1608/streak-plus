import { useState, useEffect } from 'react'

import WelcomeScreen       from '../screens/WelcomeScreen'
import OnboardingScreen    from '../screens/OnboardingScreen'
import LoginScreen         from '../screens/LoginScreen'
import DashboardScreen     from '../screens/DashboardScreen'
import HabitDetailScreen   from '../screens/HabitDetailScreen'
import MilestoneScreen     from '../screens/MilestoneScreen'
import GraduationCeremony  from '../screens/GraduationCeremony'
import InstallPrompt       from '../components/ui/InstallPrompt'
import BuilderWizard       from '../components/builder/BuilderWizard'
import { scheduleNudges, isNotifEnabled } from '../utils/notifications'
import useHabitStore       from '../store/useHabitStore'
import { pushToCloud }     from '../utils/sync'

function initialScreen() {
  if (localStorage.getItem('streak-auth')) return 'dashboard'
  return 'welcome'
}

export default function AppNavigator() {
  const [screen,          setScreen]          = useState(initialScreen)
  const [selectedHabit,   setSelectedHabit]   = useState(null)
  const [showInstall,     setShowInstall]      = useState(false)
  const [builderData,     setBuilderData]      = useState(null)  // { name, emoji }
  const [graduatedHabit,  setGraduatedHabit]   = useState(null)  // habit object

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
    const hasAccounts = JSON.parse(localStorage.getItem('streak-users') || '[]').length > 0
    if (hasAccounts || localStorage.getItem('streak-onboarded')) {
      setScreen('login')
    } else {
      setScreen('onboarding')
    }
  }

  const handleLogin = (email) => {
    useHabitStore.getState().loadForUser(email)
    setScreen('dashboard')
    setTimeout(() => setShowInstall(true), 5000)
  }

  const openHabit = (habit) => {
    setSelectedHabit(habit)
    setScreen('habit')
  }

  // Called by AddHabitSheet when user picks Build mode
  const openBuilder = ({ name, emoji }) => {
    setBuilderData({ name, emoji })
    setScreen('builder')
  }

  // Called by DashboardScreen when a habit graduates
  const openGraduation = (habit) => {
    setGraduatedHabit(habit)
    setScreen('graduation')
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
        <DashboardScreen
          openHabit={openHabit}
          openBuilder={openBuilder}
          openGraduation={openGraduation}
          openMilestone={() => setScreen('milestone')}
        />
      )}

      {screen === 'habit' && (
        <HabitDetailScreen habit={selectedHabit} goBack={() => setScreen('dashboard')} />
      )}

      {screen === 'milestone' && (
        <MilestoneScreen goBack={() => setScreen('dashboard')} />
      )}

      {screen === 'builder' && builderData && (
        <BuilderWizard
          habitName={builderData.name}
          habitEmoji={builderData.emoji}
          onDone={() => setScreen('dashboard')}
          onCancel={() => setScreen('dashboard')}
        />
      )}

      {screen === 'graduation' && graduatedHabit && (
        <GraduationCeremony
          habit={graduatedHabit}
          onDone={() => setScreen('dashboard')}
        />
      )}

      {/* Only show install prompt when user is on the dashboard, not mid-wizard or mid-flow */}
      {screen === 'dashboard' && (
        <InstallPrompt show={showInstall} onDismiss={() => setShowInstall(false)} />
      )}
    </>
  )
}
