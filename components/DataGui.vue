<template lang="pug">
dat-gui(closetext="Close controls", opentext="Open controls", closeposition="bottom")
  dat-number(v-model="threshold", :min="-0", :max="255", :step="1", label="Threshold")
  dat-select(v-model="renderColor" :items="colors" label="Render color")
  dat-select(v-model="channel" :items="channels" label="Channel")

</template>

<script>
import { named } from '../src/colors.js'

export default {
  props: {
    threshold: Number
  },
  data() {
    return {
      colors: Object.keys(named).map(i => ({ name: i, value: i })),
      renderColor: Object.keys(named)[0],
      named,
      channels: ['red', 'green', 'blue'].map(i => ({ name: i, value: i })),
      channel: 'red'
    }
  },
  watch: {
    threshold: function (val) {
      this.$emit('updateThreshold', val)
    },
    renderColor: function (val) {
      this.$emit('updateColor', this.named[val])
    },
    channel: function (val) {
      this.$emit('updateChannel', val)
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
