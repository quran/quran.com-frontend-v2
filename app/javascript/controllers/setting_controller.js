// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";
import LocalStore from "../utility/local-store";
import DeviceDetector from "../utility/deviceDetector";

let settings = {};

export default class extends Controller {
  static targets = [
    "wordTooltip",
    "reset",
    "readingMode",
    "translations",
    "recitation"
  ];

  connect() {
    this.element[this.identifier] = this;
    this.store = new LocalStore();
    this.loadSettings();
    this.device = new DeviceDetector();
    window.addEventListener("resize", () => this.resizeHandler());

    /*$(document).on("click", "#reset-setting", e => {
      e.preventDefault();
      this.resetSetting();
    });*/
  }

  resizeHandler() {
    this.mobile = this.device.isMobile();
  }

  updateReciter(newRecitation) {
    let playerDom = document.getElementById("player");
    let player = playerDom.player;

    player.setRecitation(newRecitation);
  }

  loadSettings() {
    let saved;

    try {
      saved = JSON.parse(this.store.get("setting") || "{}");
    } catch {
      saved = {};
    }

    let defaultsSettings = this.defaultSetting();
    this.settings = Object.assign(defaultsSettings, saved);

    if (this.settings.translations.length == 0) {
      this.settings.translations = defaultsSettings.translations;
    }
  }

  getTooltipType() {
    if (this.get("tooltip") == "translation") {
      return "t";
    } else {
      return "tr";
    }
  }

  saveSettings() {
    let setting = JSON.stringify(this.settings);
    this.store.set("setting", setting);
  }

  defaultSetting() {
    return {
      font: "v1",
      tooltip: "translation",
      recitation: 7,
      nightMode: false,
      readingMode: false,
      translations: [131],
      repeatEnabled: false,
      repeatType: "single",
      repeatCount: 1,
      repeatIteration: 1,
      autoScroll: true,
      wordFontSize: {
        mobile: 30,
        desktop: 50
      },
      translationFontSize: {
        mobile: 17,
        desktop: 20
      }
    };
  }

  updateFontSize() {
    $("style.setting").remove();

    let fontStylesheet = document.createElement("style");
    fontStylesheet.classList.add("setting");
    document.head.appendChild(fontStylesheet);

    let device = this.mobile ? "mobile" : "desktop";

    let wordFontSize = this.get("wordFontSize")[device];
    let translationFontSize = this.get("translationFontSize")[device];

    fontStylesheet.sheet.insertRule(
      `.w {font-size: ${wordFontSize}px !important}`
    );
    fontStylesheet.sheet.insertRule(
      `.translation {font-size: ${translationFontSize}px !important}`
    );
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  toggleNightMode(e) {
    const isNightMode = $("body").hasClass("night");
    document.body.classList.toggle("night");
    this.set("nightMode", !isNightMode);
  }

  handleTooltip(e) {
    const target = $(e.target);
    this.set("tooltip", target.val());
  }

  handleFontSize(e) {
    e.preventDefault();
    const that = $(e.target);

    const target = that.closest("li").data("target");
    const targetDom = $(target);

    let size = parseInt(targetDom.css("font-size"), 10);
    size = that.hasClass("increase") ? size + 1 : size - 1;

    let device = this.mobile ? "mobile" : "desktop";

    if (target == ".word") {
      let sizes = this.get("wordFontSize");
      sizes[device] = size;
      this.set("wordFontSize", sizes);
    } else {
      let sizes = this.get("translationFontSize");
      sizes[device] = size;
      this.set("translationFontSize", sizes);
    }

    this.updateFontSize();
  }

  resetSetting(e) {
    $("body").removeClass("night");
    this.settings = this.defaultSetting();
    this.saveSettings();

    this.resetPage();
  }

  resetPage() {
    $("style.setting").remove();
  }
}
