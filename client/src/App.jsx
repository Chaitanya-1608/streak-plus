import AppNavigator from './navigation/AppNavigator'

// Wrap the entire app in a centered 390px mobile shell.
// Fixed-position children (sheet, FAB) must also use this
// centering approach — see AddHabitSheet for the pattern.
function App() {
  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div id="app-shell" className="relative w-full max-w-[390px] min-h-screen bg-bg overflow-hidden">
        <AppNavigator />
      </div>
    </div>
  )
}

export default App
