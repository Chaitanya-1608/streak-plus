import { motion } from 'framer-motion'

const HeroCard = () => {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      transition={{
        duration: 0.5
      }}

      className="
      mt-6
      rounded-[32px]
      p-6
      bg-gradient-to-br
      from-[#1A1A24]
      to-[#111118]
      border
      border-[#2A2A35]
      shadow-2xl
      overflow-hidden
      relative
      "

    >

      <div
        className="
        absolute
        -top-10
        -right-10
        h-40
        w-40
        rounded-full
        bg-[#FF6B35]
        opacity-10
        blur-3xl
        "
      />

      <p
        className="
        text-sm
        text-gray-400
        "
      >
        Good Evening
      </p>

      <h1
        className="
        text-4xl
        font-bold
        mt-1
        tracking-tight
        "
      >
        Chaitanya
      </h1>

      <p
        className="
        mt-4
        text-sm
        text-gray-400
        "
      >
        You are becoming
      </p>

      <div
        className="
        mt-4
        space-y-4
        "
      >

        <div>

          <div
            className="
            flex
            justify-between
            mb-1
            "
          >

            <span>
              🔥 Discipline
            </span>

            <span>
              72%
            </span>

          </div>

          <div
            className="
            h-3
            rounded-full
            bg-[#222]
            overflow-hidden
            "
          >

            <motion.div

              initial={{
                width: 0
              }}

              animate={{
                width: '72%'
              }}

              transition={{
                duration: 1
              }}

              className="
              h-full
              rounded-full
              bg-[#FF6B35]
              "

            />

          </div>

        </div>

        <div>

          <div
            className="
            flex
            justify-between
            mb-1
            "
          >

            <span>
              ⚡ Consistency
            </span>

            <span>
              61%
            </span>

          </div>

          <div
            className="
            h-3
            rounded-full
            bg-[#222]
            overflow-hidden
            "
          >

            <motion.div

              initial={{
                width: 0
              }}

              animate={{
                width: '61%'
              }}

              transition={{
                duration: 1.2
              }}

              className="
              h-full
              rounded-full
              bg-[#1DCFAA]
              "

            />

          </div>

        </div>

      </div>

    </motion.div>

  )

}

export default HeroCard