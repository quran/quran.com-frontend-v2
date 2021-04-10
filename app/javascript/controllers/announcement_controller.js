// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="announcement" data-alert='alert-uuid'>
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";
import LocalStore from "../utility/local-store";

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.store = new LocalStore();
    let shown = "1" == this.store.get(`ann-${this.el.data("id")}`);

    if (!shown) {
      this.show();
    }
  }

  show() {
    this.el.find(".close").on("click", e => this.onHide(e));
    this.el.removeClass("hidden");
  }

  onHide(e) {
    e.preventDefault();
    this.store.set(`ann-${this.el.data("id")}`, "1");
    this.el.addClass("hidden");
  }
}
