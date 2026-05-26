/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:       '#070500',   // warm near-black
        surface:  '#100c05',   // dark earth surface
        surface2: '#1c1508',   // warm dark surface
        accent:   '#DBAD28',   // deep gold   — primary CTA (#DBAD28)
        gold:     '#EAC775',   // warm gold   — highlights  (#EAC775)
        teal:     '#9CBD44',   // olive green  — contrast    (#9CBD44)
        rust:     '#AF643F',   // warm rust   — flame/streak gradients (#AF643F)
        cream:    '#FFEAB3',   // pale cream  — glow tints  (#FFEAB3)
      },
      fontFamily: {
        syne:    ['Syne', 'sans-serif'],
        dmsans:  ['DM Sans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px) translateX(-50%)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateX(-50%)' },
        },
        burst: {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '50%':  { transform: 'scale(1.45)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        flicker: {
          '0%, 100%': { transform: 'scaleY(1)   scaleX(1)',    filter: 'brightness(1)' },
          '25%':      { transform: 'scaleY(1.04) scaleX(0.97)', filter: 'brightness(1.1)' },
          '75%':      { transform: 'scaleY(0.97) scaleX(1.03)', filter: 'brightness(0.95)' },
        },
        floatUp: {
          '0%':   { opacity: '0', transform: 'translateY(0)' },
          '20%':  { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        ringFill: {
          '0%':   { 'stroke-dashoffset': '339' },
          '100%': { 'stroke-dashoffset': 'var(--ring-offset)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        toastIn:  'toastIn 0.3s ease forwards',
        burst:    'burst 0.35s ease',
        flicker:  'flicker 1.8s ease-in-out infinite',
        floatUp:  'floatUp 1.2s ease forwards',
        ringFill: 'ringFill 1.2s ease forwards',
        slideUp:  'slideUp 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}
