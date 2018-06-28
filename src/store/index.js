import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    loadedNewspapers: [





    ],
    user: null,
  },
  mutations: {
    setUserVotes (state, payload) {
      state.user.lastVote = payload;
    },
    setUserThumbs (state, payload) {
      state.user.lastThumb = payload;
    },
    addNewspaper (state, payload) {
      state.loadedNewspapers.push(payload)
    },
    updateNewspaper (state, payload) {
      state.loadedNewspapers.splice(payload.index, 1, payload);
    },
    setUser (state, payload) {
      state.user = payload
    },
    setLoadedNewspapers (state, payload) {
      state.loadedNewspapers = payload
    }
  },
  actions: {
    updateUserVotes ({commit, getters}, payload) {
      const user = getters.user
      firebase.database().ref('/users/' + user.id).child('/votes/').set(payload)
        .then((data) => {
          console.log(data)
          commit('setUserVotes', payload)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    updateUserThumbs ({commit, getters}, payload) {
      const user = getters.user
      firebase.database().ref('/users/' + user.id).child('/thumbs/').set(payload)
        .then((data) => {
          console.log(data)
          commit('setUserThumbs', payload)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    //Pull data from firebase
    fetchUserData ({commit, getters}) {
      let thumbs = []
      let votes = []
      firebase.database().ref('/users/' + getters.user.id + '/thumbs/').once('value')
        .then(data => {
          const dataPairs = data.val()
          for (let key in dataPairs) {
            console.log(dataPairs[key])
            thumbs.push(dataPairs[key])
          }
          firebase.database().ref('/users/' + getters.user.id + '/votes/').once('value')
            .then(data => {
              const dataPairs = data.val()
              for (let key in dataPairs) {
                console.log(dataPairs[key])
                votes.push(dataPairs[key])
              }
              const updatedUser = {
                id: getters.user.id,
                lastVote: votes,
                lastThumb: thumbs
              }
              commit('setUser', updatedUser)
            })
        })
        .catch(error => {
          console.log(error)
        })
    },

    loadNewspapers ({commit}, payload){
      firebase.database().ref('newspapers').once('value')
        .then((data) => {
          const newspapers = []
          const obj = data.val()
          for (let key in obj){
            console.log(key);
            newspapers.push({
              id: key,
              creatorID: obj[key].creatorID,
              name: obj[key].name,
              url: obj[key].url,
              votesLib: obj[key].votesLib,
              votesModLib: obj[key].votesModLib,
              votesCentrist: obj[key].votesCentrist,
              votesModRep: obj[key].votesModRep,
              votesRep: obj[key].votesRep,
              topVote: obj[key].topVote,
              biasTowards: obj[key].biasTowards,
              thumbsUp: obj[key].thumbsUp,
              thumbsDown: obj[key].thumbsDown,
              index: obj[key].index,
            })
          }
          commit('setLoadedNewspapers', newspapers)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    addNewspaper ({commit}, payload) {
      const newspaper = payload;
      //Reach out to Firebase and store
      firebase.database().ref('newspapers').push(newspaper)
        .then((data) => {
          commit('addNewspaper', newspaper)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    updateNewspaper ({commit}, payload) {
      //const updateObj = payload;
      // console.log("Thumbs up for " + payload.name + ": " + payload.thumbsUp)
      // console.log("Thumbs down for " + payload.name + ": " + payload.thumbsDown)

      firebase.database().ref('newspapers').child(payload.id).update(payload)
        .then((data) => {
          console.log(data)
          commit('updateNewspaper', payload)
        })
        .catch((error) => {
          console.log(error)
        })

    },
    signUserUp ({commit}, payload) {
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            const newUser = {
              id: user.uid,
              lastThumb: [],
              lastVote: []
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            console.log(error)
          }
        )
    },
    signUserIn ({commit, getters}, payload) {
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            const newUser = {
              id: user.uid,
              lastThumb: [],
              lastVote: [],
              //These need to be pulled from firebase
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            console.log(error)
          }
        )
    },
    autoSignIn ({commit}, payload) {
      commit('setUser', {
        id: payload.uid,
        lastThumb: [],
        lastVote: []
      })
    },
    logout ({commit}) {
        firebase.auth().signOut()
        commit('setUser', null)
    },
  },
  getters: {
    loadedNewspapers (state) {
      return state.loadedNewspapers
    },
    user (state) {
      return state.user
    }
  }
})
