import { useState, useEffect, useRef } from 'react'

import WelcomeScreen       from '../screens/WelcomeScreen'
import OnboardingScreen    from '../screens/OnboardingScreen'
import LoginScreen         from '../screens/LoginScreen'
import DashboardScreen     from '../screens/DashboardScreen'
import StatsScreen         from '../screens/StatsScreen'
import HabitDetailScreen   from '../screens/HabitDetailScreen'
import MilestoneScreen     from '../screens/MilestoneScreen'
import GraduationCeremony  from '../screens/GraduationCeremony'
import InstallPrompt       from '../components/ui/InstallPrompt'
import BuilderWizard       from '../components/builder/BuilderWizard'
import BottomTabBar        from '../components/core/BottomTabBar'
import { scheduleNudges, isNotifEnabled } from '../utils/notifications'
import useHabitStore       from '../store/useHabitStore'
import { pushToCloud }     from '../utils/sync'

function initialScreen() {
  if (localStorage.getItem('streak-auth')) return 'dashboard'
  return 'welcome'
}

export default function AppNavigator() {
  const [screen,          setScreen]          = useState(initialScreen)
  const [activeTab,       setActiveTab]        = useState('home')
  const [selectedHabit,   setSelectedHabit]   = useState(null)
  const [showInstall,      setShowInstall]      = useState(false)
  const [installDismissed, setInstallDismissed] = useState(
    !!localStorage.getItem('streak-install-dismissed')
  )
  const installTriggeredRef = useRef(false)
  const [builderData,     setBuilderData]      = useState(null)  // { name, emoji }
  const [graduatedHabit,  setGraduatedHabit]   = useState(null)  // habit object
  const [previewGrad,     setPreviewGrad]      = useState(false)

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

  // Show install prompt once per session when user reaches dashboard
  useEffect(() => {
    if (screen !== 'dashboard') return
    if (installTriggeredRef.current) return
    if (localStorage.getItem('streak-install-dismissed')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    installTriggeredRef.current = true
    const t = setTimeout(() => setShowInstall(true), 5000)
    return () => clearTimeout(t)
  }, [screen])

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
    setActiveTab('home')
    setScreen('dashboard')
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
    setPreviewGrad(false)
    setGraduatedHabit(habit)
    setScreen('graduation')
  }

  // DEV-only: preview the graduation ceremony without touching streak data
  const openPreviewGraduation = () => {
    setPreviewGrad(true)
    setGraduatedHabit({
      name: 'Morning Run',
      emoji: '🏃',
      identityStatement: 'shows up every day no matter what',
      mode: 'building',
    })
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

      {screen === 'dashboard' && activeTab === 'home' && (
        <DashboardScreen
          openHabit={openHabit}
          openBuilder={openBuilder}
          openGraduation={openGraduation}
          openMilestone={() => setScreen('milestone')}
          onPreviewGraduation={openPreviewGraduation}
          showInstallBanner={installDismissed}
          onInstall={() => {
            const p = window.__deferredInstallPrompt
            if (p) {
              p.prompt()
              p.userChoice.then(() => {
                window.__deferredInstallPrompt = null
                setInstallDismissed(false)
              })
            }
          }}
        />
      )}

      {screen === 'dashboard' && activeTab === 'stats' && (
        <StatsScreen />
      )}

      {screen === 'dashboard' && (
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
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
          onDone={() => { setPreviewGrad(false); setScreen('dashboard') }}
          isPreview={previewGrad}
        />
      )}

      {/* Only show install prompt when user is on the dashboard, not mid-wizard or mid-flow */}
      {screen === 'dashboard' && (
        <InstallPrompt
          show={showInstall}
          onDismiss={() => {
            setShowInstall(false)
            setInstallDismissed(true)
            localStorage.setItem('streak-install-dismissed', '1')
          }}
        />
      )}
    </>
  )
}
