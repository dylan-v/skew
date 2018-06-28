// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import { store } from './store'
import * as firebase from 'firebase'
import "chart.js"
import "hchs-vue-charts"
import VueAppend from 'vue-append'
Vue.use(VueAppend)


// use the plugin
Vue.use(window.VueCharts)


Vue.use(Vuetify)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyBPBc4IpCF-z5H72Z4guKhCgiRTxY8wWMQ',
      authDomain: 'media-bias-o-meter.firebaseapp.com',
      databaseURL: 'https://media-bias-o-meter.firebaseio.com',
      projectId: 'media-bias-o-meter',
      storageBucket: 'media-bias-o-meter.appspot.com'
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
        this.$store.dispatch('fetchUserData')
      }
    })
    this.$store.dispatch('loadNewspapers')

  }
})
