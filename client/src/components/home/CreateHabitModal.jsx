import { useState } from 'react'

export default function CreateHabitModal() {

  const [open, setOpen] =
    useState(false)

  return (

    <>

      <button

        onClick={() =>
          setOpen(true)
        }

        className="
        fixed
        bottom-6
        right-6
        w-16
        h-16
        rounded-full
        bg-gradient-to-r
        from-orange-500
        to-red-500
        text-white
        text-4xl
        shadow-2xl
        hover:scale-105
        transition-all
        z-50
        "

      >

        +

      </button>

      {open && (

        <div className="
        fixed
        inset-0
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-50
        px-5
        ">

          <div className="
          w-full
          max-w-md
          rounded-[32px]
          bg-zinc-950
          border
          border-zinc-800
          p-6
          ">

            <div className="flex items-center justify-between">

              <h2 className="text-white text-3xl font-bold">

                New Habit

              </h2>

              <button
                onClick={() =>
                  setOpen(false)
                }
                className="text-zinc-400 text-2xl"
              >

                ×

              </button>

            </div>

            <input
              placeholder="Habit name"
              className="
              mt-6
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
              text-white
              outline-none
              "
            />

            <select
              className="
              mt-4
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
              text-white
              outline-none
              "
            >

              <option>Minutes</option>
              <option>KM</option>
              <option>Pages</option>
              <option>Steps</option>
              <option>Liters</option>
              <option>Calories</option>

            </select>

            <input
              placeholder="Daily target"
              className="
              mt-4
              w-full
              bg-zinc-900
              border
              border-zinc-800
              rounded-2xl
              px-5
              py-4
              text-white
              outline-none
              "
            />

            <button
              className="
              mt-6
              w-full
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-orange-500
              to-red-500
              text-white
              font-bold
              text-lg
              "
            >

              Create Habit

            </button>

          </div>

        </div>

      )}

    </>

  )

}