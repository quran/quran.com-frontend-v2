import { Controller } from "stimulus";
const LOADER =
  "<div id='loading-spinner' class='spinner p-3 d-none'><i class='spinner--swirl'></i></div>";

export default class extends Controller {
  connect() {
    this.element.loader = this;

    this.el = $(this.element);
    this.el.append(LOADER);
  }

  show() {
    $("#loading-spinner").removeClass("d-none");
  }

  hide() {
    $("#loading-spinner").addClass("d-none");
  }
}
