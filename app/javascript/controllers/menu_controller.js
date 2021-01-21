// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="menu">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    const { trigger, menu } = this.element.dataset;

    this.menuTrigger = document.querySelector(trigger);
    this.targetMenu = document.querySelector(menu);
    this.isOpen = false;
    this.closeTrigger = this.element.querySelector("#close-menu");

    this.menuTrigger.addEventListener("click", e => this.toggle(e));
    this.closeTrigger.addEventListener("click", e => this.toggle(e));
  }

  toggle(e) {
    e.preventDefault();

    this.isOpen = !this.isOpen;
    this.element.classList.toggle("hidden");
    this.targetMenu.classList.toggle("hidden");
  }
}
