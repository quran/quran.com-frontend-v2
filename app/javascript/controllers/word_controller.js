// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="word">
// </div>

import { Controller } from "stimulus";
import LocalStore from "utility/local-store";

export default class extends Controller {
  connect() {
    let el = $(this.element);
    let setting = document.body.setting;

    el.tooltip({
      trigger: "hover",
      placement: "top",
      html: true,
      template:
        "<div class='tooltip' role='tooltip'><div class='arrow'></div><div class='tooltip-inner'></div></div>",
      title: function(w) {
        let word = $(this);

        const local = word.data("local");
        const tooltip = setting.getTooltipType();
        const text = word.data(tooltip);
        return `<div class='${local}'>${text}</div>`;
      }
    });

    el.on("dblclick", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.dbClick(e);
    });

    el.on("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.play();
    });

    this.el = el;
  }

  play() {
    alert("play");
  }

  dbClick() {
    alert("dbclick");
  }

  disconnect() {
    this.el.off("click");
    this.el.off("dblclick");
    this.el.tooltip("dispose");
  }
}
