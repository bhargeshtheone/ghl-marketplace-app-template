<template>
  <div id="app">
    <GoogleMerchantSetup />
  </div>
</template>

<script>
import GoogleMerchantSetup from './components/GoogleMerchantSetup.vue'

export default {
  name: 'App',
  components: {
    GoogleMerchantSetup
  },
  async mounted(){
    const data = await window.ghl.getUserData();
    console.log("user-details", data)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
