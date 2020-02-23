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
    $(this.element)
      .find(".tab-link, .nav-link")
      .on("ajax:success", e => {
        $(this.element)
          .find(".tab-link, .nav-link")
          .removeClass("active text-success");
        $(e.target)
          .addClass("text-success active")
          .removeClass("text-dark");
      });
  }

  disconnect() {}
}
