// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This controller show the element to certain percentage of traffic
//
// <div data-controller="percentage-show" data-percentage=2>
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    if (this.shuffle()) {
     this.show()
    } else{
      this.hide()
    }
  }

  show() {
    this.element.classList.remove('d-none')
    GoogleAnalytic.trackEvent('Shown', 'next.quran.com', 'shown', 1);
  }

  hide() {
    this.element.classList.add('d-none')
  }

  shuffle() {
    let percentage = Number(this.element.dataset.percentage)
    let draw = Math.round(Math.random(100) * 100);

    console.log("draw", draw, "percentage", percentage)
    return draw <= percentage;
  }
}
