// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This controller show the element to certain percentage of traffic
//
// <div data-controller="percentage-show" data-percentage=2>
// </div>

import {Controller} from "stimulus";
import LocalStore from "../utility/local-store";

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.store = new LocalStore();

    if (this.shouldShow()) {
      this.show()
    } else {
      this.hide()
    }

    this.el.find(".close").on("click", e => {
      e.preventDefault();
      this.dismiss();
    });
  }

  show() {
    this.element.classList.remove('d-none')
    GoogleAnalytic.trackEvent('Shown', 'next.quran.com', 'shown', 1);
  }

  get dismissedAt() {
    return this.store.get(`ann-${this.el.data("id")}`);
  }

  hide() {
    this.element.classList.add('d-none')
  }

  dismiss(){
    this.store.set(`ann-${this.el.data("id")}`, new Date().getTime());
    this.hide();
  }

  shuffle() {
    let percentage = Number(this.element.dataset.percentage)
    let draw = Math.round(Math.random(100) * 100);

    console.log("draw ", draw, draw <= percentage);
    return draw <= percentage;
  }

  shouldShow() {
    return this.shuffle() && !this.dismissedAt;
  }
}
