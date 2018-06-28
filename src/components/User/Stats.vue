<template>
  <div>
    <div class="userVotes">
      <h2>📊 User Analytics </h2>
      <br><hr><br>
      <h3>✅ Approval Breakdown </h3>
      <div v-for="i in both">
        {{i}}
      </div>
      <div id="approvalRating">
        Your average approval rating: <b>{{approval}}</b>
      </div>
    </div>
    <div class="averageVote">
      <hr><br>
      <h3>🗳️ Average Vote </h3>
      You have voted on {{voteLength}} sources with an average rating of {{voteAverage}}
      <br><button class="btn btn-lg btn-primary" v-on:click="seen = !seen">Methodology</button><br>
      <p v-if="seen">Compilation of all the user's voting preferences. Given an even spread of newspapers from across the spectrum (ex. 1 newspaper from each bias category), a user with little bias will have a score near 3.</p>
      <p v-if="seen">Ex. 5 votes: Liberal (assign 1 point to average), Moderate Liberal (2 pts), Centrist (3 pts), Moderate Conservative (4 pts), Conservative (5 pts) = (1+2+3+4+5)/5 = 3 (Centrist)</p>
      <p v-if="seen">*Score on 1-5 scale, 1 being Liberal, 5 being Conservative.</p>
    </div>
    <div class="userSentiment">
      <hr><br>
      <h3>😎 User Sentiment </h3>
      <button class="btn btn-lg btn-primary" v-on:click="seen2 = !seen2">Methodology</button><br>
      <p v-if="seen2">Newspapers were categorized into groups based on bias. Then, the voting habits of the user are compared group.</p>
      <p v-if="seen2">Ex. If there are 3 Liberal papers, and a user votes Liberal, Centrist, and Conservative respectively, the user's overall score will be (1+3+5)/3 = 3. Therefore, they think most Liberal-leaning papers are Centrist (indication of a personal bias). </p>
      <p v-if="seen2">*Score on 1-5 scale, 1 being Liberal, 5 being Conservative. </p>

      <div v-for="(i, index) in sentiment">


        <li>{{i}}</li>
      </div>
    </div>

    <div class="sourcesAdded">
      <hr><br>
      <h3>➕ Newspapers You've Added </h3>
      <div v-for="i in papersAdded">
        <li>{{i}}</li>
      </div>
    </div>
  </div>

</template>

<style scoped>
  .userVotes, .averageVote, .userSentiment, .sourcesAdded {
    padding-top: 25px;
    font-size: 20px;
    margin-left: 40px;
  }
  .sourcesAdded {
    padding-bottom: 100px;
  }
  p {
    font-size: 17px;
  }
  hr {
    opacity: 0.2;
    margin-right: 80%;
  }
</style>

<script>
export default {
  data () {
    return {
      seen: false,
      seen2: false,
    }
  },
  computed: {
    user () {
      console.log(this.$store.getters.user)
      return this.$store.getters.user
    },
    items () {
      console.log(this.$store.getters.loadedNewspapers)
      return this.$store.getters.loadedNewspapers
    },
    papersAdded () {
      var paperData = this.$store.getters.loadedNewspapers
      var created = []
      for (var i = 0; i<paperData.length; i++){
        if (paperData[i].creatorID == this.user.id){
          console.log()
          var rating = Math.round(paperData[i].thumbsUp/(paperData[i].thumbsUp+paperData[i].thumbsDown)*100*100)/100
          if (isNaN(rating)){
            rating = paperData[i].name + ' has not yet been voted on!'
          }
          else {
            rating = paperData[i].name + " with an approval rating of " + rating + "%"
          }
          created.push(rating)
        }
      }
      console.log(created)
      return created
    },
    both () {
      var userData = this.$store.getters.user.lastThumb
      var paperData = this.$store.getters.loadedNewspapers
      var data = []
      for (var i = 0; i<paperData.length; i++){
          var vote = userData[i]
          if (vote == ''){
            vote = 'N/A'
          }
          if (vote == 'up'){
            vote = '👍'
          }
          if (vote == 'down'){
            vote = '👎'
          }
          data.push(paperData[i].name + ' ' + vote)
      }
      return data
    },
    voteLength () {
      var userData = this.$store.getters.user
      console.log(userData)
      var count = 0;
      for (var i = 0; i<userData.lastVote.length; i++){
        count++
        if (userData.lastVote[i] == '') {
          count--
        }
      }
      return count
    },
    voteAverage () {
      var userData = this.$store.getters.user
      console.log(userData)
      var count = 0;
      for (var i = 0; i<userData.lastVote.length; i++){
        if (userData.lastVote[i] == '') {
          count+=0
        }
        if (userData.lastVote[i] == 'lib') {
          count+=1
        }
        if (userData.lastVote[i] == 'modLib') {
          count+=2
        }
        if (userData.lastVote[i] == 'Centrist') {
          count+=3
        }
        if (userData.lastVote[i] == 'modRep') {
          count+=4
        }
        if (userData.lastVote[i] == 'rep') {
          count+=5
        }
      }
      console.log(count)
      var len = 0;
      for (var i = 0; i<userData.lastVote.length; i++){
        len++
        if (userData.lastVote[i] == '') {
          len--
        }
      }
      var weight = ((count/len))
      var answer = ''
      if (weight <= 1) {
        answer = Math.round(weight*100)/100 + " (Liberal-leaning)"
      }
      if (weight >1 && weight <=2) {
        answer = Math.round(weight*100)/100 + " (Moderate Liberal-leaning)"
      }
      if (weight >2 && weight <=3) {
        answer = Math.round(weight*100)/100 + " (Centrist)"
      }
      if (weight >3 && weight <=4) {
        answer = Math.round(weight*100)/100 + " (Moderate Conservative-leaning)"
      }
      if (weight >4 && weight <=5) {
        answer = Math.round(weight*100)/100 + " (Conservative-leaning)"
      }
      return answer
    },
    sentiment () { //Ability to create sources is depepdent on aggregated sentiment score
      //Run through newspaper bias. ex. on liberal newspapers, you tend to vote moderately liberal
      var userData = this.$store.getters.user.lastVote
      var paperData = this.$store.getters.loadedNewspapers
      var bias = []
      var lib = []
      var modLib = []
      var centrist = []
      var modRep = []
      var rep = []

      for (var i = 0; i<paperData.length; i++) {
        if (paperData[i].biasTowards == 'Liberal'){
          lib.push(paperData[i].index)
        }
        if (paperData[i].biasTowards == 'Moderate Liberal'){
          modLib.push(paperData[i].index)
        }
        if (paperData[i].biasTowards == 'Centrist'){
          centrist.push(paperData[i].index)
        }
        if (paperData[i].biasTowards == 'Moderate Conservative'){
          modRep.push(paperData[i].index)
        }
        if (paperData[i].biasTowards == 'Conservative'){
          rep.push(paperData[i].index)
        }
      }
      var votesLib = []
      for (let i in lib) {
        votesLib.push(this.$store.getters.user.lastVote[lib[i]])
      }
      var weightLib = 0;
      for (let i in votesLib){
        if (votesLib[i] == '') {
          weightLib +=0
        }
        if (votesLib[i] == 'lib') {
          weightLib +=1
        }
        if (votesLib[i] == 'modLib') {
          weightLib +=2
        }
        if (votesLib[i] == 'Centrist') {
          weightLib +=3
        }
        if (votesLib[i] == 'modRep') {
          weightLib +=4
        }
        if (votesLib[i] == 'rep') {
          weightLib +=5
        }
      }

      var averageLib = Math.round((weightLib/votesLib.length)*100)/100
      if (weightLib == 0 || votesLib.length == 0) {
        averageLib = 0
      }

      var libSentiment = ''
      if (averageLib == 0){
        libSentiment = 'You have not voted on any liberal-leaning newspapers!'
      }
      if (averageLib >0 && averageLib <= 1) {
        libSentiment = "On liberal-leaning newspapers, you tended to vote liberal. Average score: " + averageLib
      }
      if (averageLib >1 && averageLib <=2) {
        libSentiment = "On liberal-leaning newspapers, you tended to vote moderately liberal. Average score: " + averageLib
      }
      if (averageLib >2 && averageLib <=3) {
        libSentiment = "On liberal-leaning newspapers, you tended to vote centrist. Average score: " + averageLib
      }
      if (averageLib >3 && averageLib <=4) {
        libSentiment = "On liberal-leaning newspapers, you tended to vote moderately conservative. Average score: " + averageLib
      }
      if (averageLib >4 && averageLib <=5) {
        libSentiment = "On liberal-leaning newspapers, you tended to vote conservative. Average score: " + averageLib
      }

      var votesModLib = []
      for (let i in modLib) {
        votesModLib.push(this.$store.getters.user.lastVote[modLib[i]])
      }
      var weightModLib = 0;
      for (let i in votesModLib){
        if (votesModLib[i] == '') {
          weightModLib +=0
        }
        if (votesModLib[i] == 'lib') {
          weightModLib +=1
        }
        if (votesModLib[i] == 'modLib') {
          weightModLib +=2
        }
        if (votesModLib[i] == 'Centrist') {
          weightModLib +=3
        }
        if (votesModLib[i] == 'modRep') {
          weightModLib +=4
        }
        if (votesModLib[i] == 'rep') {
          weightModLib +=5
        }
      }
      var averageModLib = Math.round((weightModLib/votesModLib.length)*100)/100
      if (weightModLib == 0 || votesModLib.length == 0) {
        averageModLib = 0
      }

      var modLibSentiment = ''
      if (averageModLib == 0){
        modLibSentiment = 'You have not voted on any moderately liberal-leaning newspapers!'
      }
      if (averageModLib >0 && averageModLib <= 1) {
        modLibSentiment = "On moderate liberal-leaning newspapers, you tended to vote liberal. Average score: " + averageModLib
      }
      if (averageModLib >1 && averageModLib <=2) {
        modLibSentiment = "On moderate liberal-leaning newspapers, you tended to vote moderately liberal. Average score: " + averageModLib
      }
      if (averageModLib >2 && averageModLib <=3) {
        modLibSentiment = "On moderate liberal-leaning newspapers, you tended to vote centrist. Average score: " + averageModLib
      }
      if (averageModLib >3 && averageModLib <=4) {
        modLibSentiment = "On moderate liberal-leaning newspapers, you tended to vote moderately conservative. Average score: " + averageModLib
      }
      if (averageModLib >4 && averageModLib <=5) {
        modLibSentiment = "On moderate liberal-leaning newspapers, you tended to vote conservative. Average score: " + averageModLib
      }

      var votesCentrist = [] //How the user voted on "Centrist" newspapers
      for (let i in centrist) {
        votesCentrist.push(this.$store.getters.user.lastVote[centrist[i]])
      }

      var weightCentrist = 0;
      for (let i in votesCentrist){
        if (votesCentrist[i] == '') {
          weightCentrist +=0
        }
        if (votesCentrist[i] == 'lib') {
          weightCentrist +=1
        }
        if (votesCentrist[i] == 'modLib') {
          weightCentrist +=2
        }
        if (votesCentrist[i] == 'Centrist') {
          weightCentrist +=3
        }
        if (votesCentrist[i] == 'modRep') {
          weightCentrist +=4
        }
        if (votesCentrist[i] == 'rep') {
          weightCentrist +=5
        }
      }
      var averageCentrist = Math.round((weightCentrist/votesCentrist.length)*100)/100
      if (weightCentrist == 0 || votesCentrist.length == 0) {
        averageCentrist = 0
      }

      var centristSentiment = ''
      if (averageCentrist == 0){
        centristSentiment = 'You have not voted on any centrist newspapers!'
      }
      if (averageCentrist >0 && averageCentrist <= 1) {
        centristSentiment = "On centrist newspapers, you tended to vote liberal. Average score: " + averageCentrist
      }
      if (averageCentrist >1 && averageCentrist <=2) {
        centristSentiment = "On centrist newspapers, you tended to vote moderately liberal. Average score: " + averageCentrist
      }
      if (averageCentrist >2 && averageCentrist <=3) {
        centristSentiment = "On centrist newspapers, you tended to vote centrist. Average score: " + averageCentrist
      }
      if (averageCentrist >3 && averageCentrist <=4) {
        centristSentiment = "On centrist newspapers, you tended to vote moderately conservative. Average score: " + averageCentrist
      }
      if (averageCentrist >4 && averageCentrist <=5) {
        centristSentiment = "On centrist newspapers, you tended to vote conservative. Average score: " + averageCentrist
      }

      var votesModRep = [] //How the user voted on "Centrist" newspapers
      for (let i in modRep) {
        votesModRep.push(this.$store.getters.user.lastVote[modRep[i]])
      }

      var weightModRep = 0;
      for (let i in votesModRep){
        if (votesModRep[i] == '') {
          weightModRep +=0
        }
        if (votesModRep[i] == 'lib') {
          weightModRep +=1
        }
        if (votesModRep[i] == 'modLib') {
          weightModRep +=2
        }
        if (votesModRep[i] == 'Centrist') {
          weightModRep +=3
        }
        if (votesModRep[i] == 'modRep') {
          weightModRep +=4
        }
        if (votesModRep[i] == 'rep') {
          weightModRep +=5
        }
      }
      var averageModRep = Math.round((weightModRep/votesModRep.length)*100)/100
      if (weightModRep == 0 || votesModRep.length == 0) {
        averageModRep = 0
      }

      var modRepSentiment = ''
      if (averageModRep == 0){
        modRepSentiment = 'You have not voted on any moderately conservative-leaning newspapers!'
      }
      if (averageModRep >0 && averageModRep <= 1) {
        modRepSentiment = "On moderate conservative-leaning newspapers, you tended to vote liberal. Average score: " + averageModRep
      }
      if (averageModRep >1 && averageModRep <=2) {
        modRepSentiment = "On moderate conservative-leaning newspapers, you tended to vote moderately liberal. Average score: " + averageModRep
      }
      if (averageModRep >2 && averageModRep <=3) {
        modRepSentiment = "On moderate conservative-leaning newspapers, you tended to vote centrist. Average score: " + averageModRep
      }
      if (averageModRep >3 && averageModRep <=4) {
        modRepSentiment = "On moderate conservative-leaning newspapers, you tended to vote moderately conservative. Average score: " + averageModRep
      }
      if (averageModRep >4 && averageModRep <=5) {
        modRepSentiment = "On moderate conservative-leaning newspapers, you tended to vote conservative. Average score: " + averageModRep
      }

      var votesRep = []
      for (let i in rep) {
        votesRep.push(this.$store.getters.user.lastVote[rep[i]])
      }

      var weightRep = 0;
      for (let i in votesRep){
        if (votesRep[i] == '') {
          weightRep +=0
        }
        if (votesRep[i] == 'lib') {
          weightRep +=1
        }
        if (votesRep[i] == 'modLib') {
          weightRep +=2
        }
        if (votesRep[i] == 'Centrist') {
          weightRep +=3
        }
        if (votesRep[i] == 'modRep') {
          weightRep +=4
        }
        if (votesRep[i] == 'rep') {
          weightRep +=5
        }
      }
      var averageRep = Math.round((weightRep/votesRep.length)*100)/100
      if (weightRep == 0 || votesRep.length == 0) {
        averageRep = 0
      }

      var repSentiment = ''
      if (averageRep == 0){
        repSentiment = 'You have not voted on any conservative-leaning newspapers!'
      }
      if (averageRep >0 && averageRep <= 1) {
        repSentiment = "On conservative-leaning newspapers, you tended to vote liberal. Average score: " + averageRep
      }
      if (averageRep >1 && averageRep <=2) {
        repSentiment = "On conservative-leaning newspapers, you tended to vote moderately liberal. Average score: " + averageRep
      }
      if (averageRep >2 && averageRep <=3) {
        repSentiment = "On conservative-leaning newspapers, you tended to vote centrist. Average score: " + averageRep
      }
      if (averageRep >3 && averageRep <=4) {
        repSentiment = "On conservative-leaning newspapers, you tended to vote moderately conservative. Average score: " + averageRep
      }
      if (averageRep >4 && averageRep <=5) {
        repSentiment = "On conservative-leaning newspapers, you tended to vote conservative. Average score: " + averageRep
      }

      var data = []
      data.push(libSentiment)
      data.push(modLibSentiment)
      data.push(centristSentiment)
      data.push(modRepSentiment)
      data.push(repSentiment)

      return data
    },
    approval () {
      var userData = this.$store.getters.user.lastThumb
      var likes = 0;
      var dislikes = 0;
      for (var i = 0; i<userData.length; i++){
        if (userData[i] == 'down'){
          dislikes++;
        }
        if (userData[i] == 'up'){
          likes++;
        }
      }
      if (likes == 0 && dislikes == 0){
        return "No data submitted. Go vote!"
      }
      var total = Math.floor(likes/(likes+dislikes)*100) + "%"
      return total
    }
  }
}
</script>
