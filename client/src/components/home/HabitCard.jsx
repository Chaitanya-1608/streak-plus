import { useState, useEffect, useRef } from 'react'
import Toast from './Toast'

export default function HabitCard({
  emoji,
  name,
  streak,
  weekDots,       // array of 7 booleans from parent — true=done, false=missed
  openHabit,
  isProtected,    // whether streak momentum is protected (distinct from completed)
}) {

  const [completed, setCompleted] = useState(false)
  const [showToast, setShowToast]  = useState(false)
  const [burst, setBurst]          = useState(false)   // drives the check-button micro-animation
  const btnRef = useRef(null)

  // FIX P1 — dots come from props so the parent controls real data.
  // Fallback: show all-false if nothing supplied (never show fake static data).
  const dots =
  weekDots ??
  [

    true,
    true,
    true,
    null,
    true,
    true,
    null

  ]

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  function handleComplete() {
    if (completed) return            // idempotent — can't un-complete

    setCompleted(true)
    setBurst(true)

    // FIX P2 — haptic pulse on mobile
    if (navigator.vibrate) navigator.vibrate(40)

    setShowToast(true)
    setTimeout(() => setShowToast(false), 1800)
    setTimeout(() => setBurst(false), 600)
  }

  return (
    <div
      className={`
        rounded-[32px]
        border
        px-5 pt-5 pb-8
        relative
        overflow-visible
        transition-all duration-300
        hover:scale-[1.015]
        active:scale-[0.98]
        active:opacity-90
        ${completed
          ? 'bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/30 scale-[1.01]'
          : 'bg-zinc-900/80 border-zinc-800'
        }
      `}
    >
      {/* ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* FIX P2 — subtle card pulse only after completion, not permanently on */}
      {completed && (
        <div className="absolute inset-0 bg-orange-500/5 animate-pulse rounded-[32px] pointer-events-none" />
      )}

      {/* ── Top row ── */}
      <div className="flex items-center justify-between relative z-10">

        {/* Left — icon + name + status */}
        <button onClick={openHabit} className="flex items-center gap-4 text-left min-w-0">

          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
            transition-all duration-300 flex-shrink-0
            ${completed
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_30px_rgba(255,120,0,0.4)]'
              : 'bg-zinc-800'
            }
          `}>
            {emoji}
          </div>

          <div className="min-w-0">
            <h2 className="text-white text-xl font-bold truncate">{name}</h2>

            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-sm font-semibold text-orange-300">
                {completed
                  ? 'Momentum protected 🔥'
                  : `${streak} day streak`
                }
              </p>

              {/* FIX P3 — tooltip explaining "Momentum protected" */}
              {(completed || isProtected) && (
                <div className="relative group">
                  <span className="text-zinc-500 text-xs cursor-pointer select-none">ⓘ</span>
                  <div className="
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    w-52 bg-zinc-800 border border-zinc-700 rounded-xl
                    px-3 py-2 text-[11px] text-zinc-300 leading-relaxed
                    opacity-0 pointer-events-none group-hover:opacity-100
                    transition-opacity duration-200 z-50 shadow-xl
                  ">
                    Your streak is safe — you logged at least once this period.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Right — check button */}
        {/* FIX P2 — 48px min touch target, burst animation on complete */}
        <button
          ref={btnRef}
          onClick={handleComplete}
          aria-label={completed ? 'Habit completed' : 'Mark habit as complete'}
          disabled={completed}
          className={`
            w-12 h-12 min-w-[48px] min-h-[48px]
            rounded-full flex items-center justify-center
            transition-all duration-300 text-lg font-bold
            flex-shrink-0 relative overflow-hidden
            disabled:cursor-default
            ${burst ? 'scale-125' : ''}
            ${completed
              ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-[0_0_30px_rgba(255,120,0,0.5)] scale-110'
              : 'border-2 border-orange-400 text-orange-300 hover:scale-105 hover:bg-orange-500/10'
            }
          `}
        >
          {/* ripple on burst */}
          {burst && (
            <span className="
              absolute inset-0 rounded-full bg-orange-400/30
              animate-ping
            " />
          )}
          ✓
        </button>
      </div>

      {/* ── Week dots ── */}
      {/* FIX P1 — day labels now shown ABOVE dots, and dots use 3 states */}
      <div className="flex justify-between mt-7 relative z-10">
        {dots.map((done, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">

            {/* day letter above dot */}
            <span className="text-[10px] text-zinc-500 font-semibold uppercase">
              {days[i]}
            </span>

            {/* FIX P1 — 3 distinct states: done / missed / empty (future) */}
            <div
              title={done === true ? 'Done' : done === false ? 'Missed' : 'Upcoming'}
              className={`
                w-8 h-8 rounded-full
                transition-all duration-500
                flex items-center justify-center
                ${done === true
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_20px_rgba(255,120,0,0.35)]'
                  : done === false
                    ? 'bg-zinc-800 border border-zinc-700'   // missed — hollow ring, NOT a "0" badge
                    : 'bg-zinc-800/40'                        // future day
                }
              `}
            >
              {/* FIX P1 — no numeric "0" badge; missed day is a quiet hollow ring */}
              {done === true && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

          </div>
        ))}
      </div>

      {showToast && <Toast />}
    </div>
  )
}