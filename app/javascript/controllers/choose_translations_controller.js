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
    const translations = this.get("translations").map((id) => +(id));
    this.element.querySelectorAll(".translation").forEach(trans => {
      if (translations.includes(+(trans.value))) {
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
    Array.from(document.querySelectorAll(".translation:checked")).sort(function(a, b){
      return a.dataset.priority - b.dataset.priority;
    }).forEach(function(el){
       newTranslations.push(el.value);
    });
    this.set("translations", newTranslations);

    let controller = document.getElementById("chapter-tabs");

    controller.chapter.changeTranslations(newTranslations);
  }
}
