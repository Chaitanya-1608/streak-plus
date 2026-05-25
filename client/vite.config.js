import { defineConfig }
from 'vite'

import react
from '@vitejs/plugin-react'

import {
  VitePWA
} from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType:
        'autoUpdate',

      injectRegister:
        'auto',

      devOptions: {

        enabled: true

      },

      manifest: {
        name:             'Streak+',
        short_name:       'Streak+',
        description:      'Build habits. Protect your momentum.',
        theme_color:      '#070600',
        background_color: '#070600',
        display:          'standalone',
        orientation:      'portrait',
        start_url:        '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }

    })

  ]

})