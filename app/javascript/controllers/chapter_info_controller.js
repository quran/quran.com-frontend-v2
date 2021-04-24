// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="menu">
// <i class='fa fa-times' data-target='sidebar.trigger'></i>
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    const el = $(this.element)
    el.addClass('text text--grey');

    el.find("p, ul, span").addClass("text--medium text--regular")
    el.find("h2, h3").addClass("text text--darkgrey text--large text--semibold")
    //el.find("a").addClass("text text--green")
  }
}
