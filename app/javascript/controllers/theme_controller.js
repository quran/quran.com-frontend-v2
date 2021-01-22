// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import SettingController from "./setting_controller";
import LocalStore from "../utility/local-store";

export default class extends SettingController {
  connect() {
    super.connect();

    $(document).on("click", ".theme-switch", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.toggleNight();
    });

    this.updatePage();
  }

  disconnect() {
    $(document).off("click", ".theme-switch", e => {});
  }

  updatePage() {
    const isNightMode = this.get("nightMode");
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const setDark = function(e) {
      let bodyClasses = document.body.classList;
      if (e && e.matches && null == isNightMode) {
        bodyClasses.add("dark");
      } else {
        if (isNightMode) {
          bodyClasses.add("dark");
        } else {
          bodyClasses.remove("dark");
        }
      }
    };

    document.addEventListener("DOMContentLoaded", () => {
      setDark(darkModeMediaQuery);
    });
    darkModeMediaQuery.addListener(event => {
      setDark(event);
    });
    setDark(darkModeMediaQuery);
  }

  toggleNight() {
    const isNightMode = document.body.classList.toggle("night");
    this.set("nightMode", isNightMode);
  }
}
