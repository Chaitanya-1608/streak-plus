import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/core/Header'
import HabitList from '../components/core/HabitList'
import AddHabitSheet from '../components/bottomsheet/AddHabitSheet'
import useHabitStore, { localISO } from '../store/useHabitStore'
import { requestAndSchedule, isNotifEnabled } from '../utils/notifications'

const TODAY_ISO  = localISO()
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const CIRC       = 2 * Math.PI * 44

const MILESTONE_NAMES = {
  7: 'Sprout', 14: 'Builder', 21: 'Habit',
  30: 'Warrior', 60: 'Champion', 100: 'Legend', 200: 'Master', 365: 'Obsidian',
}

const MILESTONE_EMOJI = {
  7: '🌱', 14: '🔨', 21: '💪', 30: '⚔️', 60: '🏆', 100: '🌟', 200: '🔮', 365: '💎',
}

function nextMilestone(streak) {
  return [21, 30, 60, 100, 200, 365].find(m => m > streak) || null
}

// ── Streak ring ─────────────────────────────────────────────────────────────
function StreakRing({ streak }) {
  const next     = nextMilestone(streak) || Math.max(streak, 1)
  const fraction = Math.min(streak / next, 1)
  const offset   = CIRC * (1 - fraction)
  const ringRef  = useRef(null)

  useEffect(() => {
    if (!ringRef.current) return
    ringRef.current.style.strokeDashoffset = CIRC
    requestAnimationFrame(() => {
      if (!ringRef.current) return
      ringRef.current.style.transition = 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)'
      ringRef.current.style.strokeDashoffset = offset
    })
  }, [offset])

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#1c1508" strokeWidth="8" />
        <circle
          ref={ringRef}
          cx="50" cy="50" r="44"
          fill="none" stroke="#DBAD28" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-[26px] text-white leading-none">{streak}</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider mt-0.5">days</span>
      </div>
    </div>
  )
}

// ── Hero copy + pills ───────────────────────────────────────────────────────
function HeroCopy({ streak, personalBest }) {
  const next        = nextMilestone(streak)
  const daysToNext  = next ? next - streak : null
  const isPersonalBest = streak > 0 && streak >= personalBest

  let headline, subline
  if (streak === 0) {
    headline = 'Start your streak 🌱'
    subline  = 'Complete a habit today to begin.'
  } else if (streak < 7) {
    headline = 'Building momentum 💪'
    subline  = daysToNext ? `${daysToNext} more days to your first badge.` : 'Keep showing up!'
  } else if (isPersonalBest) {
    headline = 'Your longest ever! 🔥'
    subline  = daysToNext
      ? `You're on fire. ${daysToNext} more days to unlock the ${MILESTONE_NAMES[next]} badge.`
      : 'You set a new personal record!'
  } else {
    headline = `${streak}-day streak 🔥`
    subline  = daysToNext ? `${daysToNext} more days to the ${MILESTONE_NAMES[next]} badge.` : 'Incredible dedication!'
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="font-heading text-[15px] text-white leading-snug">{headline}</p>
      <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{subline}</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        {streak > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-accent/15 border border-accent/20 text-accent text-[11px]">
            🔥 On fire
          </span>
        )}
        {isPersonalBest && (
          <span className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px]">
            🏆 Personal best
          </span>
        )}
      </div>
    </div>
  )
}

// ── Week strip ──────────────────────────────────────────────────────────────
function WeekStrip({ weekSummary }) {
  return (
    <div className="mt-5 pt-4 border-t border-surface2">
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">This week</p>
      <div className="flex justify-between">
        {weekSummary.map(({ date, completedCount, totalHabits }, i) => {
          const isToday   = date === TODAY_ISO
          const isPast    = date < TODAY_ISO
          const allDone   = totalHabits > 0 && completedCount >= totalHabits
          const someDone  = completedCount > 0 && !allDone

          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-zinc-600">{DAY_LABELS[i]}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold ${
                allDone   ? 'bg-accent text-bg'
                : someDone  ? 'bg-accent/20 text-transparent'
                : isToday   ? 'border-2 border-accent/40 text-transparent'
                : isPast    ? 'bg-surface2 text-transparent'
                :             'bg-surface2 opacity-25 text-transparent'
              }`}>
                {allDone ? '✓' : ''}
                {someDone && !isToday ? <span className="w-1.5 h-1.5 rounded-full bg-accent/60 block" /> : null}
                {isToday && !allDone && !someDone ? <span className="w-1.5 h-1.5 rounded-full bg-accent/50 block" /> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mini heatmap ─────────────────────────────────────────────────────────────
function MiniHeatmap() {
  const { habits, completions } = useHabitStore()

  const today = new Date()
  const cells = Array.from({ length: 70 }, (_, i) => {
    const d     = new Date(today); d.setDate(today.getDate() - (69 - i))
    const iso   = localISO(d)
    const count = habits.filter(h => (completions[h.id] || []).includes(iso)).length
    const pct   = habits.length > 0 ? count / habits.length : 0
    return { iso, pct }
  })

  const cols = Array.from({ length: 10 }, (_, w) => cells.slice(w * 7, w * 7 + 7))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-6 pb-4"
    >
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Activity</p>
      <div className="flex gap-1.5">
        {cols.map((col, w) => (
          <div key={w} className="flex flex-col gap-1.5 flex-1">
            {col.map(({ iso, pct }) => (
              <div
                key={iso}
                className={`aspect-square rounded-full ${iso === TODAY_ISO ? 'ring-2 ring-gold/50 ring-offset-1 ring-offset-bg' : ''} ${
                  pct === 0 ? 'bg-surface2' :
                  pct < 0.5 ? 'bg-accent/30' :
                  pct < 1   ? 'bg-accent/60' :
                               'bg-accent'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Nth user welcome card ────────────────────────────────────────────────────
function UserNumberCard() {
  const raw = localStorage.getItem('streak-user-number')
  const [visible, setVisible] = useState(!!raw)

  if (!visible || !raw) return null
  const n = parseInt(raw, 10)

  const ordinal = (num) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = num % 100
    return num + (s[(v - 20) % 10] || s[v] || s[0])
  }

  const dismiss = () => {
    localStorage.removeItem('streak-user-number')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border border-gold/20"
        >
          <span className="text-lg flex-shrink-0">🎉</span>
          <p className="flex-1 text-zinc-400 text-xs leading-snug">
            You are our <span className="text-gold font-semibold">{ordinal(n)} user</span>. Welcome to the club.
          </p>
          <button onClick={dismiss} className="text-zinc-700 text-sm flex-shrink-0">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Notification nudge card ──────────────────────────────────────────────────
function NotifCard() {
  const [visible, setVisible] = useState(
    'Notification' in window && Notification.permission === 'default'
  )

  const enable = async () => {
    await requestAndSchedule()
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="mt-4 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border border-surface2"
        >
          <span className="text-lg flex-shrink-0">🔔</span>
          <p className="flex-1 text-zinc-500 text-xs leading-snug">
            Get a soft nudge twice a day with your remaining habits.
          </p>
          <button onClick={enable} className="flex-shrink-0 px-3 py-1.5 rounded-[10px] bg-accent/15 text-accent text-xs font-medium">
            Enable
          </button>
          <button onClick={() => setVisible(false)} className="text-zinc-700 text-sm flex-shrink-0">✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, count, total }) {
  return (
    <div className="flex items-center justify-between mt-7 mb-1">
      <p className="text-[11px] text-zinc-500 uppercase tracking-widest">{label}</p>
      {total > 0 && (
        <p className="text-[11px] font-medium text-accent">{count} of {total} done</p>
      )}
    </div>
  )
}

// ── Dashboard ────────────────────────────────────────────────────────────────
// ── Grace recovery prompt ────────────────────────────────────────────────────
function GracePrompt({ habit, onRecover, onDismiss }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onDismiss}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface rounded-t-[28px] px-6 pt-6 pb-10 z-50"
      >
        <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-8" />

        {/* Dimmed flame */}
        <div className="text-7xl text-center mb-5" style={{ filter: 'grayscale(1) opacity(0.25)' }}>
          🔥
        </div>

        <h2
          className="font-heading text-white text-center leading-tight mb-2"
          style={{ fontSize: 28, fontWeight: 800 }}
        >
          Your flame flickered.
        </h2>
        <p className="text-zinc-500 text-sm text-center mb-7">
          It's not out yet. Recover today.
        </p>

        <button
          onClick={onRecover}
          className="w-full py-4 rounded-[18px] bg-accent text-bg font-heading text-base mb-3"
          style={{ fontWeight: 800 }}
        >
          Recover my streak
        </button>

        <p className="text-zinc-700 text-xs text-center mb-4">
          You can do this once every 30 days
        </p>

        <button onClick={onDismiss} className="block mx-auto text-zinc-600 text-sm">
          Not now
        </button>
      </motion.div>
    </>
  )
}

// ── Simple toast ─────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-surface border border-surface2 text-white text-sm whitespace-nowrap z-[60] shadow-xl"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Milestone celebration bottom sheet ───────────────────────────────────────
function MilestoneCelebration({ data, onClose }) {
  const { habit, streak } = data
  const name  = MILESTONE_NAMES[streak] || `${streak} days`
  const badge = MILESTONE_EMOJI[streak] || '🎯'

  const handleShare = () => {
    const text = `${streak} days of ${habit.name}! I just hit the "${name}" milestone on Streak+. 🔥`
    const payload = { title: 'Streak+', text, url: 'https://streak-plus.vercel.app/' }
    if (navigator.share) {
      navigator.share(payload).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text}\nhttps://streak-plus.vercel.app/`).catch(() => {})
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-surface rounded-t-[28px] px-6 pt-6 pb-10 z-50"
      >
        <div className="w-10 h-1 rounded-full bg-surface2 mx-auto mb-6" />

        <div className="text-center mb-7">
          <div className="text-5xl mb-3">{habit.emoji || '🔥'}</div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <span className="text-sm">{badge}</span>
            <span className="text-accent text-xs font-medium tracking-wide">{name}</span>
          </div>
          <p className="font-heading text-[30px] text-white leading-tight">
            {streak} days
          </p>
          <p className="font-heading text-[20px] text-accent leading-tight mb-3">
            {habit.name}
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-[260px] mx-auto">
            Every action is a vote for the person you're becoming.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleShare}
          className="w-full py-4 rounded-[18px] bg-accent text-bg font-heading text-base mb-3"
        >
          Share this moment 🔗
        </motion.button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-[18px] bg-surface2 text-zinc-400 font-heading text-sm"
        >
          Keep going →
        </button>
      </motion.div>
    </>
  )
}

// ── Install banner (shown after user taps "Not now" on the install sheet) ────
function InstallBanner({ onInstall }) {
  if (window.matchMedia('(display-mode: standalone)').matches) return null
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border border-surface2"
    >
      <span className="text-lg flex-shrink-0">📲</span>
      <p className="flex-1 text-zinc-500 text-xs leading-snug">
        {isIOS
          ? 'Tap Share → Add to Home Screen to install Streak+.'
          : 'Add to home screen for offline access and daily nudges.'}
      </p>
      {!isIOS && (
        <button
          onClick={onInstall}
          className="flex-shrink-0 px-3 py-1.5 rounded-[10px] bg-accent/15 text-accent text-xs font-medium"
        >
          Install
        </button>
      )}
    </motion.div>
  )
}

export default function DashboardScreen({ openHabit, openBuilder, openGraduation, showInstallBanner, onInstall, onPreviewGraduation }) {
  const {
    habits, addHabit,
    getTodayCount, getTopStreak, getPersonalBest, getWeekSummary,
    checkGraduations, graduateHabit,
    checkGraceEligible, graceRecoverHabit,
    checkMilestones, markMilestoneCelebrated,
  } = useHabitStore()

  const topStreak    = getTopStreak()
  const personalBest = getPersonalBest()
  const weekSummary  = getWeekSummary()
  const todayCount   = getTodayCount()

  const longPressTimer = useRef(null)
  const startLongPress = useCallback(() => {
    if (!onPreviewGraduation) return
    longPressTimer.current = setTimeout(onPreviewGraduation, 2000)
  }, [onPreviewGraduation])
  const cancelLongPress = useCallback(() => clearTimeout(longPressTimer.current), [])

  const [graceHabit, setGraceHabit] = useState(null)
  const [showGrace,  setShowGrace]  = useState(false)
  const [milestone,  setMilestone]  = useState(null)
  const [toast,      setToast]      = useState('')

  const fireToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Check grace eligibility once on mount
  useEffect(() => {
    const eligible = checkGraceEligible()
    if (eligible) { setGraceHabit(eligible); setShowGrace(true) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGraceRecover = () => {
    graceRecoverHabit(graceHabit.id)
    setShowGrace(false)
    fireToast('Flame restored 🔥')
  }

  const buildHabits    = habits.filter(h => h.mode === 'building')
  const maintainHabits = habits.filter(h => h.mode !== 'building')

  // Check for habits that just completed 21-day trial
  useEffect(() => {
    const toGraduate = checkGraduations()
    if (toGraduate.length > 0) {
      toGraduate.forEach(h => graduateHabit(h.id))
      openGraduation(toGraduate[0])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Check for maintaining-habit streak milestones after each completion
  useEffect(() => {
    const hit = checkMilestones()
    if (hit) {
      markMilestoneCelebrated(hit.habit.id, hit.streak)
      setMilestone(hit)
    }
  }, [todayCount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="max-w-md mx-auto px-5 pb-44 pt-safe">
        <Header />
        <p className="text-zinc-600 text-xs mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 bg-surface rounded-[22px] p-5 border border-surface2"
        >
          <div className="flex items-center gap-4">
            <StreakRing streak={topStreak} />
            <HeroCopy streak={topStreak} personalBest={personalBest} />
          </div>
          <WeekStrip weekSummary={weekSummary} />
        </motion.div>

        <UserNumberCard />
        {showInstallBanner && <InstallBanner onInstall={onInstall} />}
        <NotifCard />

        {/* Building habits section */}
        {buildHabits.length > 0 && (
          <>
            <div
              className="flex items-center justify-between mt-7 mb-1"
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
            >
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Building 🌱</p>
              <p className="text-[11px] text-teal">21-day trial</p>
            </div>
            <HabitList habits={buildHabits} openHabit={openHabit} />
          </>
        )}

        {import.meta.env.DEV && onPreviewGraduation && (
          <button
            onClick={onPreviewGraduation}
            style={{
              position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
              fontSize: 11, padding: '6px 12px', borderRadius: 20,
              background: '#27272a', color: '#a1a1aa',
              border: '1px solid #3f3f46', opacity: 0.4,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
          >
            ⚡ Preview Graduation
          </button>
        )}

        {/* Maintaining habits section */}
        {maintainHabits.length > 0 && (
          <>
            <SectionHeader
              label={buildHabits.length > 0 ? 'Maintaining 🔥' : "Today's habits"}
              count={todayCount}
              total={habits.length}
            />
            <HabitList habits={maintainHabits} openHabit={openHabit} />
          </>
        )}

        {/* Empty state — no habits at all */}
        {habits.length === 0 && (
          <>
            <div className="flex items-center justify-between mt-7 mb-1">
              <p className="text-[11px] text-zinc-500 uppercase tracking-widest">Today's habits</p>
            </div>
            <HabitList habits={[]} openHabit={openHabit} />
          </>
        )}

        {habits.length > 0 && <MiniHeatmap />}

        <p className="text-center text-zinc-800 text-[10px] mt-4 mb-2">
          Made with ♥ by Chaitanya Pachori
        </p>
      </div>

      <AddHabitSheet addHabit={addHabit} onOpenBuilder={openBuilder} />

      {/* Grace recovery overlay */}
      <AnimatePresence>
        {showGrace && graceHabit && (
          <GracePrompt
            habit={graceHabit}
            onRecover={handleGraceRecover}
            onDismiss={() => setShowGrace(false)}
          />
        )}
      </AnimatePresence>

      {/* Milestone celebration */}
      <AnimatePresence>
        {milestone && (
          <MilestoneCelebration
            data={milestone}
            onClose={() => setMilestone(null)}
          />
        )}
      </AnimatePresence>

      <Toast message={toast} />
    </div>
  )
}
