<template lang="pug">
.control-panel
  h2.control-title Image Processing Controls

  .control-section
    h3.section-title Color Settings
    dat-gui(close-text="Close controls", open-text="Open controls", close-position="bottom")
      .control-group
        h4.group-label Basic Settings
        dat-number.control-item(v-model="threshold", :min="-0", :max="255", :step="1", label="Threshold")
        dat-select.control-item(v-model="renderColor" :items="colors" label="Render color")
        dat-select.control-item(v-model="channel" :items="channels" label="Channel")

      .control-group
        h4.group-label Dithering & Halftone
        dat-select.control-item(v-model="ditherType" :items="ditherTypes" label="Dither type")
        dat-select.control-item(v-model="halftonePattern" :items="halftonePatterns" label="Halftone pattern")
        dat-number.control-item(v-model="halftoneSize", :min="3", :max="100", :step="1", label="Halftone size")
        dat-number.control-item(v-model="halftoneAngle", :min="0", :max="180", :step="1", label="Halftone angle")

      .control-group
        h4.group-label Color Selection
        dat-color.control-item(v-model="targetColor" label="Target color")
        dat-color.control-item(v-model="eyedropper" label="Eyedropper")
</template>

<script>
import { named, neons, allColors } from '../src/colors.js'

const dithers = [ 'none', 'bayer', 'floydsteinberg', 'Atkinson' ]

const halftones = [ 'line', 'square', 'circle', 'ellipse', 'cross' ]

// absolute positioning for dat-gui
// document.getElementsByClassName('dg ac')[0].style.top = '150px';
// document.getElementsByClassName('dg ac')[0].style.right = '150px';

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
      colors: Object.keys(allColors).map(c => ({ name: c, value: c })),
      renderColor: Object.keys(allColors)[0],
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
      this.$emit('updateColor', allColors[val])
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
.control-panel {
  width: 100%;
  overflow: hidden;
}

.control-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ddd;
}

.section-title {
  font-size: 1rem;
  margin: 1rem 0 0.5rem;
  color: #555;
}

.control-group {
  margin-bottom: 1.5rem;
  padding: 0.8rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  border-left: 3px solid #8a2be2;
}

.group-label {
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
  color: #666;
  font-weight: 500;
}

.control-item {
  margin-bottom: 0.5rem;
}

ul > li {
  margin-bottom: 0;
}

/* Enhance dat-gui styling with custom colors */
:deep(.dg.main) {
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
}

:deep(.dg.main .close-button) {
  background-color: #8a2be2;
  color: white;
}

:deep(.dg.main .close-button:hover) {
  background-color: #7a1dd2;
}

:deep(.dg.main .property-name) {
  font-weight: 500;
}

:deep(.dg li:not(.folder)) {
  border-bottom: 1px solid #eee;
}
</style>
