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
    const translations = this.get("translations");

    this.element.querySelectorAll(".translation").forEach(trans => {
      if (translations.includes(String(trans.value))) {
        trans.setAttribute("checked", "checked");
      }
    });

    $(this.element)
      .find(".translation")
      .on("change", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.updateTranslations();
      });
  }

  disconnect() {}

  updateTranslations() {
    let newTranslations = [];
    document.querySelectorAll(".translation:checked").forEach(trans => {
      newTranslations.push(trans.value);
    });

    this.set("translations", newTranslations);

    let controller = document.getElementById("chapter-tabs");

    controller.chapter.changeTranslations(newTranslations);
  }
}
