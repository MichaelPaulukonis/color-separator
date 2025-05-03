import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  window.setFocus = () => {
    document.getElementsByTagName('canvas')[0]?.focus()
  }
})
