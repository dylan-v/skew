import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Signin from '@/components/User/Signin'
import Signup from '@/components/User/Signup'
import Profile from '@/components/User/Profile'
import Approval from '@/components/User/Approval'
import Stats from '@/components/User/Stats'
import About from '@/components/User/About'
import Forum from '@/components/User/Forum'




Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/Signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/Signin',
      name: 'Signin',
      component: Signin
    },
    {
      path: '/Profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/Approval',
      name: 'Approval',
      component: Approval
    },
    {
      path: '/Stats',
      name: 'Stats',
      component: Stats
    },
    {
      path: '/About',
      name: 'About',
      component: About
    },
    {
      path: '/Forum',
      name: 'Forum',
      component: Forum
    },

  ],
  mode: 'history'
})
