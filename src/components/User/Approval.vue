<template>
    <div class="chart-container">
      <chartjs-pie v-for="(charts, index) in items"
      v-bind:labels="charts.labels"
      v-bind:datasets="charts.dataset"
      v-bind:option="charts.option">
    </chartjs-pie>
    </div>
    <!-- <div v-html="html"></div> -->
</template>
<script>
import * as firebase from 'firebase'



export default {
  data () {
    return {
    }
  },
  mounted: function() {


  },
  methods: {

  },
  computed: {
    user () {
      console.log(this.$store.getters.user)
      return this.$store.getters.user
    },
    items () {
      var newspaperData = this.$store.getters.loadedNewspapers
      var testData = []
      var newspapers = []
      var votearr = []
      var colorarr = ["Green", "Red"]
      var namesarr = []
      for (let key in newspaperData){
        namesarr.push(newspaperData[key].name)
        votearr.push(parseInt(newspaperData[key].thumbsUp))
        votearr.push(parseInt(newspaperData[key].thumbsDown))
        newspapers.push({
          data: votearr,
          backgroundColor: colorarr,
          names: namesarr
        })
        votearr = []
      }

      for (let index in newspapers) {
        testData.push({
          type: 'pie',
          labels: ["Approve", "Disapprove"],
          dataset: [{
            data: newspapers[index].data,
            backgroundColor: newspapers[index].backgroundColor,
            hoverBackgroundColor: "black"
          }],
          option: {
            title: {
              display: true,
              positions: "bottom",
              text: newspapers[index].names[index],
              fontColor: "white",
              fontSize: 60
            },
            legend: {
              labels: {
                  fontColor: "white",
                  fontSize: 20
            }
        },
          }
        })
      }
      console.log(testData)
      return testData
    },


    chartData () {
      const newspapers = []
      var testData = []
      firebase.database().ref('newspapers').once('value') //Change to on
        .then((data) => {
          var votearr = []
          var colorarr = ["Blue", "Lightblue", "Purple", "Pink", "Red"]
          var namesarr = []
          const newspaperData = data.val()
          for (let key in newspaperData){
            console.log("updating values")
            namesarr.push(newspaperData[key].name)
            votearr.push(parseInt(newspaperData[key].votesLib))
            votearr.push(parseInt(newspaperData[key].votesModLib))
            votearr.push(parseInt(newspaperData[key].votesCentrist))
            votearr.push(parseInt(newspaperData[key].votesModRep))
            votearr.push(parseInt(newspaperData[key].votesRep))
            newspapers.push({
              data: votearr,
              backgroundColor: colorarr,
              names: namesarr
            })
            votearr = []
          }

          for (let index in newspapers) {
            testData.push({
              labels: ["Liberal", "Moderate Liberal", "Centrist", "Moderate Republican", "Republican"],
              dataset: [{
                data: newspapers[index].data,
                backgroundColor: newspapers[index].backgroundColor
              }],
              option: {
                title: {
                  display: true,
                  positions: "bottom",
                  text: newspapers[index].names[index]
                }
              }
            })
          }
        })
        .catch((error) => {
          console.log(error)
        })
      console.log(testData)
      return testData
    }
  }
}
</script>
