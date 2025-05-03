<template lang="pug">
.control-panel
  h2.control-title Image Processing Controls

  .control-section
    h3.section-title Color Settings
    .native-controls(:class="{ 'controls-closed': !isOpen }")
      .control-header
        button.toggle-controls(@click="toggleControls") {{ isOpen ? 'Close controls' : 'Open controls' }}
      
      .controls-content(v-if="isOpen")
        .control-group
          h4.group-label Basic Settings
          .control-item
            label(for="threshold") Threshold: {{ threshold }}
            input(type="range", id="threshold", v-model.number="threshold", min="0", max="255", step="1")
          
          .control-item
            label(for="renderColor") Render color:
            select(id="renderColor", v-model="renderColor")
              option(v-for="color in colors", :key="color.value", :value="color.value") {{ color.name }}
          
          .control-item
            label(for="channel") Channel:
            select(id="channel", v-model="channel")
              option(v-for="ch in channels", :key="ch.value", :value="ch.value") {{ ch.name }}

        .control-group
          h4.group-label Dithering & Halftone
          .control-item
            label(for="ditherType") Dither type:
            select(id="ditherType", v-model="ditherType")
              option(v-for="dither in ditherTypes", :key="dither.value", :value="dither.value") {{ dither.name }}
          
          .control-item
            label(for="halftonePattern") Halftone pattern:
            select(id="halftonePattern", v-model="halftonePattern")
              option(v-for="pattern in halftonePatterns", :key="pattern.value", :value="pattern.value") {{ pattern.name }}
          
          .control-item
            label(for="halftoneSize") Halftone size: {{ halftoneSize }}
            input(type="range", id="halftoneSize", v-model.number="halftoneSize", min="3", max="100", step="1")
          
          .control-item
            label(for="halftoneAngle") Halftone angle: {{ halftoneAngle }}
            input(type="range", id="halftoneAngle", v-model.number="halftoneAngle", min="0", max="180", step="1")

        .control-group
          h4.group-label Color Selection
          .control-item
            label(for="targetColor") Target color:
            input(type="color", id="targetColor", v-model="targetColorHex", @change="updateTargetColor")
          
          .control-item
            label(for="eyedropper") Eyedropper:
            input(type="color", id="eyedropper", v-model="eyedropperHex", @change="updateEyedropper", :disabled="true")
      
      .control-footer(v-if="!isOpen")
        button.toggle-controls.bottom(@click="toggleControls") {{ isOpen ? 'Close controls' : 'Open controls' }}
</template>

<script>
import { named, neons, allColors } from '../src/colors.js'
import convert from 'color-convert'

const dithers = [ 'none', 'bayer', 'floydsteinberg', 'Atkinson' ]
const halftones = [ 'line', 'square', 'circle', 'ellipse', 'cross' ]

export default {
  props: {
    thresholdIn: {
      type: Number,
      default: 128
    },
    eyedropperIn:{
      type: String,
      default: 'rgb(0,0,0)'
    }
  },
  data() {
    return {
      isOpen: true,
      threshold: this.thresholdIn,
      colors: Object.keys(allColors).map(c => ({ name: c, value: c })),
      renderColor: Object.keys(allColors)[0],
      targetColor: 'rgb(53,196,73)',
      targetColorHex: '#35c449',
      ditherTypes: dithers.map(d => ({ name: d, value: d})),
      ditherType: dithers[0],
      halftonePatterns: halftones.map(d => ({ name: d, value: d})),
      halftonePattern: halftones[0],
      halftoneSize: 5,
      halftoneAngle: 45,
      channels: ['red', 'green', 'blue'].map(i => ({ name: i, value: i })),
      channel: 'red',
      eyedropper: 'rgb(100,100,100)',
      eyedropperHex: '#646464'
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
    eyedropperIn: function (val) {
      this.eyedropper = val
      this.updateEyedropperHex()
    },
    thresholdIn: function(val) {
      this.threshold = val
    }
  },
  methods: {
    toggleControls() {
      this.isOpen = !this.isOpen
    },
    updateTargetColor() {
      // Convert hex to rgb
      const rgb = convert.hex.rgb(this.targetColorHex.slice(1))
      this.targetColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
      this.$emit('updateExtractColor', this.targetColor)
    },
    updateEyedropperHex() {
      if (this.eyedropper) {
        const rgbValues = this.eyedropper.match(/\d+/g)
        if (rgbValues && rgbValues.length === 3) {
          const hex = convert.rgb.hex(parseInt(rgbValues[0]), parseInt(rgbValues[1]), parseInt(rgbValues[2]))
          this.eyedropperHex = '#' + hex
        }
      }
    },
    updateEyedropper() {
      // Not needed for disabled input, but kept for potential future use
      const rgb = convert.hex.rgb(this.eyedropperHex.slice(1))
      this.eyedropper = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    }
  },
  mounted() {
    this.updateEyedropperHex()
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

.native-controls {
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  padding: 0.5rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.controls-closed {
  padding: 0;
}

.control-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0;
}

.control-footer {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.toggle-controls {
  background-color: #8a2be2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.toggle-controls:hover {
  background-color: #7a1dd2;
}

.toggle-controls.bottom {
  margin-top: 0.5rem;
}

.controls-content {
  padding: 0.5rem 0;
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
  margin-bottom: 0.8rem;
  display: flex;
  flex-direction: column;
}

.control-item label {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  color: #555;
}

input[type="range"] {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  background: #e0e0e0;
  outline: none;
  border-radius: 4px;
  margin: 0.5rem 0;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #8a2be2;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #8a2be2;
  cursor: pointer;
}

select {
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 0.9rem;
}

input[type="color"] {
  width: 100%;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}
</style>