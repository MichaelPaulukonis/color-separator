<template lang="pug">
div#helpbox
    h2 Color Separator
    p A color channel extraction and manipulation tool for images
    p Drag and drop an image onto the canvas to work with your own image

    h3 App Overview
    p This app allows you to separate and manipulate color channels in images. You can extract specific RGB or CMYK channels, apply dithering effects, create halftone patterns, and save your results. Perfect for design work, art projects, or exploring color theory.

    h3 Keys
    #keys(v-for="key in keymap" v-bind:key='key.key')
        span #[span.key {{ key.keys.join(', ') }} ] {{ key.note }}

    h3 Settings
    p Use the control panel to adjust:
    ul
      li Threshold - Controls the intensity threshold for effects
      li Dither Type - Different dithering algorithms
      li Halftone Pattern - Various halftone pattern styles
      li Halftone Size & Angle - Customize halftone appearance
      li Channel Selection - Choose which color channel to work with
      li Color Settings - Define target and extraction colors

    h3 Tips
    p #[span.key Click ] on the canvas to sample colors
    p #[span.key u ] Undo last action
    p Experiment with different thresholds for varied effects
    p Save your work frequently with the 's' key

</template>

<script>
const keymap = [
  {
    keys: ['s'],
    note: 'Save canvas to your computer'
  },
  {
    keys: ['o'],
    note: 'Restore original image'
  },
  {
    keys: ['a'],
    note: 'Extract single color using selected channel and color'
  },
  {
    keys: ['e'],
    note: 'Extract target color using threshold'
  },
  {
    keys: ['d'],
    note: 'Apply dithering effect to image'
  },
  {
    keys: ['h'],
    note: 'Apply halftone pattern with current settings'
  },
  {
    keys: ['p'],
    note: 'Apply photo dither effect'
  },
  {
    keys: ['u'],
    note: 'Undo last action'
  },
  {
    keys: ['r'],
    note: 'Extract red channel to magenta'
  },
  {
    keys: ['g'],
    note: 'Extract green channel to yellow'
  },
  {
    keys: ['b'],
    note: 'Extract blue channel to cyan'
  },
  {
    keys: ['c'],
    note: 'Extract cyan channel'
  },
  {
    keys: ['y'],
    note: 'Extract yellow channel'
  },
  {
    keys: ['m'],
    note: 'Extract magenta channel'
  },
  {
    keys: ['k'],
    note: 'Extract black channel'
  },
  {
    keys: ['D'],
    note: 'Dither original image using selected ditherType and threshold'
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
  margin: 20px;
  max-width: 600px;
  max-height: 70vh;
  overflow-y: auto;
}

.key {
  font-family: monospace;
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

h2 {
  color: #333;
  border-bottom: 2px solid #f0f;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

h3 {
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

p {
  line-height: 1.5;
  margin-bottom: 10px;
}
</style>
