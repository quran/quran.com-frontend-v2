// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="track" data-action=action-name>
// </div>

import { Controller } from "stimulus";

const TAB_ITEM_CLASS = ".tabs__item";
const TAB_ITEM_SELECTED_CLASS = "tabs__item--selected";

export default class extends Controller {
  connect() {
    this.element.querySelectorAll(TAB_ITEM_CLASS).forEach(item => {
      item.addEventListener("click", e => this.showTab(e));
    });
  }

  disconnect() {}

  showTab(e) {
    e.preventDefault();
    const tabItem = e.currentTarget;

    if (tabItem.classList.contains(TAB_ITEM_SELECTED_CLASS)) return;

    const { target, tab } = tabItem.dataset;
    this.hideTabs(tab);

    tabItem.classList.add(TAB_ITEM_SELECTED_CLASS);
    const tabPane = document.querySelector(target);
    tabPane.classList.remove("hidden");
    tabPane.classList.add(...["show", "active"]);
    const event = new Event("tab.shown");
    e.target.nodeName == "SPAN"
      ? e.target.parentElement.dispatchEvent(event)
      : e.target.dispatchEvent(event);
  }

  hideTabs(group) {
    let ele = document.querySelector(
      `.tabs__item--selected[data-tab='${group}']`
    );
    if (ele) {
      const event = new Event("tab.hidden");
      ele.dispatchEvent(event);
    }

    // hide tab items
    document
      .querySelectorAll(`[data-tab=${group}]`)
      .forEach(item => item.classList.remove(TAB_ITEM_SELECTED_CLASS));

    // hide tab panels
    document.querySelectorAll(`[data-tab-group=${group}]`).forEach(item => {
      item.classList.add("hidden");
      item.classList.remove(...["show", "active"]);
    });
  }
}
