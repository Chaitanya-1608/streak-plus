import CompleteButton from './CompleteButton'
export default function HabitProgressCard({

  icon,
  title,
  progress,
  target,
  unit,
  xp

}) {

  const percent =
    (progress / target) * 100

  return (

    <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[32px] p-5 mt-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full"></div>
      <div className="flex items-start justify-between">

        <div>

          <div className="text-3xl">
            {icon}
          </div>

          <h2 className="text-white text-2xl font-bold mt-3">
            {title}
          </h2>

          <p className="text-zinc-400 mt-1">

            {progress} / {target} {unit}

          </p>

        </div>

        <div className="text-orange-400 font-bold text-lg">
          +{xp} XP
        </div>

      </div>

      <div className="mt-5 w-full bg-zinc-800 rounded-full h-3 overflow-hidden">

        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
          style={{
            width: `${percent}%`
          }}
        ></div>

      </div>

<div className="mt-4 flex items-center justify-between">

  <p className="text-emerald-400 text-sm">
    Momentum building
  </p>

  <button className="w-12 h-12 rounded-2xl bg-white text-black text-2xl font-bold hover:scale-105 transition-all">

    +

  </button>

</div>

<CompleteButton />
    </div>

  )

}