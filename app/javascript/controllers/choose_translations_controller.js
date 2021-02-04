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
    this.bindReset();

    const translations = this.get("translations");
    
    this.element.querySelectorAll(".translation-checkbox").forEach(trans => {
      if (translations.includes(String(trans.value))) {
        trans.setAttribute("checked", "checked");
      }
    });

    $(this.element)
      .find(".translation-checkbox")
      .on("change", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.updateTranslations();
      });
  }

  bindReset(){
    $("#translation-clear-all").on("click", () => this.resetTransaltions());
  }

  resetTransaltions(){
    document.querySelectorAll(".translation-checkbox").forEach(trans => {
      trans.checked = false;
    });

    this.set("translations", []);
    let controller = document.getElementById("chapter-tabs");
    controller.chapter.changeTranslations([]);
  }


  disconnect() {}

  updateTranslations() {
    let newTranslations = [];
    document.querySelectorAll(".translation-checkbox:checked").forEach(trans => {
      newTranslations.push(trans.value);
    });

    this.set("translations", newTranslations);

    let controller = document.getElementById("chapter-tabs");
    controller.chapter.changeTranslations(newTranslations);
  }
  
  bindTransaltionReset(){
    $("#translation-clear-all").on("click", () => this.resetTransaltions());
  }
  
  resetTransaltions(){
    document.querySelectorAll(".translation-checkbox").forEach(trans => {
      trans.checked = false;
    });
    this.set("translations", []);
    document.querySelector("#open-translations .label--subtitle").textContent = "Showing 0 translation";
    let controller = document.getElementById("chapter-tabs");
    controller.chapter.changeTranslations([]);
  }
}
