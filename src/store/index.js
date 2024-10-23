import { createStore } from 'vuex'

export default createStore({
  state: {
    LLMdialog:[],
    LLMname:[],
    agentdialog:[],
    agentname:[],
    searchdialog:[],
    searchname:[],
    knowdialog:[],
    knowname:[],
    filedialog:[],
    filename:[],
    tst:20,
    baseURL:"http://172.26.94.25:8000",
    fileList:[],
  },
  getters: {
  },
  mutations: {
    llmOption(state,mod){
      state.LLMdialog=mod.fst;
      state.LLMname=mod.sec;
    },
    agentOption(state,mod){
      state.agentdialog=mod.fst;
      state.agentname=mod.sec;
    },
    searchOption(state,mod){
      state.searchdialog=mod.fst;
      state.searchname=mod.sec;
    },
    knowOption(state,mod){
      state.knowdialog=mod.fst;
      state.knowname=mod.sec;
    },
    fileOption(state,mod){
      state.filedialog=mod.fst;
      state.filename=mod.sec;
    }


  },
 
  actions: {
  },
  modules: {
  }
})
