import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { requestAndSchedule } from '../../utils/notifications'

const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

const STEPS_IOS = [
  ['Tap the', 'Share button', '(box ↑ arrow) at the bottom of Safari'],
  ['Scroll and tap', 'Add to Home Screen', ''],
  ['Tap', 'Add', 'in the top right'],
]
const STEPS_ANDROID = [
  ['Tap the', '⋮ menu', 'in the top-right corner of Chrome'],
  ['Tap', 'Add to Home screen', 'or Install app'],
  ['Tap', 'Add', 'to confirm'],
]

function Steps() {
  const steps = isIOS ? STEPS_IOS : STEPS_ANDROID
  return (
    <div className="mt-5 bg-surface2 rounded-[20px] px-4 py-4 space-y-3">
      {steps.map(([pre, bold, post], i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <p className="text-zinc-400 text-sm leading-snug">
            {pre} <span className="text-white font-medium">{bold}</span> {post}
          </p>
        </div>
      ))}
    </div>
  )
}

export default function InstallPrompt({ show, onDismiss }) {
  if (isStandalone) return null

  const [showSteps, setShowSteps] = useState(false)

  const handleInstall = async () => {
    await requestAndSchedule()
    const prompt = window.__deferredInstallPrompt
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      window.__deferredInstallPrompt = null
      if (outcome === 'accepted') { onDismiss(); return }
    }
    // No native prompt or user declined → show manual steps
    setShowSteps(true)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onDismiss}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface2 rounded-t-[28px] px-6 pt-6 pb-10 z-50"
          >
            <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-6" />

            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-gold to-accent flex items-center justify-center text-3xl mx-auto shadow-[0_0_24px_rgba(219,173,40,0.3)]">
              🔥
            </div>

            <div className="text-center mt-5">
              <h2 className="font-heading text-xl text-white">
                {showSteps ? 'How to install' : 'Add to Home Screen'}
              </h2>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                {showSteps
                  ? 'Follow these steps to add Streak+ to your home screen.'
                  : 'Get daily nudges and access your streaks instantly — even offline.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {showSteps ? (
                <motion.div
                  key="steps"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <Steps />
                </motion.div>
              ) : (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                >
                  <div className="mt-5 bg-surface2 rounded-[16px] px-4 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      🔔
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Streak+</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Still to do today: Morning Run · Read 20 pages</p>
                    </div>
                  </div>
                  <p className="text-center text-zinc-700 text-[10px] mt-2">Nudged twice a day, softly</p>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleInstall}
                    className="w-full mt-6 py-4 rounded-[18px] bg-accent text-bg font-heading text-base"
                  >
                    Install Streak+
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={onDismiss} className="w-full mt-3 py-3 text-zinc-600 text-sm">
              {showSteps ? 'Got it' : 'Not now'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
