// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="sidebar">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    this.element.addEventListener("click", e => this.toggle(e));
  }

  toggle(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const {target, close, isChild} = this.element.dataset;

    if (isChild == "true") {
      document.getElementById("main-right-sidebar").classList.toggle("d-none");
    }

    const sidebar = document.querySelector(target);

    sidebar.classList.toggle("hidden");
    const opened = sidebar.classList.toggle("open");

    if (opened) {
      document.querySelectorAll(close).forEach(closeTrigger => {
        closeTrigger.addEventListener("click", e => this.toggle(e));
      });
    } else {
      document.querySelectorAll(close).forEach(closeTrigger => {
        closeTrigger.removeEventListener("click", () => {
        });
      });
    }
  }
}
