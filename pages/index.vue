<template lang="pug">
#app
  #title color separator

  modal(name="about")
    About

  modal(name="help" height="auto" :draggable="true")
    Help

  button#focus(@click="setFocus") focus on canvas
  button(@click="help") help
  button(@click="about") About

  div
    #sketch-holder
      // Our sketch will go here!
    noscript
      p JavaScript is required to view the contents of this page.
  
</template>

<script>
import P5 from 'p5'
import VModal from 'vue-js-modal'
import Help from '@/components/help'
import About from '@/components/about'

import Sketch from '@/src/sketch.js'

export default {
  components: {
    VModal,
    Help,
    About
  },
  data () {
    return {
      currentText: 'placeholder',
      colorSep: {},
      textManager: {}
    }
  },
  mounted () {
    // const keypress = require('keypress.js')

    const builder = (p5Instance) => {
      const colorSep = new Sketch({ p5Instance, p5Object: P5 }) // eslint-disable-line no-new
      this.colorSep = colorSep
    }

    new P5(builder, 'sketch-holder') // eslint-disable-line no-new

  },
  methods: {
    setFocus () {
      this.canvas().focus()
    },
    canvas () {
      return document.getElementsByTagName('canvas')[0]
    },
    about () {
      this.$modal.show('about')
    },
    help () {
      this.$modal.show('help')
    }
  }
}
</script>

<style scoped>
/* @import "@/assets/css/core.css"; */
#title {
  background: linear-gradient(90deg, #f0f, #ff0);
  line-height: 1.5em;
  font-weight: 600;
  width: 25vw;
  letter-spacing: 0.1em;
  margin-bottom: 1em;
  padding: 1rem;
  font-size: 1.65em;
}

#bodycopy {
  width: 100%;
  height: 90%;
}

.text-controls {
  float: right;
}
</style>
