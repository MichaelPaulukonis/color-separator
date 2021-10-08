<template lang="pug">
div#helpbox
    p Channel w/ a clean color to play with
    h3 Keys
    #keys(v-for="key in keymap" v-bind:key='key.key')
        span #[span.key {{ key.keys.join(', ') }} ] {{ key.note }}

</template>

<script>
const keymap = [
  {
    keys: ['r'],
    note: 'Extract red channel to magenta'
  },
  {
    keys: ['g'],
    note: 'Extract green channel to yellow (!!!)'
  },
  {
    keys: ['b'],
    note: 'Extract blue channel to cyan'
  },
  {
    keys: ['s'],
    note: 'Save canvas.'
  },
  {
    keys: ['o'],
    note: 'Original image.'
  }
]

export default {
  data () {
    return { keymap }
  }
}
</script>

<style scoped>
#helpbox {
  margin: 10px;
}

.key {
  font-family: monospace;
}
</style>
