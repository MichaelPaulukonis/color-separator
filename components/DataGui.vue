<template lang="pug">
dat-gui(closetext="Close controls", opentext="Open controls", closeposition="bottom")
  dat-color(v-model="background", label="Background")
  dat-number(v-model="titleFontSize", label="Title font-size")
  dat-string(v-model="title", label="Title")
  dat-button(@click="triggerAlert", label="Trigger alert")
  dat-folder(label="Picture")
    dat-select(v-model="pictureUrl", :items="pictures", label="Picture")
    dat-boolean(v-model="showPicture", label="Show Picture")
    dat-folder(label="Box shadow")
      dat-number(v-model="boxShadow.offsetX", :min="-100", :max="100", :step="1", label="Offset X")
      dat-number(v-model="boxShadow.offsetY", :min="-100", :max="100", :step="1", label="Offset Y")
      dat-number(v-model="boxShadow.blurRadius", :min="0", :max="100", :step="1", label="Blur radius")
      dat-number(v-model="boxShadow.spreadRadius", label="Spread radius")
      dat-color(v-model="boxShadow.color", label="Color").
                            
</template>

<script>
const pictures = [{ name: 'forest', value: '...' }, { name: 'mountain', value: '...' }]

export default {
  components: {
  },
  data() {
    return {
      background: '#cdeecc',
      titleFontSize: 75,
      title: 'vue-dat-gui',
      showPicture: true,
      pictures,
      pictureUrl: pictures[0].value,
      boxShadow: {
        offsetX: 27,
        offsetY: 27,
        blurRadius: 75,
        spreadRadius: 2,
        color: 'rgba(3, 23, 6, 1)',
      },
    }
  },
    methods: {
      triggerAlert() {
        alert('Yeah, you pressed it!')
      },
    }
}
</script>

<style scoped>
#about {
  margin: 10px;
}
</style>
