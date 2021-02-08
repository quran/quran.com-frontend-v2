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
    this.themeButtons = $(this.element).find("a");

    this.themeButtons.on("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const targetTheme = e.currentTarget;

      if (targetTheme.classList.contains("active")) return;

      this.themeButtons.removeClass("active");
      e.currentTarget.classList.add("active");

      this.toggle();
    });

    this.updatePage();
  }

  disconnect() {}

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

  toggle() {
    const isNightMode = document.body.classList.toggle("dark");
    this.set("nightMode", isNightMode);
  }
}
