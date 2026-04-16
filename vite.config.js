import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-512.png'],
      manifest: {
        name: 'Sílaba Mágica - Juegos de Oli',
        short_name: 'Sílaba Mágica',
        description: 'Juego educativo para practicar letras, sílabas, palabras y números',
        theme_color: '#14b8a6',
        background_color: '#a7f3d0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,mp3,wav}']
      }
    })
  ],
  base: '/silaba-magica/'
})
