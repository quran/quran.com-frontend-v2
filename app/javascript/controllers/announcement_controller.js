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

    if (this.shouldShowPopup())
      setTimeout(() => this.showPopup(), 1500)
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
    return !this.popupShownAt && this.canShowDonation();
  }

  canShowDonation(){
    const notOnDonation = location.pathname != '/donations'
    const currentPage = this.element.dataset.page;
    const readingQuran = currentPage == 'quran' || currentPage == 'chapters';
    return notOnDonation && !readingQuran
  }

  shouldShowNotification() {
    return this.popupShownAt && !this.dismissedAt && this.canShowDonation();
  }

  get dismissedAt() {
    return this.store.get(`ann-${this.el.data("id")}`);
  }

  get popupShownAt() {
    return this.store.get(`pop-${this.el.data("id")}`);
  }
}
