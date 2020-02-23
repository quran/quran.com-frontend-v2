// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";
import RenderAsync from "../utility/async-render";

export default class extends Controller {
  connect() {
    var loader = new RenderAsync();
    loader.loadAsyncContent(`#${this.element.getAttribute("id")}`);
  }
}
