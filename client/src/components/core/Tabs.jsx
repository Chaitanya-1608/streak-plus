export default function Tabs() {

  return (

    <div className="flex gap-3 mt-8">

      <button className="
      px-5
      py-3
      rounded-2xl
      bg-white
      text-black
      font-semibold
      ">

        All

      </button>

      <button className="
      px-5
      py-3
      rounded-2xl
      bg-zinc-900
      text-zinc-400
      border
      border-zinc-800
      ">

        Today

      </button>

      <button className="
      px-5
      py-3
      rounded-2xl
      bg-zinc-900
      text-orange-300
      border
      border-orange-500/20
      ">

        On Fire

      </button>

    </div>

  )

}