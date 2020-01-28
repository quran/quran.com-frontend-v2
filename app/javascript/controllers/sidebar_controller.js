// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="sidebar">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  static targets = ["trigger"];

  connect() {
    $(this.triggerTarget).on("click", e => {
      this.toggle(e);
    });
  }

  toggle(event) {
    event.preventDefault();
    $(this.element).toggleClass("open");
    $("body").toggleClass("active");
  }
}
