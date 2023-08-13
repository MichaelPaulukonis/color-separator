<template lang="pug">
dat-gui(close-text="Close controls", open-text="Open controls", close-position="bottom")
  dat-number(v-model="threshold", :min="-0", :max="255", :step="1", label="Threshold")
  dat-select(v-model="renderColor" :items="colors" label="Render color")
  dat-select(v-model="ditherType" :items="ditherTypes" label="Dither type")
  dat-select(v-model="halftonePattern" :items="halftonePatterns" label="Halftone pattern")
  dat-number(v-model="halftoneSize", :min="1", :max="255", :step="1", label="halftone size")
  dat-number(v-model="halftoneAngle", :min="-0", :max="255", :step="1", label="halftone angle")
  dat-select(v-model="channel" :items="channels" label="Channel")
  dat-color(v-model="targetColor" label="target color")
  dat-color(v-model="eyedropper" label="eyedropper")
</template>

<script>
import { named } from '../src/colors.js'

const dithers = [ 'none', 'bayer', 'floydsteinberg', 'Atkinson' ]

const halftones = [ 'line', 'square', 'circle', 'ellipse', 'cross' ]

export default {
  props: {
    threshold: Number,
    eyedropperIn:{
      type: String,
      default: 'rgb(0,0,0)'
    }
  },
  data() {
    return {
      colors: Object.keys(named).map(c => ({ name: c, value: c })),
      renderColor: Object.keys(named)[0],
      targetColor: 'rgb(53,196,73)', 
      ditherTypes: dithers.map(d => ({ name: d, value: d})),
      ditherType: dithers[0],
      halftonePatterns: halftones.map(d => ({ name: d, value: d})),
      halftonePattern: halftones[0],
      halftoneSize: 5,
      halftoneAngle: 45,
      channels: ['red', 'green', 'blue'].map(i => ({ name: i, value: i })),
      channel: 'red',
      eyedropper: 'rgb(100,100,100'
    }
  },
  watch: {
    ditherType: function (val) {
      this.$emit('updateDither', val)
    },
    halftonePattern: function (val) {
      this.$emit('updateHalftone', val)
    },

    halftoneSize: function (val) {
      this.$emit('updateHalftoneSize', val)
    },
    halftoneAngle: function (val) {
      this.$emit('updateHalftoneAngle', val)
    },

    threshold: function (val) {
      this.$emit('updateThreshold', val)
    },
    renderColor: function (val) {
      this.$emit('updateColor', named[val])
    },
    channel: function (val) {
      this.$emit('updateChannel', val)
    },
    targetColor: function (val) {
      this.$emit('updateExtractColor', val)
    },
    eyedropperIn: function (val) {
      this.eyedropper = val
    }
  },
  methods: {

  }
}
</script>

<style scoped>
#about {
  margin: 10px;
}
</style>
