// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="menu">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import { Controller } from "stimulus";
import isChildOf from "../utility/child-of";

export default class extends Controller {
  connect() {
    const { trigger, menu } = this.element.dataset;

    this.menuWraper = document.querySelector("#menus-wrapper");
    this.menuTrigger = document.querySelector(trigger);
    this.targetMenu = document.querySelector(menu);
    this.isOpen = false;

    this.menuTrigger.addEventListener("click", e => this.toggle(e));

    if (menu == ".site-menu")
      this.element
        .querySelector("#close-menu")
        .addEventListener("click", e => this.close(e));
  }

  toggle(e) {
    e.preventDefault();

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  disconnect() {
    this.menuWraper.removeEventListener("click", this.onClicked, false);
  }

  click(event) {
    const target = event.target;

    if (!isChildOf(this.element, target)) {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.menuWraper.removeEventListener("click", this.onClicked, true);
    this.menuWraper.classList.add("hidden");
    this.element.classList.add("hidden");
  }

  open() {
    this.isOpen = true;
    this.onClicked = this.click.bind(this);

    this.menuWraper.addEventListener("click", this.onClicked, true);
    this.menuWraper.classList.remove("hidden");
    this.element.classList.remove("hidden");
  }
}
