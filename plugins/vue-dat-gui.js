import { defineNuxtPlugin } from '#app'
import DatGui from '@cyrilf/vue-dat-gui'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(DatGui)
})
