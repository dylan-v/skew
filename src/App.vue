<template>

  <v-app dark>
    <v-toolbar>
      <v-toolbar-title>
        <router-link to='/' tag='span' style='cursor:pointer'>Skew: A Media Bias Calculator</router-link>
      </v-toolbar-title>
      <v-spacer>      </v-spacer>
      <v-btn
        flat v-for="item in menuItems"
        :key="item.title"
        :to='item.link'>
        <v-icon left>{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn flat>
      <v-btn
          v-if="userIsAuthenticated"
          flat
          @click="onLogout">
          <v-icon left dark>exit_to_app</v-icon>
          Logout
        </v-btn>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {

    }
  },
  computed: {
    menuItems () {
      let menuItems = [
        {icon: 'info_outline', title: 'About Skew', link: '/about'},
        {icon: 'lock_open', title: 'Sign In', link: '/signin'},
        {icon: 'face', title: 'Sign Up', link: '/signup'},
      ]
      if (this.userIsAuthenticated) {
        menuItems = [
          {icon: 'trending_up', title: 'Platform Bias', link: '/profile'},
          {icon: 'thumbs_up_down', title: 'Approval Rating', link: '/approval'},
          {icon: 'description', title: 'User Stats', link: '/stats'},
          {icon: 'info_outline', title: 'About Skew', link: '/about'},
        ]
      }
      return menuItems
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  },
  methods: {
    onLogout () {
        console.log("logging out")
        this.$store.dispatch('logout')
      }
  },
  name: 'App'
}
</script>
