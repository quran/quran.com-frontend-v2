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
  static targets = ["trigger", 'setting', "close", "settingClose"];

  connect() {
    $(this.triggerTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e, '.left-sidebar');
    });

    $(this.settingTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e, '.right-sidebar');
    });

    $(this.closeTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e, ".left-sidebar");
    });

    $(this.settingCloseTarget).on("click", e => {
      e.preventDefault();
      this.toggle(e, '.right-sidebar');
    });

  }

  toggle(e, className) {
    console.log(className)
    $("body").toggleClass("active");
    $(className).toggleClass('open');
  }
}
