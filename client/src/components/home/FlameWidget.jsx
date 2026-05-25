import { motion } from 'framer-motion'

const FlameWidget = () => {

  return (

    <motion.div

      animate={{
        scale: [1, 1.04, 1]
      }}

      transition={{
        duration: 2,
        repeat: Infinity
      }}

      className="
      mt-6
      rounded-[32px]
      bg-gradient-to-br
      from-[#1A1A24]
      to-[#111118]
      border
      border-[#2A2A35]
      p-6
      text-center
      relative
      overflow-hidden
      "

    >

      <div
        className="
        absolute
        inset-0
        bg-[#FF6B35]
        opacity-5
        blur-3xl
        "
      />

      <div
        className="
        text-7xl
        relative
        "
      >
        🔥
      </div>

      <h2
        className="
        mt-4
        text-2xl
        font-bold
        "
      >
        12 Day Streak
      </h2>

      <p
        className="
        mt-2
        text-gray-400
        "
      >
        Momentum is building
      </p>

    </motion.div>

  )

}

export default FlameWidget