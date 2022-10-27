<script setup>
import Sidebar from './components/Sidebar.vue'
import Content from './components/Content.vue'
</script>

<template>
  <div class="container">
    <Sidebar></Sidebar>
    <Content></Content>
  </div>
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
}
</style>
<style scoped lang="less">
.container {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
