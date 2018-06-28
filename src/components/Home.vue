<template>
  <v-container>
    <h1 v-show="user == null"> 🗳️ Create an account or sign in to start voting! </h1>
    <h1 v-show="user != null">👻 Average User Bias Score: {{sentiment}} <button class="btn btn-lg btn-primary" v-on:click="seen = !seen" v-show="user != null">Methodology</button></h1>
    <p v-if="seen">Users with a bias of between -0.5 and 0.5 are allowed to add new newspapers.</p>
    <p v-if="seen">If you tend to vote close to standarly accepted bias, your bias score will fall between (-0.5 and 0.5). Voting outside the accepted bias is encouraged, but voting Liberal on a strongly Conservative publication is suspect. This is to prevent users who vote maliciously from creating content.</p>


    <div>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn color="primary" dark slot="activator" class="mb-1" v-show="(sentiment <= 0.5 && sentiment >= -0.5)">New Item</v-btn>
        <v-card>
          <v-card-title>

            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field label="Newspaper" v-model="editedItem.name"></v-text-field>
                  <v-text-field label="URL" v-model="editedItem.url"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-data-table
        :headers="headers"
        :items="items"
        :user="user"
        class="elevation-1"
        hide-actions
      >
        <template slot="items" slot-scope="props">
          <td><a :href="props.item.url" target="_blank">{{ props.item.name }}</a></td>
          <td>
            <v-flex>
              <v-btn flat icon color="blue" @click="voteLib(props.item)" :disabled="user == null || user.lastVote[items.indexOf(props.item)] == 'lib'">
                <v-icon>web</v-icon>
                {{props.item.votesLib}}

              </v-btn>
              <v-btn flat icon color="light-blue" @click="voteModLib(props.item)" :disabled="user == null || user.lastVote[items.indexOf(props.item)] == 'modLib'">
                <v-icon>web</v-icon>
                {{props.item.votesModLib}}

              </v-btn>
              <v-btn flat icon color="purple" @click="voteCentrist(props.item)" :disabled="user == null || user.lastVote[items.indexOf(props.item)] == 'Centrist'">
                <v-icon>web</v-icon>
                {{props.item.votesCentrist}}

              </v-btn>
              <v-btn flat icon color="orange" @click="voteModRep(props.item)" :disabled="user == null || user.lastVote[items.indexOf(props.item)] == 'modRep'">
                <v-icon>web</v-icon>
                {{props.item.votesModRep}}

              </v-btn>
              <v-btn flat icon color="red" @click="voteRep(props.item)" :disabled="user == null || user.lastVote[items.indexOf(props.item)] == 'rep'">
                <v-icon>web</v-icon>
                {{props.item.votesRep}}

              </v-btn>
              <td class="text-xs-left">Bias towards {{props.item.biasTowards}} with {{ props.item.topVote }} votes</td>
            </v-flex>
          </td>

          <td class="text-xs-left">
            <v-btn flat icon color="green" @click="thumbUp(props.item)" :disabled="user == null || user.lastThumb[items.indexOf(props.item)] == 'up'">
              <v-icon>thumb_up</v-icon>
            </v-btn>
            <v-btn flat icon color="deep-orange" @click="thumbDown(props.item)" :disabled="user == null || user.lastThumb[items.indexOf(props.item)] == 'down'">
              <v-icon>thumb_down</v-icon>
            </v-btn>
          </td>


          <td class="text-xs-left">{{props.item.thumbsUp}} / {{props.item.thumbsDown}}</td>

          <td class="justify-center layout px-0">
            <v-btn icon class="mx-0" @click="editItem(props.item)" :disabled="user == null || !userIsAdmin(props.item)">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <!-- <v-btn icon class="mx-0" @click="deleteItem(props.item)" :disabled="user == null || !userIsCreator(props.item)">
              <v-icon color="pink">delete</v-icon>
            </v-btn> -->
          </td>

        </template>
        <template slot="no-data">
          <v-btn color="primary" @click="initialize">Reset</v-btn>
        </template>
      </v-data-table>
    </div>
  </v-container>
</template>

<style scoped>
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
    data: () => ({
      seen: false,
      dialog: false,
      headers: [
        {
          text: 'Newspaper',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        { text: 'Bias', sortable:false },
        { text: 'What do you think?', sortable:false },
        { text: 'Feedback', sortable:false },
        { text: 'Edit', sortable: false }
      ],
      editedIndex: -1,
      editedItem:{
        name: '',
        url: '',
        votesLib:0,
        votesModLib:0,
        votesCentrist:0,
        votesModRep:0,
        votesRep:0,
        topVote:0,
        biasTowards: '',
        thumbsUp:0,
        thumbsDown:0,
        index: 0,
         //array of comment objects. each comment has data, date, creatorID, likes, dislikes
      },
    }),
    computed: {
      sentiment () { //Ability to create sources is depepdent on aggregated sentiment score
        //Run through newspaper bias. ex. on liberal newspapers, you tend to vote moderately liberal
        if (this.$store.getters.user != null) {
          if (this.$store.getters.user.id == 'iMZJzquNYZWVwKewKRknakIQU8J2'){
            return 0;
          }
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
            weightLib +=0
          }
          if (votesLib[i] == 'modLib') {
            weightLib +=1
          }
          if (votesLib[i] == 'Centrist') {
            weightLib +=2
          }
          if (votesLib[i] == 'modRep') {
            weightLib +=3
          }
          if (votesLib[i] == 'rep') {
            weightLib +=4
          }
        }

        var averageLib = Math.round((weightLib/votesLib.length)*100)/100
        if (weightLib == 0 || votesLib.length == 0) {
          averageLib = 0
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
            weightModLib +=-1
          }
          if (votesModLib[i] == 'modLib') {
            weightModLib +=0
          }
          if (votesModLib[i] == 'Centrist') {
            weightModLib +=1
          }
          if (votesModLib[i] == 'modRep') {
            weightModLib +=2
          }
          if (votesModLib[i] == 'rep') {
            weightModLib +=3
          }
        }
        var averageModLib = Math.round((weightModLib/votesModLib.length)*100)/100
        if (weightModLib == 0 || votesModLib.length == 0) {
          averageModLib = 0
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
            weightCentrist +=-2
          }
          if (votesCentrist[i] == 'modLib') {
            weightCentrist +=-1
          }
          if (votesCentrist[i] == 'Centrist') {
            weightCentrist +=0
          }
          if (votesCentrist[i] == 'modRep') {
            weightCentrist +=1
          }
          if (votesCentrist[i] == 'rep') {
            weightCentrist +=2
          }
        }
        var averageCentrist = Math.round((weightCentrist/votesCentrist.length)*100)/100
        if (weightCentrist == 0 || votesCentrist.length == 0) {
          averageCentrist = 0
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
            weightModRep +=-3
          }
          if (votesModRep[i] == 'modLib') {
            weightModRep +=-2
          }
          if (votesModRep[i] == 'Centrist') {
            weightModRep +=-1
          }
          if (votesModRep[i] == 'modRep') {
            weightModRep +=0
          }
          if (votesModRep[i] == 'rep') {
            weightModRep +=1
          }
        }
        var averageModRep = Math.round((weightModRep/votesModRep.length)*100)/100
        if (weightModRep == 0 || votesModRep.length == 0) {
          averageModRep = 0
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
            weightRep +=-4
          }
          if (votesRep[i] == 'modLib') {
            weightRep +=-3
          }
          if (votesRep[i] == 'Centrist') {
            weightRep +=-2
          }
          if (votesRep[i] == 'modRep') {
            weightRep +=-1
          }
          if (votesRep[i] == 'rep') {
            weightRep +=0
          }
        }
        var averageRep = Math.round((weightRep/votesRep.length)*100)/100
        if (weightRep == 0 || votesRep.length == 0) {
          averageRep = 0
        }

        var averageBias = Math.round((averageLib+averageModLib+averageCentrist+averageModRep+averageRep)/(5)*100)/100

        var data = ["Score on liberal papers: " + averageLib,
        "Score on moderate liberal papers: " + averageModLib,
        "Score on centrist papers: " + averageCentrist,
        "Score on moderate conservative papers: " + averageModRep,
        "Score on conservative papers: " + averageRep,
        "Overall bias score: " + averageBias]

        //Acceptable bias score will be between 2.5-3.5
        //averageBias - 2.5 >=0 || 3.5 - averageBias >= 1

        var quoteCount = 0
        for (let i in userData){
          if (userData[i] == ""){
            quoteCount++
          }
        }
        if (quoteCount == userData.length) {
          return "N/A";
        }
        return averageBias
      }
      else {
        return "Create an account or sign in to start voting!";
      }
      },

      formTitle () {
        var i = this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        return i;
      },
      //Loads in items from store
      user () {
        return this.$store.getters.user
      },
      items () {
        if (this.user == null){ //This will be important for "guest" mode
          return this.$store.getters.loadedNewspapers
        }
        var thumbArr = Array(this.$store.getters.loadedNewspapers.length).fill('')
        var voteArr = Array(this.$store.getters.loadedNewspapers.length).fill('')
        for (var i = 0; i < thumbArr.length; i++){
          if (this.user.lastThumb[i] !== ''){
            thumbArr[i] = this.user.lastThumb[i]
          }
          if( thumbArr[i] == undefined){
            thumbArr[i] = ''
          }
        }
        for (var i = 0; i < voteArr.length; i++){
          if (this.user.lastVote[i] !== ''){
            voteArr[i] = this.user.lastVote[i]
          }
          if( voteArr[i] == undefined){
            voteArr[i] = ''
          }
        }


        this.user.lastThumb = thumbArr;
        this.user.lastVote = voteArr;
        //console.log(this.$store.getters.loadedNewspapers)
        return this.$store.getters.loadedNewspapers
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created () {
      this.initialize()
    },

    methods: {
      initialize () {
        this.items = []
      },

      editItem (item) {
        this.editedIndex = this.items.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        const index = this.items.indexOf(item)
        confirm('Are you sure you want to delete this item?') && this.items.splice(index, 1)
        //recalculate indicies
        //need to also recalculate vote/thumb arrays
        for (var i = 0; i < this.items.length; i++){
          this.items[i].index = i;
        }

      },

      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },
      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.items[this.editedIndex], this.editedItem)
          this.$store.dispatch('updateNewspaper', this.editedItem)
          console.log("Edited index: " + this.editedIndex)
          console.log("Actual index: " + this.editedItem.index)
        } else {
          //New list items
          //Need to also recalculate vote/thumb arrays
          var i;
          for (i = 0; i < this.items.length; i++){
            this.items[i].index = i;
          }
          var newIndex = i;
          const newNewspaper = {
            creatorID: this.$store.getters.user.id,
            name: '',
            url: '',
            votesLib:0,
            votesModLib:0,
            votesCentrist:0,
            votesModRep:0,
            votesRep:0,
            topVote:0,
            biasTowards: '',
            thumbsUp:0,
            thumbsDown:0,
            index: 0,
          };
          newNewspaper.index = newIndex;
          newNewspaper.name = this.editedItem.name;
          newNewspaper.url = this.editedItem.url;
          this.$store.dispatch('addNewspaper', newNewspaper)
        }
        this.close()
        location.reload();
      },
      userIsCreator(item) {
        var itemIndex = this.items.indexOf(item)
        return this.$store.getters.user.id == this.items[itemIndex].creatorID || this.$store.getters.user.id == 'iMZJzquNYZWVwKewKRknakIQU8J2'; //admin ID
      },
      userIsAdmin(item) {
        return this.$store.getters.user.id == 'iMZJzquNYZWVwKewKRknakIQU8J2'; //admin ID admin@skew.com admin123
      },

      thumbUp(item){
        var itemIndex = this.items.indexOf(item); //
        if (this.user.lastThumb[itemIndex] == ''){
          this.items[itemIndex].thumbsUp++;
          this.user.lastThumb[itemIndex] = 'up';
          console.log(this.user.lastThumb)
          const updatedNewspaper = this.items[itemIndex];
          //console.log("Payload name: " + updatedNewspaper.name)
          this.$store.dispatch('updateNewspaper', updatedNewspaper) //"Update thumb up"
          this.$store.dispatch('updateUserThumbs', this.user.lastThumb)
        }
        else if (this.user.lastThumb[itemIndex] == 'down'){
          this.items[itemIndex].thumbsUp++;
          this.items[itemIndex].thumbsDown--;
          this.user.lastThumb[itemIndex] = 'up';
          console.log(this.user.lastThumb)
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper) //"Update thumb up"
          this.$store.dispatch('updateUserThumbs', this.user.lastThumb)
        }
        else{
          console.log("Spam prevention");
        }
      },
      thumbDown(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastThumb[itemIndex] == ''){
          this.items[itemIndex].thumbsDown++;
          this.user.lastThumb[itemIndex] = 'down';
          console.log(this.user.lastThumb)
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserThumbs', this.user.lastThumb)

        }
        else if (this.user.lastThumb[itemIndex] == 'up'){
          this.items[itemIndex].thumbsUp--;
          this.items[itemIndex].thumbsDown++;
          this.user.lastThumb[itemIndex] = 'down';
          console.log(this.user.lastThumb)
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserThumbs', this.user.lastThumb)

        }
        else{
          console.log("Spam prevention");
        }

      //WARNING: Spaghetti code below
      },
      voteLib(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastVote[itemIndex] == ''){
          this.items[itemIndex].votesLib++
          this.user.lastVote[itemIndex] = 'lib'
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper)
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modLib'){
          this.items[itemIndex].votesLib++;
          this.items[itemIndex].votesModLib--;
          this.user.lastVote[itemIndex]='lib'
          if (this.items[itemIndex].biasTowards == 'Moderate Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='Centrist'){
          this.items[itemIndex].votesLib++;
          this.items[itemIndex].votesCentrist--;
          this.user.lastVote[itemIndex]='lib'
          if (this.items[itemIndex].biasTowards == 'Centrist'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modRep'){
          this.items[itemIndex].votesLib++;
          this.items[itemIndex].votesModRep--;
          this.user.lastVote[itemIndex]='lib'
          if (this.items[itemIndex].biasTowards == 'Moderate Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='rep'){
          this.items[itemIndex].votesLib++;
          this.items[itemIndex].votesRep--;
          this.user.lastVote[itemIndex]='lib'
          if (this.items[itemIndex].biasTowards == 'Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else{
          console.log("Spam prevention");
        }
        if (this.items[itemIndex].votesLib >= this.items[itemIndex].topVote){
          this.items[itemIndex].topVote = this.items[itemIndex].votesLib;
          this.items[itemIndex].biasTowards = 'Liberal';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);

        }
        console.log(this.user.lastVote)
      },
      voteModLib(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastVote[itemIndex]==''){
          this.items[itemIndex].votesModLib++;
          this.user.lastVote[itemIndex]='modLib';
          const updatedNewspaper = this.items[itemIndex];

          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='lib'){
          this.items[itemIndex].votesModLib++;
          this.items[itemIndex].votesLib--;
          this.user.lastVote[itemIndex]='modLib'
          if (this.items[itemIndex].biasTowards == 'Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='Centrist'){
          this.items[itemIndex].votesModLib++;
          this.items[itemIndex].votesCentrist--;
          this.user.lastVote[itemIndex]='modLib'
          if (this.items[itemIndex].biasTowards == 'Centrist'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modRep'){
          this.items[itemIndex].votesModLib++;
          this.items[itemIndex].votesModRep--;
          this.user.lastVote[itemIndex]='modLib'
          if (this.items[itemIndex].biasTowards == 'Moderate Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='rep'){
          this.items[itemIndex].votesModLib++;
          this.items[itemIndex].votesRep--;
          this.user.lastVote[itemIndex]='modLib'
          if (this.items[itemIndex].biasTowards == 'Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else{
          console.log("Spam prevention");
        }
        if (this.items[itemIndex].votesModLib >= this.items[itemIndex].topVote){
          this.items[itemIndex].topVote = this.items[itemIndex].votesModLib;
          this.items[itemIndex].biasTowards = 'Moderate Liberal';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);

        }
        console.log(this.user.lastVote)

      },
      voteCentrist(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastVote[itemIndex]==''){
          this.items[itemIndex].votesCentrist++;
          this.user.lastVote[itemIndex]='Centrist';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='lib'){
          this.items[itemIndex].votesCentrist++;
          this.items[itemIndex].votesLib--;
          this.user.lastVote[itemIndex]='Centrist';
          if (this.items[itemIndex].biasTowards == 'Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modLib'){
          this.items[itemIndex].votesCentrist++;
          this.items[itemIndex].votesModLib--;
          this.user.lastVote[itemIndex]='Centrist';
          if (this.items[itemIndex].biasTowards == 'Moderate Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modRep'){
          this.items[itemIndex].votesCentrist++;
          this.items[itemIndex].votesModRep--;
          this.user.lastVote[itemIndex]='Centrist';
          if (this.items[itemIndex].biasTowards == 'Moderate Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='rep'){
          this.items[itemIndex].votesCentrist++;
          this.items[itemIndex].votesRep--;
          this.user.lastVote[itemIndex]='Centrist';
          if (this.items[itemIndex].biasTowards == 'Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else{
          console.log("Spam prevention");
        }
        if (this.items[itemIndex].votesCentrist >= this.items[itemIndex].topVote){
          this.items[itemIndex].topVote = this.items[itemIndex].votesCentrist;
          this.items[itemIndex].biasTowards = 'Centrist';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);

        }
        console.log(this.user.lastVote)

      },
      voteModRep(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastVote[itemIndex]==''){
          this.items[itemIndex].votesModRep++;
          this.user.lastVote[itemIndex]='modRep';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='lib'){
          this.items[itemIndex].votesModRep++;
          this.items[itemIndex].votesLib--;
          this.user.lastVote[itemIndex]='modRep';
          if (this.items[itemIndex].biasTowards == 'Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modLib'){
          this.items[itemIndex].votesModRep++;
          this.items[itemIndex].votesModLib--;
          this.user.lastVote[itemIndex]='modRep';
          if (this.items[itemIndex].biasTowards == 'Moderate Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='Centrist'){
          this.items[itemIndex].votesModRep++;
          this.items[itemIndex].votesCentrist--;
          this.user.lastVote[itemIndex]='modRep';
          if (this.items[itemIndex].biasTowards == 'Centrist'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='rep'){
          this.items[itemIndex].votesModRep++;
          this.items[itemIndex].votesRep--;
          this.user.lastVote[itemIndex]='modRep';
          if (this.items[itemIndex].biasTowards == 'Conservative'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else{
          console.log("Spam prevention");
        }
        if (this.items[itemIndex].votesModRep >= this.items[itemIndex].topVote){
          this.items[itemIndex].topVote = this.items[itemIndex].votesModRep;
          this.items[itemIndex].biasTowards = 'Moderate Conservative';

          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);

        }
        console.log(this.user.lastVote)

      },
      voteRep(item){
        var itemIndex = this.items.indexOf(item);
        if (this.user.lastVote[itemIndex]==''){
          this.items[itemIndex].votesRep++;
          this.user.lastVote[itemIndex]='rep';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='lib'){
          this.items[itemIndex].votesRep++;
          this.items[itemIndex].votesLib--;
          this.user.lastVote[itemIndex]='rep';
          if (this.items[itemIndex].biasTowards == 'Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modLib'){
          this.items[itemIndex].votesRep++;
          this.items[itemIndex].votesCentrist--;
          this.user.lastVote[itemIndex]='rep';
          if (this.items[itemIndex].biasTowards == 'Moderate Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='Centrist'){
          this.items[itemIndex].votesRep++;
          this.items[itemIndex].votesCentrist--;
          this.user.lastVote[itemIndex]='rep';
          if (this.items[itemIndex].biasTowards == 'Centrist'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else if (this.user.lastVote[itemIndex]=='modRep'){
          this.items[itemIndex].votesRep++;
          this.items[itemIndex].votesModRep--;
          this.user.lastVote[itemIndex]='rep';
          if (this.items[itemIndex].biasTowards == 'Moderate Liberal'){
            this.items[itemIndex].topVote--;
          }
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
          this.$store.dispatch('updateUserVotes', this.user.lastVote)

        }
        else{
          console.log("Spam prevention");
        }
        if (this.items[itemIndex].votesRep >= this.items[itemIndex].topVote){
          this.items[itemIndex].topVote = this.items[itemIndex].votesRep;
          this.items[itemIndex].biasTowards = 'Conservative';
          const updatedNewspaper = this.items[itemIndex];
          this.$store.dispatch('updateNewspaper', updatedNewspaper);
        }
        console.log(this.user.lastVote)

      }
    }
  }
</script>
