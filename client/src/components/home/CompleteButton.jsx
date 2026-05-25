import { useState } from 'react'

export default function CompleteButton() {

  const [completed, setCompleted] =
    useState(false)

  return (

    <button

      onClick={() =>
        setCompleted(true)
      }

      className={`
      
      mt-5
      w-full
      py-4
      rounded-2xl
      font-bold
      text-lg
      transition-all
      duration-500
      relative
      overflow-hidden

      ${completed
        ? `
          bg-gradient-to-r
          from-emerald-400
          to-green-500
          text-white
          scale-[1.02]
          shadow-[0_0_40px_rgba(16,185,129,0.5)]
        `
        : `
          bg-white
          text-black
          hover:scale-[1.02]
        `
      }

      `}
    >

      {completed && (

        <div
          className="
          absolute
          inset-0
          bg-white/10
          animate-pulse
          "
        />

      )}

      <span className="relative z-10">

        {completed
          ? '🔥 Momentum Protected'
          : 'Complete Habit'
        }

      </span>

    </button>

  )

}