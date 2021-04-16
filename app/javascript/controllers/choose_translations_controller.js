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
    this.bindClearAll();

    const translations = window.pageSettings ? window.pageSettings.translations : this.get("translations");

    this.element.querySelectorAll(".translation-checkbox").forEach(trans => {
      if (translations.includes(Number(trans.value))) {
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

  bindClearAll() {
    $("#translation-clear-all").on("click", () => this.clearAllTranslations());
  }

  disconnect() {
  }

  updateTranslations() {
    let newTranslations = [];
    document
      .querySelectorAll(".translation-checkbox:checked")
      .forEach(trans => {
        newTranslations.push(trans.value);
      });

    this.set("translations", newTranslations);
    getQuranReader().changeTranslations(newTranslations)
  }

  clearAllTranslations() {
    document.querySelectorAll(".translation-checkbox").forEach(trans => {
      trans.checked = false;
    });

    this.set("translations", []);
    getQuranReader().changeTranslations([])
  }
}
