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

    /*if (this.dismissedAt == null) {
      this.show();
    } else if (this.shouldShowPopup()) {
      this.showPopup()
    }*/

    if (this.shouldShowPopup())
      setTimeout(() => this.showPopup(), 5000)
    else if (this.shouldShowNotification()) {
      this.show()
    }
  }

  show() {
    GoogleAnalytic.trackEvent(
      "notification-shown",
      "donation",
      "donation-notification",
      1
    );

    this.el.find(".close").on("click", e => this.onHide(e));
    this.el.removeClass("hidden");
  }

  showPopup() {
    const url = this.element.dataset.url;
    new AjaxModal().loadModal(url);

    GoogleAnalytic.trackEvent(
      "popup-shown",
      "donation",
      "donation-popup",
      1
    );

    $("#ajax-modal").on("hidden.bs.modal", (e) => {
      this.store.set(`pop-${this.el.data("id")}-dismissed`, new Date().getTime())

      GoogleAnalytic.trackEvent(
        "popup-dismissed",
        "donation",
        "donation-popup",
        1
      );
    });

    this.store.set(`pop-${this.el.data("id")}`, new Date().getTime())
  }

  onHide(e) {
    e.preventDefault();
    this.store.set(`ann-${this.el.data("id")}`, new Date().getTime());
    this.el.addClass("hidden");
  }

  shouldShowPopup() {
    /*const timestamp = this.dismissedAt;

    if (timestamp == null || this.element.dataset.url == null)
      return false;

    const dismissedAt = new Date(Number(timestamp));
    const min = Math.floor((new Date() - dismissedAt) / 1000) / 60;

    return min >= 5 && this.popupShownAt == null;*/

    // don't show popup on surah or home page
    // also don't show if user is on donation page

    const notOnDonation = location.pathname != '/donations'
    const currentPage = this.element.dataset.page;
    const readingQuran = currentPage == 'home' || currentPage == 'chapters';

    return !this.popupShownAt && notOnDonation && !readingQuran
  }

  shouldShowNotification() {
    return ! this.dismissedAt;
  }

  get dismissedAt() {
    return this.store.get(`ann-${this.el.data("id")}`);
  }

  get popupShownAt() {
    return this.store.get(`pop-${this.el.data("id")}`);
  }
}
