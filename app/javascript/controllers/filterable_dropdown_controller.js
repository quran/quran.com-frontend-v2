// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="filterable-dropdown">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import {Controller} from "stimulus";
import isChildOf from "../utility/child-of";

const OPEN_CLASSES = ['label--open', 'label__opened']

export default class extends Controller {
  connect() {
    const {trigger, dropdown} = this.element.dataset;

    this.menuTrigger = document.querySelector(trigger);
    this.dropdownWrapper = document.querySelector(dropdown);
    this.closeTrigger = this.element.querySelector('#close-dropdown')
    this.isOpen = false;
    this.onClicked = this.click.bind(this);
    this.onToggle = this.toggle.bind(this);

    this.menuTrigger.addEventListener("click", this.onToggle);
    this.closeTrigger.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      this.close()
    })
  }

  toggle(event) {
    if (this.isOpen) {
      const target = event.target;
      // Do not close if clicked within the dropdown
      if (!isChildOf(this.dropdownWrapper, target)) {
        this.close();
      }
    } else {
      this.open();
    }
  }

  disconnect() {
  }

  click(event) {
    // clicked anywhere on the page
    const target = event.target;

    if (this.isOpen && !isChildOf(this.dropdownWrapper, target)) {
      this.close();
    }
    return true;
  }

  close() {
    document.removeEventListener('click', this.onClicked)
    this.isOpen = false
    this.menuTrigger.classList.remove(...OPEN_CLASSES);
  }

  open() {
    document.addEventListener('click', this.onClicked)
    this.menuTrigger.classList.add(...OPEN_CLASSES);

    // do not immediately open the dropdown
    // body click event we just registered will close the it
    setTimeout(() => {
      this.isOpen = true
    }, 100);
  }
}
