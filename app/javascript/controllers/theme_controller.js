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
    this.logDevMessage();
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

  logDevMessage() {
    try {
      console["log"](
        "%c ﷽\n\n %s",
        "background: #00acc2; color: #fff; padding: 2px; border-radius:2px",
        "Salam, found any bug? Please report it here https://github.com/quran/quran.com-frontend-v2/issues"
      );
    } catch (e) {}
  }

  disconnect() {}

  setTheme(theme) {
    this.themeButtons.removeClass("active");
    $(`[data-theme='${theme}']`).addClass("active");

    let bodyClasses = document.body.classList;
    bodyClasses.remove("dark");
    bodyClasses.add(theme);
  }

  updatePage() {
    const isNightMode = this.get("nightMode");
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const updateTheme = e => {
      if (e && e.matches && null == isNightMode) {
        this.setTheme("dark");
      } else {
        if (isNightMode) {
          this.setTheme("dark");
        } else {
          this.setTheme("light");
        }
      }
    };

    document.addEventListener("DOMContentLoaded", () => {
      updateTheme(darkModeMediaQuery);
    });
    darkModeMediaQuery.addListener(event => {
      updateTheme(event);
    });
    updateTheme(darkModeMediaQuery);
  }

  toggle() {
    const isNightMode = document.body.classList.toggle("dark");
    this.set("nightMode", isNightMode);
  }
}
