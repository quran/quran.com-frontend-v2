// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="ajax-modal" data-url="url-to-load-content">
// </div>

import {Controller} from "stimulus";
import AjaxModal from "../utility/ajax-modal";

export default class extends Controller {
  connect() {
    this.element.addEventListener("click", e => this.loadModal(e));
  }

  loadModal(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let target = $(e.currentTarget);
    let url = target.data("url");
    let classes = target.data("class");

    new AjaxModal().loadModal(url, classes);
  }
}
