<template lang="pug">
dat-gui(closetext="Close controls", opentext="Open controls", closeposition="bottom")
  dat-number(v-model="threshold", :min="-0", :max="255", :step="1", label="Threshold")
</template>

<script>

export default {
  props: {
    threshold: Number
  },
  data() {
    return {
      // threshold: 50
    }
  },
  watch: {
    threshold: function (val) {
      this.$emit('updateThreshold', val)
    }
  }
}
</script>

<style scoped>
#about {
  margin: 10px;
}
</style>
