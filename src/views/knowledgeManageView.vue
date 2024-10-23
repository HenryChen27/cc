<template>
  <div height="780px" id="chatchat"
  ref="scrollDiv"
    style="position: absolute; left: 15%; width: 67%; top: 5%; padding: 8px;"
    >
    
    <div 
    v-show="currentIndex==-1&&loading==false"
    style="position: absolute; left: 50%;top: 50%; font-size: 30px; color: #a3a5a6;transform: translate(-50%,-50%);"
    class="displayText"
    > 请新建或选择一个知识库</div>
        <el-skeleton
            style="width: 100%"
            :loading="loading"
            animated
            :rows="50"
        >
        </el-skeleton>
    <div  id="dialogContainer" v-show="loading==false&&currentIndex!=-1">
       <h2 class="tipText" style="margin: 20px 0px 0px 0px;">知识库简介</h2>
       <el-input v-model="intro" style="width:75%" placeholder="请输入知识库简介"  type="textarea" @change="updateInf"/>

       <h2 class="tipText">文件处理配置</h2>

        <div class="settings">
        <div style="height: 40px;margin: 10px;display: inline-block;width: 30%;">
            <div class="tipText" style="display: inline-block;">单段文本最大长度：</div>
            <br>
            <el-input-number v-model="num1" :min="1" :max="2500" @change="handleChange"/>
        </div>
        <div style="height: 40px;margin: 10px;display: inline-block;width: 30%;">
            <div class="tipText" style="display: inline-block;">相邻文本重合长度：</div>
            <br>
            <el-input-number v-model="num2" :min="1" :max="500" @change="handleChange" />
        </div>
        <div style="height: 40px;margin: 10px;display: inline-block;">
            <div style="display: inline-block;" class="tipText">{{titleFlg?"开启中文标题加强":"关闭中文标题加强"}}</div>
            <el-switch
                v-model="titleFlg"
                class="ml-2"
                style="--el-switch-on-color: #6a99d0; float: left;"
            />
        </div>
        </div>

        <h2 class="tipText" >
            <div style="display: inline-block;">上传知识文件</div>
            <el-tooltip
            class="box-item"
                effect="dark"
                placement="right-start"
                style="float: right;"
            >
            <template #content>
                支持格式：
                <br>
                HTML, MD, JSON, JSONL, CSV, PDF, 
                <br>
                PNG, JPG,JPEG, BMP, EML, MSG,
                <br>
                EPUB, XLSX, XLSD, IPYNB, ODT, PY, 
                <br>
                RST, RTF, SRT, TOML, TSV, DOCX, 
                <br>
                DOC, XML, PPT, PPTX, TXT, HTM
            </template>
            <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
        </h2>    
        <div class="displayText"
            style="background-color:  #e5e7e8;
            border-radius: 5px;
            width: 75%;
            transform: translate(-50%,0%);
            left: 50%;
            position: relative;">
            <el-upload
                class="upload-demo"
                drag
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                multiple
                :before-upload="beforeUpload"
            >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text" style="width: 90%;">
                    单个文件大小限制200MB
                    <br>
                    <em>点击或拖拽上传</em>
                </div>
            
            </el-upload>
        </div>


        <h2 class="tipText">
            <div style="display: inline-block;">知识库文件</div>
            <el-tooltip
                class="box-item"
                effect="dark"
                content="知识库中包含源文件与向量库，点击下表中文件选择后操作"
                placement="right-start"
                style="float: right;"
            >
            <el-icon><InfoFilled /></el-icon>
            </el-tooltip></h2>
        
        <div style="
            width: 75%;
            transform: translate(-50%,0%);
            left: 50%;
            position: relative;
            ">
        <el-table :data="tableData" height="260"
            style="background-color:  #e5e7e8;
            width: 100%;
            transform: translate(-50%,0%);
            left: 50%;
            position: relative;
            border-radius: 10px;"
            @row-click="handleObjectClick"
            @click="handleRowClick"
            :header-cell-style="tableHeaderColor"
            >
            <el-table-column prop="index" label="序号" width="80" />
            <el-table-column prop="name" label="文档名称" width="280" />
            <el-table-column prop="loader" label="文档加载器"  width="280"  />
            <el-table-column prop="divider" label="分词器"  width="280"  />
            <el-table-column prop="number" label="文档数量"  width="80"  />
            <el-table-column prop="isFile" label="源文件"  width="80"  />
            <el-table-column prop="isVictor" label="向量库"  width="80"  />
        </el-table>
        <div style=" transform: translate(-50%,0%);
            left: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            ">
            <el-pagination  layout="prev, pager, next" 
                :pager-count="6"
                :total="filesNum" 
                v-model:current-page="currentPage"
                @current-change="handleCurrentChange"/>
        </div>
        
    </div >
    <el-button-group class="ml-4" style="width: 75%;margin: 0 0 200px 0;">
        <el-button plain type="primary" color="#6a99d0" style="width: 25%;" :disabled="!chosen" @click="f1">下载选中文档</el-button>
        <el-button plain type="primary" color="#6a99d0" style="width: 25%;" :disabled="!chosen" @click="f2">添加至向量库</el-button>
        <el-button plain type="primary" color="#6a99d0" style="width: 25%;" :disabled="!chosen" @click="f3">{{origin?"从知识库中删除":"从向量库中删除"}}</el-button>
         <el-button color="#6a99d0" :dark="isDark" style="color: white;width: 25%" @click="f5">依据源文件重建向量库</el-button>
     </el-button-group>
    

    </div>
</div>




<el-dialog
    v-model="windowVisible"
    title="新建知识库"
    width="1000"
    :before-close="handleClose"
  
  >
    <div  v-loading="creating"
    element-loading-text="新建知识库中请稍后..."
    >
    <div style="text-align: left;height: 115px; margin-left: 10%; margin-right: 10%;margin-top: 2%;" class="inner">
    <div class="tipText">新建知识库名称</div>
    <el-input v-model="input1" style="" placeholder="新建知识库名称，不支持中文命名" @change="onChangeChar"/>
    <el-alert :title="isNull==true?'知识库名称不能为空':'知识库名称不支持中文命名'" type="error" show-icon :closable="false" v-show="errorVisible||isNull"/>
    </div>
    
    <div style="text-align: left;height: 115px;margin-left: 10%; margin-right: 10%;"class="inner">
    <div  class="tipText">知识库简介</div>
    <el-input v-model="input2" style="" placeholder="知识库简介，方便Agent查找" />
    </div>
    <div style="width: 80%;height: 115px;margin-left: 10%; margin-right: 10%;">
    <div style="float: left;width: 45%;">
        <div class="tipText">向量库类型</div>
        <el-select
        v-model="value1"
        placeholder="Select"
        size="large"
        style="width: 100%"
        >
        <el-option
            v-for="item in options1"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
        </el-select>
    </div>

    <div style="float: right;width: 45%;">
        <div class="tipText">Embedding模型</div>
        <el-select
        v-model="value2"
        placeholder="Select"
        size="large"
        style="width: 100%"
        >
        <el-option
            v-for="item in options2"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
        </el-select>
    </div>
    </div>
</div>
    <template #footer>
      <div class="dialog-footer" style="padding: 20px;margin-left: 10%; margin-right: 10%;">
        <el-button @click="windowVisible = false" style="width: 10%;margin: 1%;" :disabled="creating">
            取消
        </el-button>
        <el-button type="primary" @click="confirmNewBase" style="width: 10%;margin: 1%;" :loading="creating"> 
          新建
        </el-button>
      </div>
    </template>
  </el-dialog>
<div  
    style="position: absolute; right: 0.5%; width: 14%; top: 7%; padding: 10px;text-align: center;background-color:white ;border-radius: 15px;"
    
    >
     <div  style="padding: 15px; letter-spacing: 2px;font-size: 20px;" class="displayText">知识库列表</div>
    <div
    id="chatMenu"
    style=" height: 600px; overflow: auto;"
    >
       

        <div id="dialogList">
            
        </div>
        
    </div>
    <div @mouseover="mouseOn" @mouseout="mouseOff" class="dialogItem displayText" @click="newBase"><el-icon><CirclePlusFilled /></el-icon> 新增知识库</div>
</div>


  
  <Delete class="del" style="display: none;" size="1"/>

  <el-input style="width: 80%;display:none;" placeholder="请输入知识库名称" id="setInput"/>


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
  export default{
    name:"LLM",
    setup(props,ctx){
        


        const store = useStore();
        var dialogName=[];
        var dialog=[];
        const decoder = new TextDecoder('utf-8');
        onMounted(()=>{
           
            downloadData();
    
        })
        function newBase(){
            if(loading.value) return;
            isNull.value=false;
            input1.value="";
            input2.value="";
            windowVisible.value=true;
        }
        function confirmNewBase(){
            isNull.value=input1.value==""?true:false;
            if(isNull.value) return;
            var requestBody={
                "knowledge_base_name": input1.value,
                "vector_store_type": value1.value,
                "embed_model": value2.value
            };
            var option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
            };
            creating.value=true;
            fetch(store.state.baseURL+'/knowledge_base/create_knowledge_base', option).then(response => response.json())
            .then(data => {
                if(data.code==404){
                    creating.value=false;
                    ElMessage({
                        message: '已存在同名知识库',
                        type: 'error',
                    })
                }else{
                    ElMessage({
                        message: '成功新建知识库',
                        type: 'success',
                    })
                    requestBody={
                        "knowledge_base_name": input1.value,
                        "kb_info": input2.value
                };
                    var option = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json' // 设置请求头为JSON格式
                        },
                        body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
                    };
                    fetch(store.state.baseURL+'/knowledge_base/update_info', option).then(response => response.json())
                    .then(data => {
                        creating.value=false;
                        if(data.code!=200){
                            ElMessage({
                                message: '知识库简介更新失败',
                                type: 'error',
                            })
                        }else{
                            dialogName.push(input1.value);
                            dialog.push(input2.value)
                            addDialog(event,dialogName.length-1)
                            windowVisible.value=false;
                            baseInf.push([]);
                            loadFiles(dialogName.length-1)
                        }
                        
                    }) .catch(error => {
                        console.log(error);
                        creating.value=false;
                        ElMessage({
                                message: '知识库简介更新失败',
                                type: 'error',
                            })
                    });
                }
                
                
            }) .catch(error => {
                console.log(error);
                creating.value=false;
                ElMessage({
                        message: '网络错误创建失败',
                        type: 'error',
                    })
            });

            
            
        }
        function updateInf(){
            var requestBody={
                    "knowledge_base_name": dialogName[currentIndex.value],
                    "kb_info":intro.value
                };
            var option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
            };
            fetch(store.state.baseURL+'/knowledge_base/update_info', option).then(response => response.json())
                    .then(data => {
                        creating.value=false;
                        if(data.code!=200){
                            ElMessage({
                                message: '知识库简介更新失败',
                                type: 'error',
                            })
                        }else{
                            ElMessage({
                                message: data.msg,
                                type: 'success',
                            })
                        }
                        
                    }) .catch(error => {
                        console.log(error);
                        creating.value=false;
                        ElMessage({
                                message: '知识库简介更新失败',
                                type: 'error',
                            })
                    });
        }
       var targetObject={};
       const chosen=ref(false);
       const origin=ref(false);
       function handleObjectClick(event){
            if(targetObject==event)
            {
                targetObject={};
                chosen.value=false;
                
            }
            else 
            {
                targetObject=event;
                chosen.value=true;
                origin.value=event.isFile=="是";
            }
           
       }
       var befDiv;
       function handleRowClick(event){
            var odiv= event.target;
            for(var i=0;i<2;i++) {
                if(odiv.classList.contains("el-table__row")) break;
                odiv=odiv.parentNode;
            }
            if(!odiv.classList.contains("el-table__row")) return;
            odiv.classList.add("selected")
            if(befDiv) befDiv.classList.remove("selected")
            if(befDiv==odiv) befDiv=null;
            else befDiv=odiv;
       }
       const filesNum=ref(100);
       const currentPage=ref(1);
       function loadSettings(){
        if(currentIndex.value==-1) return;
            intro.value=dialog[currentIndex.value];
            num1.value=250;
            num2.value=50;
            titleFlg.value=true;
            filesNum.value= Math.floor((baseInf[currentIndex.value].length+4)/5)*10;//每页五个
            currentPage.value=1;
            handleCurrentChange();
            
       }
       function  handleCurrentChange(){
            tableData.value=[];
            filesNum.value= Math.floor((baseInf[currentIndex.value].length+4)/5)*10;
            for(var i=(currentPage.value-1)*5;i<(currentPage.value-1)*5+5&&i<baseInf[currentIndex.value].length;i++){
                let otmp=baseInf[currentIndex.value][i];
                otmp.index=i+1;
                tableData.value.push(otmp);
            }
            
       }
       
       
       function loadFiles(idx){
        fetch(store.state.baseURL+'/knowledge_base/list_files/all?knowledge_base_name='+dialogName[idx], {
            method: 'GET',
        }).then(response => response.json())
            .then(data => {
                if(data.code==200){
                    baseInf[idx]=[];
                    for(var i=0;i<data.data.length;i++){
                        console.log(data.data[i]);
                        var tmp={
                            name:data.data[i].file_name,
                            loader:data.data[i].document_loader,
                            divider:data.data[i].text_splitter,
                            number:data.data[i].docs_count,
                            isFile:data.data[i].in_folder?"是":"否",
                            isVictor:data.data[i].in_db?"是":"否",
                        };
                        baseInf[idx].push(tmp);
                    }
                    loadSettings();

                }     
            })
       }
       function beforeUpload (file)  {
        const allowedFormats =  ["text/html", "text/markdown", "application/json", "application/x-jsonlines", "text/csv", "application/pdf", "image/png", "image/jpeg", "image/bmp", "message/rfc822", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/epub+zip", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/rtf", "application/x-subrip", "application/toml", "text/tab-separated-values", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.openxmlformats-officedocument.wordprocessingml.template", "text/plain", "text/html"];
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
        formData.append('knowledge_base_name', dialogName[currentIndex.value])
        formData.append('chunk_size', num1.value)
        formData.append('chunk_overlap', num2.value)
        formData.append('zh_title_enhance', titleFlg.value)
        loading.value=true;
        fetch(store.state.baseURL+'/knowledge_base/upload_docs', {
            method: 'POST',
            body:formData,
        }).then(response => response.json())
            .then(data => {
                if(data.code==200){
                    ElMessage({
                        message: data.msg,
                        type: 'success',
                    })
                    loadFiles(currentIndex.value)
                    handleCurrentChange();
                    loading.value=false;
                    loadFiles(currentIndex.value)
                }else{
                    ElMessage({
                        message: '上传失败',
                        type: 'error',
                    })
                    loading.value=false;
                }
                     
        }).catch(error => {
            console.log(error);
            ElMessage({
                message: '网络错误，上传失败',
                type: 'error',
            })
            loading.value=false;

        })
      return false;
    };
        var baseInf=[];
        function downloadData(){
            const option = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
            };
            loading.value=true;
            fetch(store.state.baseURL+'/knowledge_base/list_knowledge_bases/all').then(response => response.json())
            .then(data => {
                if(data.code==200){
                    for(var i=0;i<data.data[0].length;i++) 
                    {
                        dialogName.push(data.data[0][i]);
                        dialog.push(data.data[1][i]);
                        addDialog(event,i); 
                        baseInf.push([]);
                    }
                    loadFiles(currentIndex.value);
                    loadSettings();
                    loading.value=false;
                    
                }else{
                    loading.value=false;
                    ElMessage({
                        message: '知识库加载失败',
                        type: 'warning',
                    })
                }
                
            }) .catch(error => {
                console.log(error);
                loading.value=false;
                ElMessage({
                        message: '知识库加载失败',
                        type: 'warning',
                    })
            });
        }

        var currentIndex=ref(-1)

        const errorVisible=ref(false);
        const isNull=ref(true);
       function onChangeChar(){
            var pattern = /[\u4e00-\u9fa5]/;
            if(input1.value=="") isNull.value=true;
            else isNull.value=false;
            errorVisible.value=pattern.test(input1.value);
       }
        function mouseOn(event){
            event.target.classList.add("colorOn");
        }
        function mouseOff(event){
            event.target.classList.remove("colorOn");
        }
        const tmpName=ref("");
        
        var bef=null;
        function addDialog(event,idx=-1){//新建对话
            // if(isWorking.value) return;

            var lst = document.getElementsByClassName("dialogItem");
            var parentDiv = document.getElementById('dialogList');
            var childDiv = document.createElement('div');
            var oText= document.createElement('div');
            var oDel = document.getElementsByClassName('del')[0].cloneNode(true);

            oDel.style.display="block";
            oDel.style.borderRadius="50%";
            oDel.style.padding="10px";
            oDel.style.width="15px";
            oDel.style.height="15px";
            oDel.style.float="left";

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
            intro.value=dialog[currentIndex.value];
            childDiv.addEventListener('mouseover', function(event){ //鼠标移入特效
                if(loading.value) return;
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
                if(loading.value) return;
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
                if(loading.value) return;
                targetObject={};
                chosen.value=false;
                if(befDiv) befDiv.classList.remove("selected");
                befDiv=null;
                if(event.target.classList.contains("del")||event.target.id=="setInput"){
                    return;
                }
                childDiv.classList.add("selected");
                if(event.target.classList.contains("edt"))
                event.target.classList.add("specialColorOn");
                currentIndex.value = Array.from(lst).indexOf(childDiv);
                if(bef&&bef!=childDiv){
                    bef.classList.remove("selected");
                }
                bef=childDiv;
               loadFiles(currentIndex.value);
            //    loadSettings();
            })
            oDel.addEventListener('click', function(){  //删除对话
                if(loading.value) return;
                var delNum=Array.from(lst).indexOf(childDiv);
                const option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(dialogName[delNum])
            };
            loading.value=true;
            fetch(store.state.baseURL+'/knowledge_base/delete_knowledge_base', option).then(response => response.json())
            .then(data => {
                if(data.code==200){
                    var tmp=lst[currentIndex.value];
          
                    dialogName.splice(delNum,1);
                    dialog.splice(delNum,1);
                    baseInf.splice(delNum,1);
                    if(lst[currentIndex.value]==childDiv) 
                    {
                        currentIndex.value = -1;
                        const chatchat = document.getElementById("dialogContainer");
                    }
                    childDiv.remove();
                    lst = document.getElementsByClassName("dialogItem");   
                    currentIndex.value = Array.from(lst).indexOf(tmp);

                    loading.value=false;
                    ElMessage({
                        message: '删除成功',
                        type: 'success',
                    })
                   
                }else{
                    loading.value=false;
                    ElMessage({
                        message: '删除失败',
                        type: 'error',
                    })
                     

                }
                
                
            }) .catch(error => {
                console.log(error);
                loading.value=false;
                ElMessage({
                        message: '网络错误，删除失败',
                        type: 'error',
                    })
            });


                
            });
    
            childDiv.appendChild(oText);
            childDiv.appendChild(oDel);
            parentDiv.appendChild(childDiv);
            currentIndex.value = Array.from(lst).indexOf(childDiv);
            childDiv.click();
            
        }

        
       function f1(){
        fetch(store.state.baseURL+"/knowledge_base/download_doc?knowledge_base_name="+encodeURIComponent(dialogName[currentIndex.value])+"&file_name="+encodeURIComponent(targetObject.name)+"&preview=false", {
        "method": "GET",
        }).then(response => response.text())
        .then(data => {
            const turndownService = new TurndownService();
            var inf=data;
            const blob = new Blob([inf], { type: 'text/json' });
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = targetObject.name;
            downloadLink.click();
            URL.revokeObjectURL(downloadLink.href);
        })
        .catch(error => {
            console.error(error);
            ElMessage({
                message: '下载失败',
                type: 'error',
            })
        });
       }
       function f2(){
            var requestBody={
                "knowledge_base_name":dialogName[currentIndex.value],
                "file_names": [targetObject.name],
            }
            var option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
            };    
            loading.value=true;
            fetch(store.state.baseURL+'/knowledge_base/update_docs', option).then(response => response.json())
            .then(data => {
                loading.value=false;
                // console.log(data);
                if(data.code==200){
                    ElMessage({
                        message: "成功添加至向量库",
                        type: 'success',
                    })
                }else{
                    ElMessage({
                        message: data.msg,
                        type: 'error',
                    })
                }
            })
            
        }
        function f3(){
            f4();
        }
        function f4(){
            var requestBody={
                "knowledge_base_name":dialogName[currentIndex.value],
                "file_names": [targetObject.name],
                "delete_content": false,
                "not_refresh_vs_cache": false
            }
            var option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
            };
            loading.value=true;
            fetch(store.state.baseURL+'/knowledge_base/delete_docs', option).then(response => response.json())
            .then(data => {
                 loading.value=false;
                if(data.code==200){
                    loadFiles(currentIndex.value);
                }
               
            })
        }
        function f5(){
            var requestBody={
                "knowledge_base_name":dialogName[currentIndex.value],
                "allow_empty_kb": true,
                "vs_type": "faiss",
                "embed_model": "bge-large-zh",
                "chunk_size": 250,
                "chunk_overlap": 50,
                "zh_title_enhance": false,
                "not_refresh_vs_cache": false
            }
            var option = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为JSON格式
                },
                body: JSON.stringify(requestBody) // 将数据转换为JSON字符串并设置为请求体
            };
            loading.value=true;
            fetch(store.state.baseURL+'/knowledge_base/recreate_vector_store', option)
            .then(response => {
              if(response.ok){
                  const reader = response.body.getReader();
                  return reader.read().then(function process({ done, value }) {
                  if (done) {
                        loading.value=false;
                      return;
                  }
                  var data=JSON.parse(decoder.decode(value))

                  if(data.code==200)
                        ElNotification({
                            title: '文件添加成功'+"("+data.finished+"/"+data.total+")",
                            message: data.msg,
                            type: 'success',
                            position: 'top-left',
                        })
                    else
                        ElNotification({
                            title: '文件添加失败!',
                            message: data.msg,
                            type: 'error',
                            position: 'top-left',
                        })
                  return reader.read().then(process);
                  });    
              }else{
                  ElMessage({
                      message:response.status+"网络错误，请稍后再试",
                      type: 'error',
                  })
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
        }
        const loading=ref(false);
        const creating=ref(false);
        const windowVisible=ref(false);
        const input1=ref("");
        const input2=ref("");   

        const value1=ref("faiss");
        const value2=ref("bge-large-zh");
        const options1=[
            {
            value: 'faiss',
            label: 'faiss',
            },
            {
            value: 'milvus',
            label: 'milvus',
            },
            {
            value: 'zilliz',
            label: 'zilliz',
            },
            {
            value: 'pg',
            label: 'pg',
            },
            {
            value: 'es',
            label: 'es',
            },
            {
            value: 'milvus_kwargs',
            label: 'milvus_kwargs',
            },
             {
            value: 'chromadb',
            label: 'chromadb',
            },
            

        ]
        var opt=["ernie-tiny","ernie-base","text2vec-base","text2vec","text2vec-paraphrase","text2vec-sentence","text2vec-multilingual","text2vec-bge-large-chinese","m3e-small","m3e-base","m3e-large","bge-small-zh","bge-base-zh","bge-large-zh","bge-large-zh-noinstruct","bge-base-zh-v1.5","bge-large-zh-v1.5","piccolo-base-zh","piccolo-large-zh","nlp_gte_sentence-embedding_chinese-large"  ,"text-embedding-ada-002" ,];
        var options2=[];
        for(var i=0;i<opt.length;i++) 
            options2.push({
                value:opt[i],
                label:opt[i]
            });
        function  handleClose(){
           
            windowVisible.value=false
        }
        const intro=ref("");
        const num1=ref(250);
        const num2=ref(50);
        const titleFlg=ref(true);
        const tableData=ref([ {
            index:"1",
            name:"sample.txt",
            loader:"sample",
            divider:"sample",
            number:"0",
            isFile:"是",
            isVictor:"否" 
        },
        {
            index:"1",
            name:"sample.txt",
            loader:"sample",
            divider:"sample",
            number:"0",
            isFile:"否",
            isVictor:"是" 
        },
        {
            index:"1",
            name:"sample.txt",
            loader:"sample",
            divider:"sample",
            number:"0",
            isFile:"是",
            isVictor:"否" 
        },
        ]);
       
        
        
        const tableHeaderColor = {
            background: '#e5e7e8 !important',
            color: '#333333',
            fontSize: '14px',
            textAlign: 'center',
        }
        return{
            tableHeaderColor,
            chosen,
            origin,
            handleObjectClick,
            handleRowClick,
            beforeUpload,
            tableData,
            intro,
            titleFlg,
            num1,
            num2,
            confirmNewBase,
            newBase,
            windowVisible,
            loading,
            creating,

            currentIndex,
            mouseOn,
            mouseOff,
            addDialog,
            input1,
            input2,
            value1,
            value2,
            options1,
            options2,
            onChangeChar,
            errorVisible,
            isNull,
            handleClose,
            filesNum,
            currentPage,
            handleCurrentChange,
            loadSettings,
            updateInf,
            f1,
            f2,
            f3,
            f4,
            f5
        }
    }
  }

  </script>
  

<style scoped>
  ::v-deep .el-table__empty-block{
    background-color: #ebeced;
  }
::v-deep.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #d6dbdb;
  color: black; 
}
.settings{
    background-color:  #e5e7e8;
    padding: 5px;
    border-radius: 10px;
    width: 75%;
    transform: translate(-50%,0%);
    left: 50%;
    position: relative;
    margin:10px;
    user-select: none;
}

.displayText {
  user-select: none;
}
.tipText{
    font-size: 15px;
    padding: 5px;
    text-align: center;
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
    height: 21.5%; /* 设置元素的固定高度 */
    overflow: auto;
}

::v-deep .el-upload .el-upload-dragger {
    width: 100%;
    height: 120px;
}
#chatchat{
   height: 100%;
    background-color: white;
    border-radius: 20px;

}
::v-deep .dialogItem{
   width: 90%;
   padding: 6px;
   border-radius: 5px;
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
    background-color: #6a99d0 !important;
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
    background-color: #e5e7e8;
    font-size: 15px;
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
    color: #778890;
    font-size: large;
    background-color: #1f2224 ;
    border: none;
}
::v-deep .el-collapse-item__wrap{
    background-color: #1f2224 ;
    border: none;
}
.el-upload__text{
    position: absolute;
    transform: translate(-50%, 0%);
    left: 50%;
    top: 50px;
    margin-top: 10px;
    text-align: center;
}
  ::v-deep .el-select__wrapper {
  border: none;
  font-size: 15px;
  background-color: #e5e7e8;
}
::v-deep.el-input-number >  .el-input > .el-input__wrapper {
    font-size: 15px;
    height: 30px;
    background-color: #d7dbdb;
    border: none;
}
.inner > ::v-deep .el-input > .el-input__wrapper {
    font-size: 15px;
    height: 40px;
    background-color: #e5e7e8;
    border: none;
}

::v-deep .el-input-number__decrease {
 background-color: #d7dbdb;
 
}
::v-deep .el-input-number__increase {
    background-color: #d7dbdb;
 
}
::v-deep .el-slider__button{
    width: 12px;
    height: 12px;
    border: #0c0e0f;
}
::v-deep .el-slider__bar{
    background-color: #0c0e0f;
}
::v-deep .el-slider__runway{
    background-color: #2c3032;
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
    color: #778890;
    margin-bottom: 7px;
  }
  #topMenu{
    position: absolute;
    right: 0%;
    top: 0%;
    width: 86.4%;
    height: 6%;
    /* background-color: #1e2224; */
  }
    #model1{
        /* transform: translate(-50%, -50%); */
        /* position: absolute; */
        /* width: 10%; */
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
  </style>