<template>
  <p>
    <nav class="displayText">
      <!-- <img src="@/assets/智慧科研教学.jpg" id="logo" > -->
     
      <router-link to="/"  class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon size="small"><ChatDotRound /></el-icon>
          LLM对话
      </router-link> 
      <br/>
      <router-link to="/knowledge"  class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon><MessageBox /></el-icon>
          知识库问答
      </router-link> 
      <br/>
      <router-link to="/file" class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon><FolderOpened /></el-icon>
        文件对话
      </router-link>
      <br/>
      <router-link to="/search" class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon><Search /></el-icon>
        搜索引擎问答
      </router-link>
      <br/>
      <router-link to="/agent" class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon><Edit /></el-icon>
        自定义Agent问答
      </router-link>
      <br/>
      <router-link to="/knowledgeManage" class="menu" @mouseover="colorOn" @mouseout="colorOff">
        <el-icon><Operation /></el-icon>
        知识库管理
      </router-link>
       <p id="text">当前版本: v0.2.8</p>
    </nav>
    <div id="view"> <router-view/></div>
    
  </p>
 
</template>

<style>
#text{
  color: #6a99d0;
  font-size: 13px;
  text-align: right;
  line-height: 10px;

}
#logo{
  width: 90%;
  /* height: 128px; */
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#view{
  height: 10%;
  /* display: none; */
}
.menu{
  
  height: 50px;
  width: 10%;
  line-height: 50px;
  /* background-color: aliceblue; */
}

nav {
  padding: 20px;
  position: absolute;
  left: 0;
  top: 0;
  width: 12.5%;
  box-sizing: border-box;
  height: 100%;
  /* background: linear-gradient(to right, #ff7e5f, #feb47b); */
  background-color: #2d3e53;
  text-align: left;
  z-index: 100;
}


nav a {
  text-decoration: none;
  font-weight: bold;
  color:  #6a99d0;
  font-size: 17px;
  
}

nav a.router-link-exact-active {
  text-decoration: none;
  color: #dddddd;
  font-size: 17px;
}
.mouseOn{
  color:#b4cce7;
}
body{
    background-color: #e5e7e8;
    overflow: hidden;
}
.displayText {
  user-select: none;
}
</style>

<script>
  import { ref } from "vue";
  import ElementPlus from 'element-plus'
    export default {
      name: 'App',
      setup(){
        function colorOn(event){
          event.target.classList.add("mouseOn");

        }
        function colorOff(event){
          event.target.classList.remove("mouseOn");

        }
        return{
          colorOn,
          colorOff
        }
        
      }
    }


</script>