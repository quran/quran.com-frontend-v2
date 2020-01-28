// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="sticky-header">
// </div>

import { Controller } from "stimulus";
import { throttle } from "lodash-es";

export default class extends Controller {
  connect() {
    $(window).on("scroll", throttle(e => this.onScroll(e), 300));
  }

  onScroll(e) {
    if ($(e.target).scrollTop() >= 50) $("header").addClass("is-sticky");
    else $("header").removeClass("is-sticky");
  }
}
