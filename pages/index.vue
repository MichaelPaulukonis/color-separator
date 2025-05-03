<template lang="pug">
#app
  header.app-header
    #title COLOR SEPARATOR
    .action-buttons
      button.btn(@click="help") 
        i.icon &#9432;
        | Help
      button.btn(@click="about") 
        i.icon &#8505;
        | About

  .main-content
    .canvas-container
      #sketch-holder
        // Our sketch will go here!
      noscript
        p JavaScript is required to view the contents of this page.
      button.focus-btn(@click="setFocus") Focus Canvas

    .controls-container
      NativeControls(
        :thresholdIn="params.threshold"
        :eyedropperIn="params.eyedropper"
        @updateThreshold="params.threshold = $event"
        @updateDither="params.ditherType = $event"
        @updateHalftone="params.halftonePattern = $event"
        @updateHalftoneSize="params.halftoneSize = $event"
        @updateHalftoneAngle="params.halftoneAngle = $event"
        @updateColor="params.color = $event"
        @updateChannel="params.channel = $event"
        @updateExtractColor="params.extractColor = $event"
      )

  modal(name="about" :scrollable="true" height="auto" width="500px")
    About

  modal(name="help" height="auto" width="500px" :scrollable="true" :draggable="true")
    Help
  
</template>

<script setup>
import { ref, onMounted } from 'vue'
import P5 from 'p5/lib/p5'
window.p5 = P5
import { useModal } from 'vue-js-modal'
import Help from '@/components/help'
import About from '@/components/about'
import NativeControls from '@/components/NativeControls.vue'

import Sketch from '@/src/sketch.js'

const modal = useModal()
const currentText = ref('placeholder')
const colorSep = ref({})
const params = ref({
  ditherType: 'none',
  halftonePattern: 'circle',
  halftoneSize: 5,
  halftoneAngle: 45,
  threshold: 80,
  color: [255, 72, 176],
  channel: 'blue',
  extractColor: 'rgba(3, 23, 6, 1)',
  eyedropper: 'rgb(255,255,255)'
})

onMounted(() => {
  params.value = {
    ...params.value,
    width: 500,
    height: 500,
    currChannel: '',
    img: null,
    imageLoaded: false,
    ratio: 1
  }

  const builder = (p5Instance) => {
    window._p5Instance = p5Instance
    const sketch = new Sketch({ p5Instance, p5Object: P5, params: params.value })
    colorSep.value = sketch
  }

  new P5(builder, 'sketch-holder')
})

function setFocus() {
  canvas().focus()
}

function canvas() {
  return document.getElementsByTagName('canvas')[0]
}

function about() {
  modal.show('about')
}

function help() {
  modal.show('help')
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #222;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

#title {
  background: linear-gradient(90deg, #f0f, #ff0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2em;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: 1.8em;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  background-color: #555;
}

.icon {
  margin-right: 8px;
  font-style: normal;
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  padding: 1rem;
  gap: 20px;
}

.canvas-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls-container {
  width: 300px;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.focus-btn {
  margin-top: 1rem;
  padding: 8px 16px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.focus-btn:hover {
  background-color: #2d3748;
}

/* Responsive layout */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .controls-container {
    width: 100%;
  }
}
</style>