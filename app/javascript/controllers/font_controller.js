// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import SettingController from "./setting_controller";
import {getQuranReader} from "../utility/controller-helpers";

export default class extends SettingController {
  connect() {
    super.connect();
    this.font = this.get("font");
    $(`[value=${this.font}]`).attr("checked", "checked");

    $(document).on("change", "[name=font]", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.changeFont(e.target);
    });
  }

  disconnect() {
    $(document).off("change", "[name=font]", e => {
    });
  }

  changeFont(target) {
    this.set("font", target.value);

    getQuranReader().changeFont(target.value).then(()=> {
      this.updateFontSize();
    });
  }
}
