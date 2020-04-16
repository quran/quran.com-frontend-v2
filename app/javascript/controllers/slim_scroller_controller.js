// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    let dom = $(this.element);

    if (!dom.data("slim")) {
      dom.slimscroll({
        height: dom.data("scrollHeight") || "100%",
        size: dom.data("scrollSize") || "4px",
        position: dom.data("scrollPosition") || "right",
        color: dom.data("scrollColor") || "rgba(0,0,0,0.6)",
        alwaysVisible: dom.data("scrollAlwaysVisible") || false,
        distance: dom.data("scrollDistance") || "4px",
        railVisible: dom.data("scrollRailVisible") || false,
        railColor: dom.data("scrollRailColor") || "#fafafa",
        allowPageScroll: false,
        disableFadeOut: false
      });
      dom.data("slim", true);
    }
  }
}
