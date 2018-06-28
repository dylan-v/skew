<template>
  <div>
    <div class="heading">
      <h3> Skew provides crowd-sourced insight into the political bias of newspapers.</h3>
      <div class="pics">
        <img src="./banner.png"></img>
      </div>
    </div>
    <br><hr><br>
    <div class="features">
      <ul>
        <li class="bold">👶 Guest Features </li>
        <li>👍 View newspaper ratings (bias and approval).</li>
        <li>👥 Create an account.</li><br>
        <li class="bold">😎 User Features </li>
        <li>📋 Login to an existing account with saved voting/approval preferences.</li>
        <li>📄 Auto-login between sessions.
        <li>🗳️ Vote on political bias and approval rating.</li>
        <li>📊 View newspaper data visualiations.</li>
        <li>➕ Add newspapers to be voted on.</li><br>
        <li class="bold">🤠 Administrative Features </li>
        <li>✏️ Edit the name and URL of newspapers.</li>

      </ul>
    </div>
  </div>

</template>

<style scoped>
  .heading {
    padding-top: 25px;
    font-size: 30px;
    text-align: center;
  }
  .pics {
    padding-top: 20px;
    opacity: 0.3;
    text-align: center;
  }
  hr {
    opacity: 0.1;
  }
  .footering {
    padding-top: 25px;
    font-size: 50px;
    text-align: left;
  }
  li, ul {
    font-size: 20px;
    list-style: circle;
    text-align: center;
  }
  .bold {
    font-weight: bold;
    font-size: 23px;
  }
  .features {
    padding-bottom: 100px;
  }
</style>

<script>



export default {
  data () {
    return {
    }
  }
}
</script>
