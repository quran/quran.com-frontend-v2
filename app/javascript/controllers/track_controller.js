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
    const {name, category, action, value} = e.target.dataset

    GoogleAnalytic.trackEvent(name, category, action || "Clicked", value);
  }
}
