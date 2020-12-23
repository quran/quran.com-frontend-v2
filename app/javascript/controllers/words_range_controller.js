// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import {Controller} from "stimulus";
import Tooltip from "bootstrap/js/src/tooltip";

export default class extends Controller {
  connect() {
    this.element.tooltip = new Tooltip(this.element, {
      trigger: "hover",
      placement: "top",
      html: true,
      sanitize: false,
      template:
        "<div class='tooltip bs-tooltip-top' role='tooltip'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>",
      title: () => {
        const locale = window.locale;
        return `<div class='${locale}'>Play Range</div>`;
      }
    });
    global.tip=this.element;
  }

  disconnect() {
  }
}
