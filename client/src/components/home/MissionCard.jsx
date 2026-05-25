export default function MissionCard() {

  const dangerMode = true

  return (

    <div className={`

      relative
      overflow-hidden
      rounded-[32px]
      p-6
      mt-6
      border

      ${dangerMode
        ? `
          bg-gradient-to-br
          from-red-950
          to-black
          border-red-500/30
        `
        : `
          bg-zinc-900
          border-zinc-800
        `
      }

    `}>

      {dangerMode && (

        <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>

      )}

      <p className="text-zinc-400 uppercase tracking-[0.3em] text-xs relative z-10">

        Today's Mission

      </p>

      <h2 className="text-white text-4xl font-bold mt-4 leading-tight relative z-10">

        Complete 2 more habits
        to protect your flame.

      </h2>

      <div className="mt-6 w-full bg-black/40 rounded-full h-4 overflow-hidden relative z-10">

        <div className="w-2/3 h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-red-600"></div>

      </div>

      <div className="mt-4 flex justify-between items-center relative z-10">

        <span className="text-zinc-300 text-sm">

          2/3 completed

        </span>

        <span className="text-red-300 text-sm font-semibold animate-pulse">

          Flame at risk in 5 hrs

        </span>

      </div>

    </div>

  )

}