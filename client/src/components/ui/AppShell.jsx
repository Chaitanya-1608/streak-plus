const AppShell = ({ children }) => {

  return (

    <div
      className="
      min-h-screen
      bg-[#0A0A0F]
      text-white
      px-4
      pb-28
      "
    >

      <div
        className="
        max-w-md
        mx-auto
        "
      >

        {children}

      </div>

    </div>

  )

}

export default AppShell