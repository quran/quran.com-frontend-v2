import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    if(0 == $(".search-result ul li").length){
      $(".suggestions").empty()
    }
  }
}
