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
  static targets = ["trigger", "close"];

  connect() {
    $(this.triggerTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e);
    });

    $(this.closeTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e);
    });

  }

  toggle() {
    $("body").toggleClass("active");
    $('.right-sidebar').toggleClass('open');
  }
}
