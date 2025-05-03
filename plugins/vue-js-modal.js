import { defineNuxtPlugin } from '#app'
import { createVueJsModal } from 'vue-js-modal'

export default defineNuxtPlugin(nuxtApp => {
  const modal = createVueJsModal()
  nuxtApp.vueApp.use(modal)
})
