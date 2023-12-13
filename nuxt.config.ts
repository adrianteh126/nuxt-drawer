// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt Drawer',
      meta: [
        {
          name: 'description',
          content: 'A Nuxt 3 drawer.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }]
    }
  },
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss']
})
