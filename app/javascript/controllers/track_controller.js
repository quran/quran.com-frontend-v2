// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="track" data-action=action-name>
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    this.element.addEventListener('click', (e) => this.trackActions(e))
  }

  disconnect() {
  }

  trackActions(e) {
    let data;

    if (e.target.dataset.action) {
      data = e.target.dataset
    } else {
      data = e.target.dataset
    }

    const {name, category, action, value} = data

    GoogleAnalytic.trackEvent(name, category, action || "Clicked", value);
  }
}
