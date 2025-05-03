// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: process.env.DEPLOY_ENV === 'GH_PAGES' ? '/color-separator/' : '/',
    head: {
      title: process.env.npm_package_name || '',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: process.env.npm_package_description || '' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  css: [
    '@/assets/css/main.scss',
    '@/assets/css/core.css'
  ],
  modules: [
    '@nuxtjs/style-resources',
    '@nuxtjs/eslint-module'
  ],
  styleResources: {
    scss: [
      '@/assets/css/utilities/_variables.scss',
      '@/assets/css/utilities/_helpers.scss',
      '@/assets/css/base/_grid.scss',
      '@/assets/css/base/_buttons.scss'
    ]
  },
  vite: {
    optimizeDeps: {
      include: ['p5']
    }
  },
  nitro: {
    preset: 'static'
  }
})
