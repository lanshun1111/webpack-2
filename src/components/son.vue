<template lang='pug'>
  transition(name="sider")
    div.container
      h3 {{msg}}
      p(:style="{color:'#000'}",:htmlData="msg") p label
      button(@click="clickMe") clickTest
      hr
</template>

<template lang='pug'>
  transition(name="sider")
    div.hello
      h3 {{msg}}
      p(:style="{color:'#000'}",:htmlData="msg") p label
      button(@click="clickMe") clickTest
</template>
 
<script>
export default {
  data() {
    return {
      style: {
        color: "lightblue",
        fontWeight: 600
      },
      msg: "okok"
    };
  },
  methods: {
    clickMe() {
      console.log(12345);
      console.log("fantasy");
      console.log(456);
    }
  }
};
</script>

<style scoped lang='stylus'>
.container
  width 100px
  height 100px
  border 1px solid #ccc
  margin 100px auto
</style>