<template>
  <div id="box">
    <h1>I'm Index</h1>
    <Son/>
  </div>
</template>

<script>
import Son from "@/components/son.vue";
export default {
  components: {
    Son
  }
};
</script>

<style lang='stylus'>
*
  margin 0
  padding 0

html, body
  width 100%
  height 100%
  overflow hidden

#box
  width 100%
  height 100%
  display flex
  background yellow
</style>