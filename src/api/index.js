import path from "./path"
import axios from "../utils/request"
export default {
    getChengpin(){
        return axios.get(path.baseUrl +path.chengpin)
   },
   getPost(inf){
    return axios.post(path.baseUrl+path.testPost,inf)
   }
}
