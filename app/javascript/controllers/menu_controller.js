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
    
    this.menuWraper = document.querySelector(".menus");
    this.menuTrigger = document.querySelector(trigger);
    this.targetMenu = document.querySelector(menu);
    this.isOpen = false;
    
    this.menuTrigger.addEventListener("click", e => this.toggle(e));
    if(menu == ".site-menu")
      this.element.querySelector("#close-menu").addEventListener("click", e => this.toggle(e));
  }

  toggle(e) {
    e.preventDefault();
  
    this.isOpen = !this.isOpen;
    this.menuWraper.classList.toggle("hidden");
    this.element.classList.toggle("hidden");
  }
}
