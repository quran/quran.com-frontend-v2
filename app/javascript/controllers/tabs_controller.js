// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="track" data-action=action-name>
// </div>

import {Controller} from "stimulus";

const TAB_ITEM_CLASS = ".tabs__item";
const TAB_ITEM_SELECTED_CLASS = "tabs__item--selected";

export default class extends Controller {
  connect() {
    this.element.querySelectorAll(TAB_ITEM_CLASS).forEach(item => {
      item.addEventListener("click", e => this.changeTab(e));
    });
  }

  disconnect() {
  }

  changeTab(e) {
    e.preventDefault();
    const tabItem = e.currentTarget;

    if (tabItem.classList.contains(TAB_ITEM_SELECTED_CLASS)) return;

    const {target, tab} = tabItem.dataset;
    this.hideTabs(tab);
    this.showTab(target);
  }

  showTab(target) {
    // activate all tab items sharing same target
    const tabItems = document.querySelectorAll(`.tabs__item[data-target='${target}`)
    tabItems.forEach((tabItem) => {
      tabItem.classList.add(TAB_ITEM_SELECTED_CLASS);
      this.fireEvent("tab.shown", tabItem);
    })

    // show all target tab panens
    const tabPanes = document.querySelectorAll(target);
    tabPanes.forEach((pane) => {
      pane.classList.remove("hidden");
      pane.classList.add(...["show", "active"]);
    })
  }

  hideTabs(group) {
    // hide tab items
    document
      .querySelectorAll(`[data-tab=${group}]`)
      .forEach(item => {
        item.classList.remove(TAB_ITEM_SELECTED_CLASS)
        this.fireEvent("tab.hidden", item);
      });

    // hide tab panels
    document.querySelectorAll(`[data-tab-group=${group}]`).forEach(item => {
      item.classList.add("hidden");
      item.classList.remove(...["show", "active"]);
    });
  }

  fireEvent(name, element){
    let event;
    if (typeof Event === "function")
      event = new Event(name);
    else {
      event = document.createEvent("Event");
      event.initEvent(name, true, true);
    }

    (element || document).dispatchEvent(event);
  }
}
