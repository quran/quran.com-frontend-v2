// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="night-mode">
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.active = true;
    $(this.element).on("click", e => this.toggle(e));
  }

  toggle(e) {
    e.preventDefault();
    this.set(!this.active);
  }

  reset() {
    this.set(false);
  }

  set(on) {
    if (on) {
      $("body").addClass("night");
    } else {
      $("body").removeClass("night");
    }
    this.active = on;
    //TODO: persist
  }
}
