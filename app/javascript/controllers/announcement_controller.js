// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="announcement" data-alert='alert-uuid'>
//   <h1 data-target="hello.output"></h1>
// </div>

import {Controller} from "stimulus";
import LocalStore from "../utility/local-store";
import AjaxModal from "../utility/ajax-modal";

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.store = new LocalStore();

    if (this.dismissedAt == null) {
      this.show();
    } else if (this.shouldShowPopup()) {
      this.showPopup()
    }
  }

  show() {
    this.el.find(".close").on("click", e => this.onHide(e));
    this.el.removeClass("hidden");
  }

  showPopup() {
    const url = this.element.dataset.url;
    new AjaxModal().loadModal(url);

    this.store.set(`pop-${this.el.data("id")}`, new Date().getTime())
  }

  onHide(e) {
    e.preventDefault();
    this.store.set(`ann-${this.el.data("id")}`, new Date().getTime());
    this.el.addClass("hidden");
  }

  shouldShowPopup() {
    const timestamp = this.dismissedAt;

    if (timestamp == null || this.element.dataset.url == null)
      return false;

    const dismissedAt = new Date(Number(timestamp));
    const min = Math.floor((new Date() - dismissedAt) / 1000) / 60;

    return min >= 5 && this.popupShownAt == null;
  }

  get dismissedAt() {
    return this.store.get(`ann-${this.el.data("id")}`);
  }

  get popupShownAt() {
    return this.store.get(`pop-${this.el.data("id")}`);
  }
}
