<template>
    <div height="780px" id="chatchat"
    ref="scrollDiv"
      style="position: absolute; left: 15%; width: 67%; top: 7%; padding: 8px;"
      >
      
  <div 
  v-show="currentIndex==-1"
  style="position: absolute; left: 50%;top: 50%; font-size: 30px; color: #a3a5a6;transform: translate(-50%,-50%);"
  class="displayText"
  > 请新建或选择一个对话</div>
      <div id="dialogContainer">
  
      </div>
  </div>
  
  
  
  
      <div id="inputBox" >
          <el-input 
          id="spsp"  
          v-model="textarea1"
          style="width: 80%;font-size: 15px;"
          autosize
          type="textarea"
          :placeholder="currentIndex==-1?'':(isWorking==false?'请输入对话内容，换行请用Shift+Enter。输入/help查看自定义命令':'正在回答中，请稍后')"

          clearable
          @keydown.enter="handleEnter"
          :disabled="currentIndex==-1||isWorking==true?true:false"
        />
        <el-button type="primary" round id="btn" @click="handleEnter"
        :disabled="currentIndex==-1||textarea1==''||isWorking==true?true:false"
        style="color: 6a99d0;"
        > <el-icon :size="20"><Promotion /></el-icon></el-button>
    </div>
  
    <div  
      style="position: absolute; right: 0.5%; width: 14%; top: 7%; padding: 10px;text-align: center;background-color:white ;border-radius: 15px;"
      
      >
       <div  style="padding: 10px; letter-spacing: 2px;font-size: 20px;" class="displayText">对话列表</div>
      <div
      id="chatMenu"
      style=" height: 450px; overflow: auto;"
      >
         
  
          <div id="dialogList">
              
          </div>
          
      </div>
      <div @mouseover="mouseOn" @mouseout="mouseOff" class="dialogItem displayText" @click="addDialog"><el-icon><CirclePlusFilled /></el-icon> 新增对话</div>
  </div>
  
  <div id="topMenu" class="displayText">
      <el-collapse v-model="activeNames" style="border: none;">
  
        <el-collapse-item title="LLM对话配置：" name="1">
   
  
          <div id="model1" class="select" >
              <div class="questionText">请选择LLM模型： </div>
              <el-select
              v-model="value1"
              placeholder="LLM模型"
              size="middle"
              style="width: 160px"
              >
              <el-option
                  v-for="item in options1"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
              </el-select>
          </div>
  
          <div id="model2" class="select">
              <div class="questionText">请选择Prompt模板： </div>
              <el-select
              v-model="value2"
              placeholder="Prompt模板"
              size="middle"
              style="width: 160px"
              >
              <el-option
                  v-for="item in options2"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
              </el-select>
          </div>
  
          <div id="temperature" class="select">
              <span class="demonstration questionText">Temperature:</span>
              <el-slider v-model="floatNum" :format-tooltip="formatTooltip"  id="bar"/>
          </div>
          <div id="counter" class="select">
              <div class="questionText" >历史对话轮数：</div>
              <el-input-number v-model="num" :min="0"  @change="handleChange" 
              style="width: 160px"
              class="inputNumber"
              />
          </div>
          <el-button type="primary" round  
            @click="downloadMD" 
            style="float: right; width: 10%;margin: 30px;"
            color="#515d74"
            dark="true"
            :disabled="isWorking==true||currentIndex==-1?true:false"
        > <el-icon :size="20"><Download /></el-icon>下载对话</el-button>
      </el-collapse-item>
      </el-collapse>
      </div>
  
    <div  id="upLoad" class="displayText">
    <el-upload
      class="upload-demo"
      drag
      multiple
      :before-upload="beforeUpload"
      :disabled="isWorking==true?true:false"
      :auto-upload="true"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽或 <em>点击上传文件</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          单个文件大小限制200MB <el-tooltip
        class="box-item"
        effect="dark"
        placement="bottom-end"
      >
      
      <template #content>
        支持格式：
        <br>
        CSV,TXT,XLSX
       </template>
      <el-icon><InfoFilled /></el-icon>
      </el-tooltip>
        </div>
      </template>
      
    </el-upload>
    
  </div>
  
    <Delete class="del" style="display: none;" size="1"/>
    <EditPen class="edt" style="display: none;" size="1" />
    <el-input style="width: 80%;display:none;" placeholder="请输入对话名" id="setInput"/>
  
    </template>
    
    <script>
    import { onMounted,ref,reactive, } from 'vue'
    import { Download, UploadFilled } from '@element-plus/icons-vue'
    import { ElScrollbar } from 'element-plus'
    import axios from "axios"
    import api from "../api/index"
    import qs from 'querystring'
    import { Readable } from 'stream'
    import { useStore } from 'vuex';
    import TurndownService from 'turndown';
  import { saveAs } from 'file-saver';
  
  import { createApp } from 'vue';
  import VMdEditor from '@kangc/v-md-editor';
  import '@kangc/v-md-editor/lib/style/base-editor.css';
  import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
  import '@kangc/v-md-editor/lib/theme/style/github.css';
  import marked from 'marked';
  import hljs from 'highlight.js';
  import "highlight.js/styles/atom-one-dark.css"; // 引入高亮样式
//   import MathJax from 'mathjax';
  
  
    export default{
      name:"LLM",
      components:{
          
      },
      setup(props,ctx){
          
  
          
          const store = useStore();
          var nullDialog;
          var dialog=[];
          var dialogName=[];
          const decoder = new TextDecoder('utf-8');
          var rendererMD = new marked.Renderer();
          rendererMD.math = function (math) {
            try {
            return MathJax.tex2svg(math).outerHTML;
            } catch {
            return math;
            }
        };
          marked.setOptions({
              renderer: rendererMD,
              highlight: function(code) {
                  return hljs.highlightAuto(code).value;
              },
              pedantic: false,
              gfm: true,
              tables: true,
              breaks: true,
              sanitize: false,
              smartLists: true,
              smartypants: true,
              xhtml: false,
              });
          onMounted(()=>{
              nullDialog=document.getElementById("dialogContainer").cloneNode(true);
              downloadData();
              var option = {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json' // 设置请求头为JSON格式
                  }
              };
              fetch(store.state.baseURL+'/server/configs',option).then(response => response.json())
              .then(data => {
                  var llmModels=data.LLM_MODELS;
                  var llmPrompts=Object.getOwnPropertyNames(data.PROMPT_TEMPLATES.llm_chat)
                  for(var i=0;i<llmModels.length;i++) options1.push({
                      value:llmModels[i],
                      label:llmModels[i]
                  })
                  value1.value=llmModels[0];
                  for(var i=0;i<llmPrompts.length;i++) options2.push({
                      value:llmPrompts[i],
                      label:llmPrompts[i]
                  })
                  value2.value=llmPrompts[0]; 
              }) .catch(error => {
                  ElMessage({
                          message: '网络错误，配置加载失败',
                          type: 'error',
                      })
              });
  
  
          })
         function uploadData(){
              var mod=[];
              var modName=[];
              for(var i=0;i<dialog.length;i++)
              {
                  mod.push(dialog[i].cloneNode(true));
                  modName.push(dialogName[i]);
              }
              var ret={fst:mod,sec:modName};
              store.commit("llmOption",ret);
  
         }
          function downloadData(){
              dialog=[];
              dialogName=[];
              for(var i=0;i<store.state.LLMdialog.length;i++) 
              {
                  var tempDiv = document.createElement('div');
                  tempDiv=store.state.LLMdialog[i].cloneNode(true);
                  dialog.push(tempDiv);
                  dialogName.push(store.state.LLMname[i]);
              }
              for(var i=0;i<dialog.length;i++) addDialog(event,i);
          }
  
          var currentIndex=ref(-1)
          var oAns;
          var streamEnd=ref(true);
          var isWorking=ref(false);
          function addText(opt,addString){
              if(currentIndex.value==-1) return;
              if(streamEnd.value==false&&opt=="A"){
                  var wholeString=oAns.getAttribute("txt")+addString;
                  oAns.setAttribute("txt", wholeString);
                  oAns.innerHTML=marked(wholeString);
                  dialog[currentIndex.value].replaceChild(oAns.cloneNode(true),dialog[currentIndex.value].lastElementChild);
                  return;
              }
   
              const parentDiv = document.getElementById('dialogContainer');
              
              const childDiv = document.createElement('div');
              childDiv.innerHTML=marked(addString);
              childDiv.setAttribute("txt",addString);
                  childDiv.style.maxWidth="70%";
                  childDiv.style.position="relative";
                  childDiv.style.textAlign="left";
                 childDiv.style.fontSize="15px";
                  childDiv.style.marginTop="20px";
                  childDiv.style.marginBottom="20px";
                  childDiv.style.padding="3px 15px 3px 15px";
                  
             
              if(opt=="Q"){
                   childDiv.style.borderRadius="20px 0px 20px 20px";
                  childDiv.style.left="27%";
                 childDiv.style.backgroundColor="#3d3f40";
                 childDiv.style.color="#e5e7e8";
                  childDiv.classList.add("QQ");
              }else{
                   childDiv.style.borderRadius="0px 20px 20px 20px";
                  streamEnd.value=false;
                  oAns=childDiv;
                  
                  childDiv.style.left="1%";
                   childDiv.style.backgroundColor="#d6dbdb";
                   childDiv.classList.add("AA");
              }
              childDiv.classList.add("QA");
  
  
              
  
              parentDiv.appendChild(childDiv);
              dialog[currentIndex.value].appendChild(childDiv.cloneNode(true));
            
              var scrollArea = document.getElementById("chatchat");
               scrollArea.scrollTop=scrollArea.scrollHeight;
      
  
          }
          function handleEnter  (event) {
        if (event.shiftKey&&event.target.id=="spsp") {
          event.preventDefault();
          var str= textarea1.value;
          var l=event.target.selectionStart;
          var r=event.target.selectionEnd;
          str=str.substring(0, l) + '\n' + str.substring(r);
          textarea1.value=str;
          setTimeout(function(){
              event.target.selectionStart=event.target.selectionEnd=l+1;
          },10);
          
        }else{
          
          event.preventDefault();
          addText("Q",textarea1.value);
          const oDiv = document.getElementById('dialogContainer').querySelectorAll(".QA");
          var requestBody={
              "query": textarea1.value,
              "conversation_id": "LLM",
              "history_len": 2,
              "history": [],
              "stream": true,
              "model_name": value1.value,
              "temperature":floatNum.value/100,
              "max_tokens": 0,
              "prompt_name": value2.value
          }
          var hisLen=0;
          for(var i=oDiv.length-num.value-1;i<oDiv.length-1;i++){
              if(i<0) continue;
              hisLen++;
              if(oDiv[i].classList.contains("QQ")){
                     requestBody.history.push({
                      "role":"user",
                      "content":oDiv[i].textContent
                  });
              }
              else{
                  requestBody.history.push({
                      "role":"assistant",
                      "content":oDiv[i].textContent
                  });
              }
              
          }
          requestBody.history_len=hisLen;
  
          const options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json' // 设置请求头为JSON格式
          },
          body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
          };
          isWorking.value=true;
          fetch(store.state.baseURL+'/chat/chat', options)
          .then(response => {
              if(response.ok){
                  const reader = response.body.getReader();
                  return reader.read().then(function process({ done, value }) {
                    
                  if (done) {
                      
                      streamEnd.value=true;
                      isWorking.value=false;
                      uploadData();
                      return;
                  }
                  console.log(decoder.decode(value));
                  try {
                      try {
                          addText("A",JSON.parse(decoder.decode(value)).text); 
                      } catch (error) {
                          const lst=decoder.decode(value).split("}{");
                          
                          for(var i=0;i<lst.length-1;i++){
                              lst[i]=lst[i]+"}";
                              lst[i+1]="{"+lst[i+1];
                          }
                          for(var i=0;i<lst.length;i++) {
                              try{
                                  addText("A",JSON.parse(lst[i]).text);  
                              }catch(error){
                                  lst[i+1]=lst[i]+lst[i+1]; 
                              }
                              
                          }    
                      }
                     
                  } catch (error) {
                      addText("A",decoder.decode(value)); 
                      
                  }
                  
                  var scrollArea = document.getElementById("chatchat");
                  scrollArea.scrollTop=scrollArea.scrollHeight;
                  return reader.read().then(process);
                  });    
              }else{
                  ElMessage({
                      message:response.status+"网络错误，请稍后再试",
                      type: 'error',
                  })
                  isWorking.value=false;
              }
              
          })
          .catch(error => {
              console.error(error);
              ElMessage({
                  message:"网络错误，请稍后再试",
                  type: 'error',
              })
              streamEnd.value=true;
              isWorking.value=false;
    });
  
          textarea1.value="";
        }
      }
          
     
          const textarea1 = ref('')
          function formatTooltip(val) {
              return val / 100
          }
          const num=ref(3)
          const value1 = ref('')
          const options1 = []
  
          const value2 = ref('')
          const options2 = []
          const floatNum=ref(70)
          const item=ref("12345\n1234");
          function mouseOn(event){
              event.target.classList.add("colorOn");
          }
          function mouseOff(event){
              event.target.classList.remove("colorOn");
          }
          const tmpName=ref("");
          function editName(event){
              if(isWorking.value) return;
              
              var lst = document.getElementsByClassName("dialogItem");
              var oItem=event.target.parentNode;
              if(oItem.firstElementChild.id=="setInput"){
                  var tmp=oItem.firstElementChild.value;
                      oItem.firstElementChild.remove(); 
                      if(tmp){
                          oItem.firstElementChild.textContent = tmp;
                          dialogName[currentIndex.value]=tmp;
                      }                     
                      else
                          oItem.firstElementChild.textContent = dialogName[currentIndex.value];
              }else{
                  var oInput=document.getElementById("setInput").cloneNode(true);
                  oInput.style.backgroundColor="#587aab";
                  oInput.style.borderRadius="5px";
                  oInput.style.padding="5px";
                  oInput.style.userSelected
                  oInput.value=oItem.firstElementChild.textContent;
                  oInput.style.display="block";
                  oInput.classList.add("specialColorOn");
                  oItem.firstElementChild.textContent="";
                  oItem.insertBefore(oInput, oItem.firstElementChild);
                  oInput.focus();
                  var editing=true;
                  oInput.addEventListener("keydown", function(event) {
                  if (event.key === "Enter") {
                      if(!editing) return;
                      editing=false;
                      if(!oInput.value)  oInput.value=dialogName[currentIndex.value];
                      var tmp=oInput.value;
                      oInput.value="";
                      try {
                          oInput.remove(); 
                          oItem.firstElementChild.textContent = tmp;
                          dialogName[currentIndex.value]=tmp;
                          uploadData();  
                      } catch (error) {
                          console.log("enter",error)
                      }
                      
                  }
                  });
                  oInput.addEventListener("blur",function(event){
                      if(!editing) return;
                      editing=false;
                      if(!oInput.value) oInput.value=dialogName[currentIndex.value];
                      var tmp=oInput.value;
                      oInput.value="";
                      try {
                          oInput.remove(); 
                          oItem.firstElementChild.textContent = tmp;
                          dialogName[currentIndex.value]=tmp;
                          uploadData(); 
                      } catch (error) {
                          console.log(error)
                      }
                  })
                 
              }
              
          }
         
  
          var bef=null;
          function addDialog(event,idx=-1){//新建对话
              if(isWorking.value) return;
              var lst = document.getElementsByClassName("dialogItem");
              var parentDiv = document.getElementById('dialogList');
              var childDiv = document.createElement('div');
              var oText= document.createElement('div');
              var oDel = document.getElementsByClassName('del')[0].cloneNode(true);
              var oEdt = document.getElementsByClassName('edt')[0].cloneNode(true);
  
              oDel.style.display="block";
              oDel.style.borderRadius="50%";
              oDel.style.padding="10px";
              oDel.style.width="15px";
              oDel.style.height="15px";
              oDel.style.float="left";
  
              oEdt.style.display="block";
              oEdt.style.borderRadius="50%";
              oEdt.style.padding="10px";
              oEdt.style.width="15px";
              oEdt.style.height="15px";
              oEdt.style.float="right";
  
              childDiv.style.textAlign="left";
              if(idx==-1)
                  oText.textContent = "新对话";
              else 
                  oText.textContent = dialogName[idx];
              childDiv.classList.add("dialogItem");
              oText.classList.add("textName")
              childDiv.style.paddingBottom="40px";
              if(bef) bef.classList.remove("selected");
              childDiv.classList.add("selected");
              bef=childDiv;
              childDiv.addEventListener('mouseover', function(event){ //鼠标移入特效
                  if(isWorking.value) return;
                  if(event.target.classList.contains("textName"))
                  {
                      if(lst[currentIndex.value]==childDiv)
                           childDiv.classList.add("specialColorOn");  
                      else
                          childDiv.classList.add("colorOn");  
                  }
                    
                  else {
                      if(lst[currentIndex.value]==childDiv)
                           event.target.classList.add("specialColorOn");  
                      else
                          event.target.classList.add("colorOn");   
                  }
                    
              });
              childDiv.addEventListener('mouseout', function(event){  //鼠标移出特效
                  if(isWorking.value) return;
                  if(event.target.classList.contains("textName")){
                      childDiv.classList.remove("colorOn");  
                      childDiv.classList.remove("specialColorOn");  
                  }
                    
                  else {
                      event.target.classList.remove("colorOn"); 
                      event.target.classList.remove("specialColorOn"); 
                  }
                    
  
              });
              childDiv.addEventListener("click",function(event){  //切换对话
                  if(isWorking.value) return;
                  if(event.target.classList.contains("del")||event.target.id=="setInput"){
                      return;
                  }
                  childDiv.classList.add("selected");
                  if(event.target.classList.contains("edt"))
                  event.target.classList.add("specialColorOn");
              else{
                  setTimeout(() => {
                  var oo=document.getElementById("spsp");
                  oo.focus();
              }, 100);
  
              }
                  currentIndex.value = Array.from(lst).indexOf(childDiv);
                  if(bef&&bef!=childDiv){
                      bef.classList.remove("selected");
                  }
                  bef=childDiv;
                  if(currentIndex.value==-1){
                      const chatchat = document.getElementById("dialogContainer");
                      chatchat.parentNode.replaceChild(nullDialog.cloneNode(true), chatchat);
                  }
                  else {
                      const chatchat = document.getElementById("dialogContainer");
                      chatchat.parentNode.replaceChild(dialog[currentIndex.value].cloneNode(true), chatchat);
                  }
              })
              oDel.addEventListener('click', function(){  //删除对胡
                  if(isWorking.value) return;
                  var delNum=Array.from(lst).indexOf(childDiv);
                  var tmp=lst[currentIndex.value];
                  dialog.splice(delNum,1);
                  dialogName.splice(delNum,1);
                  if(lst[currentIndex.value]==childDiv) 
                  {
                      currentIndex.value = -1;
                      const chatchat = document.getElementById("dialogContainer");
                      chatchat.parentNode.replaceChild(nullDialog.cloneNode(true), chatchat);
                  }
                  childDiv.remove();
                  lst = document.getElementsByClassName("dialogItem");   
                  currentIndex.value = Array.from(lst).indexOf(tmp);
                  uploadData();
              });
              oEdt.addEventListener('click', editName);//编辑对话名称
              childDiv.appendChild(oText);
              childDiv.appendChild(oDel);
              childDiv.appendChild(oEdt);
              parentDiv.appendChild(childDiv);
              if(idx==-1)
              {
                  dialog.push(nullDialog.cloneNode(true));
                  dialogName.push("新对话");
              }
   
              currentIndex.value = Array.from(lst).indexOf(childDiv);
              const chatchat = document.getElementById("dialogContainer");
              chatchat.parentNode.replaceChild(dialog[currentIndex.value].cloneNode(true), chatchat);
              var scrollArea = document.getElementById("chatMenu");
              scrollArea.scrollTop=scrollArea.scrollHeight;
              setTimeout(() => {
                  var oo=document.getElementById("spsp");
                  oo.focus();
              }, 100);
              uploadData();
              
          }

          function downloadMD() {
              for(var pp=0;pp<dialog.length;pp++){
                  const turndownService = new TurndownService();
                  var inf="";
                  for(var i=0;i<dialog[pp].children.length;i++)
                      inf=inf+(dialog[pp].children[i].getAttribute("txt"))+'\n';
                  const blob = new Blob([inf], { type: 'text/json' });
                  const downloadLink = document.createElement('a');
                  downloadLink.href = URL.createObjectURL(blob);
                  downloadLink.download = dialogName[pp]+".md";
                  downloadLink.click();
                  URL.revokeObjectURL(downloadLink.href);
              }
          }
        function  handleBeforeUpload(file) {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
  
              reader.onload = (event) => {
                  const fileContent = event.target.result;
                  try{
                      const jsonData = JSON.parse(fileContent);
                      var l=dialog.length;
                      for(var i=0;i<jsonData.fst.length;i++){
                          var odiv=nullDialog.cloneNode(true);
                          var tmp=document.createElement('div');
                          tmp.innerHTML=jsonData.fst[i];
                          odiv.appendChild(tmp);
                          dialog.push(odiv);
                          dialogName.push(jsonData.sec[i]);
                      }
                      // console.log(dialog)
                      for(var i=l;i<dialog.length;i++) addDialog(event,i);
                  }catch (error) {
                      var odiv=nullDialog.cloneNode(true);
                          dialog.push(odiv);
                          dialogName.push("文件上传错误！");
                          addDialog(event,dialog.length-1);
                  }
                  
              };
  
              reader.onerror = (event) => {
              reject(event.target.error);
              };
  
              reader.readAsText(file); 
          });
      }
      function beforeUpload (file)  {
          const allowedFormats = ['text/csv', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const maxSize = 200 * 1024 * 1024; // 200MB
  
        // 判断文件格式
        if (!allowedFormats.includes(file.type)) {
          ElMessage({
              message: '文件格式不正确，上传失败',
              type: 'error',
          })
          return false;
        }
  
        // 判断文件大小
        if (file.size > maxSize) {
          ElMessage({
              message: '文件过大，上传失败',
              type: 'error',
          })
          return false;
        }
          var formData = new FormData();
          formData.append('files', file)
          fetch(store.state.baseURL+'/uploadfiles/', {
              method: 'POST',
              body:formData,
          }).then(response => response.json())
              .then(data => {
                  ElMessage({
                  message: '文件"'+data.files_uploaded[0]+'"上传成功',
                  type: 'success',
              })           
          }).catch(error => {
              ElMessage({
                  message: '网络错误，上传失败',
                  type: 'error',
              })
  
          })
        return false;
      };
  
     
          return{
              isWorking,
              streamEnd,
              num,
              formatTooltip,
              floatNum,
              options1,
              value1,
              options2,
              value2,
              textarea1,
              handleEnter,
              item,
              currentIndex,
              mouseOn,
              mouseOff,
              addDialog,
              uploadData,
              downloadMD,
              handleBeforeUpload,
              dialog,
              beforeUpload
          }
      }
    }
  
    </script>
    
  
  <style scoped>
  .toCenter{
      position: absolute;
      top: 50%;
      left: 50%;
  }
  
  .displayText {
    user-select: none;
  }
  #upLoad{
      position: absolute;
      right: 0.5%;
      top: 70%;
      width: 14%;
      background-color: white;
      padding: 10px;
      border-radius: 15px;
      height: 20%; /* 设置元素的固定高度 */
      overflow: auto;
  }
  
  ::v-deep .el-upload .el-upload-dragger {
      width: 100%;
      height: 120px;
  }
  #chatchat{
      height: 83%; /* 设置元素的固定高度 */
      overflow: auto;
      background-color: white;
      border-radius: 20px;
  }
  ::v-deep .dialogItem{
     width: 90%;
     padding: 6px;
     border-radius: 10px 0px 10px 10px;
     background-color: #e5e7e8;
     color: #1f2224;
     margin-top: 10px;
     margin-bottom: 10px;
     text-align: center;
  }
  ::v-deep .colorOn{
      background-color: #d6dbdb;
      color: black;
  }
  ::v-deep .specialColorOn{
      background-color: #587aab;
      color: white;
  }
  ::v-deep .selected{
      background-color: #6a99d0;
      color: white;
  }
  ::v-deep .el-scrollbar__view {
  
      background-color: white;
      padding: 10px;
      border-radius: 10px;
  }
  ::v-deep .el-scrollbar__wrap {
      height: 60%;
  }
  ::v-deep .el-textarea__inner {
      resize: none;
      /* background-color: #0c0e0f; */
       border-radius: 10px; /* 圆角半径 */
       padding: 10px; 
  }
  #btn{
      /* position: relative;
      right: 5%; */
      height: 45px;
      width: 45px;
      text-align: center;
  }
  #inputBox{
      background-color: #e5e7e8;
      padding: 10px;
      border-top: 20px #0c0e0f;
      position: absolute;
      bottom: 2%;
      right: 15%;
      width: 70%;
      text-align: center;
  }
    ::v-deep .el-upload-dragger {
    
    background: transparent;
    width: 200px;
    height: 70px;
  }
  .el-icon--upload{
      position: absolute;
      transform: translate(-50%, 0%);
      left: 50%;
      top: 0px;
      margin-top: 10px;
      width: 50px;
      height: 50px;
      text-align: center;
     
  }
  ::v-deep .el-collapse-item__header{
      color: white;
      padding: 10px;
      font-size: large;
      background-color: #657590 ;
      border: none;
      height: 50px;
      /* box-sizing: border-box; */
  }
  ::v-deep .el-collapse-item__wrap{
      padding: 10px;
       color: white;
      background-color: #657590 ;
      border: none;
      border-radius: 0px 0px 20px 20px;
      /* box-sizing: border-box; */
     
  }
  .el-upload__text{
      position: absolute;
      transform: translate(-50%, 0%);
      left: 50%;
      top: 50px;
      margin-top: 10px;
      text-align: center;
      /* color: white; */
  }
    ::v-deep .el-select__wrapper {
    border: none;
    background-color: #4e5d76;
    color: white;
  }
  ::v-deep .el-input__wrapper {
    background-color: #4e5d76;
    
  }
  ::v-deep .el-input-number__decrease {
      background-color: #4e5d76;
      color: white;
   
  }
  ::v-deep .el-input-number__increase {
      background-color: #4e5d76;
      color: white;
   
  }
  ::v-deep .el-select__selected-item > span {
      color: white;
  }
  ::v-deep .el-input__inner{
      color: white;
  }
  ::v-deep .el-select__selected-item::v-deep span  {
      color: white;
  }
  ::v-deep .el-slider__button{
      width: 10px;
      height: 10px;
      border: #0c0e0f;
  }
  ::v-deep .el-slider__bar{
      background-color: #6a99d0;
  }
  ::v-deep .el-slider__runway{
      background-color: #4e5d76;
  }
    .select{
      float: left;
      position: relative;
      text-align: left;
      margin-left: 10px;
      margin-right: 10px;
      margin-top: 5px;
      margin-bottom: 20px;
      text-align: left;
    }
    .questionText{
      color: white;
      margin-bottom: 7px;
    }
    #topMenu{
      
      position: absolute;
      right: 0%;
      top: 0%;
      width: 87.5%;
      height: 6%;
      /* background-color: #1e2224; */
    }
      #model1{
          /* transform: translate(-50%, -50%); */
          /* position: absolute; */
          top: 0%;
          text-align: left;
  
      } 
      #model2{
          /* transform: translate(-50%, -50%); */
          /* position: absolute; */
          /* width: 10%; */
          top: 0%;
          text-align: left;
  
      }
      #temperature{
          /* transform: translate(-50%, -50%); */
          /* position: absolute; */
          /* width: 10%; */
          top: 0%;
          text-align: left;
  
      }
      #counter{
          /* transform: translate(-50%, -50%); */
          /* position: absolute; */
          /* width: 10%; */
          top: 0%;
          text-align: left;
      }
      .slider-demo-block {
          max-width: 600px;
          display: flex;
          align-items: center;
      }
      .slider-demo-block .el-slider {
          margin-top: 0;
          margin-left: 12px;
      }
      .slider-demo-block .demonstration {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          line-height: 44px;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 0;
      }
      .slider-demo-block .demonstration + .el-slider {
          flex: 0 0 70%;
      }
     ::v-deep pre {
      overflow: auto;
      background-color: #292c33;
      color: #acb2be;
      border: none;
      padding: 15px;
  }
  
  /* 滚动条的轨道 */
  ::v-deep ::-webkit-scrollbar {
    width: 5px; /* 滚动条宽度 */
    height: 5px;
  }
  
  /* 滚动条的滑块 */
  ::v-deep ::-webkit-scrollbar-thumb {
    background-color: #888; /* 滑块颜色 */
    border-radius: 6px; /* 滑块圆角 */
  }
  
  /* 滚动条的轨道背景 */
  ::v-deep ::-webkit-scrollbar-track {
    background-color: transparent; /* 轨道背景色 */
  }
    </style>
  
  