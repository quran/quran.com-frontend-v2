// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import SettingController from "./setting_controller";

export default class extends SettingController {
  connect() {
    super.connect();

    $(this.element)
      .find("[name=locale]")
      .on("change", e => {
        e.preventDefault();
        this.updateLocale(e.target.value);
      });
  }

  disconnect() {
    $(document).off("change", "[name=locale]", e => {});
  }

  updateLocale(locale) {
    Turbolinks.visit(
      parent.window.location.origin +
        parent.window.location.pathname +
        "?locale=" +
        locale
    );
  }
}
