<template lang="pug">
#app
  #title color separator

  modal(name="about")
    About

  modal(name="help" height="auto" :draggable="true")
    Help

  DataGui(
    :threshold="params.threshold"
    :eyedropperIn="params.eyedropper"
    @updateThreshold="params.threshold = $event"
    @updateDither="params.ditherType = $event"
    @updateColor="params.color = $event"
    @updateChannel="params.channel = $event"
    @updateExtractColor="params.extractColor = $event"
  )

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
import P5 from 'p5/lib/p5'
window.p5 = P5
import VModal from 'vue-js-modal'
import Help from '@/components/help'
import About from '@/components/about'
import DataGui from '@/components/DataGui.vue'

import Sketch from '@/src/sketch.js'

export default {
  components: {
    DataGui,
    VModal,
    Help,
    About
  },
  data() {
    return {
      currentText: 'placeholder',
      colorSep: {},
      textManager: {},
      params: {
        ditherType: 'none',
        threshold: 80,
        color: [255, 72, 176],
        channel: 'blue',
        extractColor: 'rgba(3, 23, 6, 1)',
        eyedropper: 'rgb(255,255,255)'
      }
    }
  },
  // head() {
  //   return {
  //     script: [
  //       {
  //         hid: 'riso',
  //         src: '/p5.riso.js',
  //         defer: true,
  //         // Changed after script load
  //         callback: () => { this.isRisoLoaded = true }
  //       }
  //     ]
  //   }
  // },
  mounted() {
    this.params = {
      ...this.params,
      width: 500,
      height: 500,
      currChannel: '',
      img: null,
      imageLoaded: false
    }

    const builder = (p5Instance) => {
      window._p5Instance = p5Instance
      const colorSep = new Sketch({ p5Instance, p5Object: P5, params: this.params }) // eslint-disable-line no-new
      this.colorSep = colorSep
    }

    new P5(builder, 'sketch-holder') // eslint-disable-line no-new

  },
  methods: {
    setFocus() {
      this.canvas().focus()
    },
    canvas() {
      return document.getElementsByTagName('canvas')[0]
    },
    about() {
      this.$modal.show('about')
    },
    help() {
      this.$modal.show('help')
    }
  }
}
</script>

<style scoped>
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
