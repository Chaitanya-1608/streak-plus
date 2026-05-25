export default function FlameCore() {

  return (

    <div className="relative flex items-center justify-center py-10">

      <div className="absolute w-52 h-52 bg-orange-500/20 blur-3xl rounded-full animate-pulse"></div>

      <div className="relative z-10 text-center">

<div className="relative flex items-center justify-center">

  <div className="absolute w-32 h-32 bg-orange-500/30 blur-3xl rounded-full animate-pulse"></div>

  <div className="text-8xl animate-[pulse_2s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_25px_rgba(255,120,0,0.8)]">

    🔥

  </div>

</div>

        <h2 className="text-4xl font-bold text-white mt-4">
          12 Day Streak
        </h2>

        <p className="text-zinc-400 mt-3 text-lg">
          Momentum is building.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/20 border border-orange-400/30">

          <span className="text-orange-300 font-semibold">
            Rising Fire
          </span>

        </div>

      </div>

    </div>

  )

}