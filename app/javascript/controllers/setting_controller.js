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

global.settings = {};
const DEFAULT_FONT_SIZE = { mobile: 16, desktop: 30 };
const LOWER_FONT_SIZE_LIMIT = 10;
const UPPER_FONT_SIZE_LIMIT = 150;
const DISABLED_COLOR_VAL = "var(--bs-gray)";
const ENABLED_COLOR_VAL = "#b1bec5";

export default class extends Controller {
  connect() {
    document.body.setting = document.body.setting || this;

    this.store = new LocalStore();
    this.loadSettings();
    this.device = new DeviceDetector();

    window.addEventListener("resize", () => this.resizeHandler());

    $("style.setting").remove();

    this.styles = document.createElement("style");
    this.styles.classList.add("setting");
    document.head.appendChild(this.styles);

    this.bindReset();
    this.bindTooltip();
    this.bindFontSize();
    this.updateFontSize();

    //this.element[this.identifier] = this;
  }

  resizeHandler() {
    this.mobile = this.device.isMobile();
    this.updateFontSize();
  }

  loadSettings() {
    let saved;

    try {
      saved = JSON.parse(this.store.get("setting") || "{}");
    } catch {
      saved = {};
    }

    let defaultsSettings = this.defaultSetting();
    settings = Object.assign(defaultsSettings, saved);

    if (settings.translations.length == 0) {
      settings.translations = defaultsSettings.translations;
    }

    // rest repeat setting,
    // we shouldn't save this in local storage in first place
    // this could lead to unexpected behaviour
    // say user has set to repeat 2:255 then switch to other surah that don't have ayah 255
    // and our player will be clueless
    settings.repeatEnabled = false;
    settings.repeatFrom = 0;
    settings.repeatTo = 0;
    settings.repeatAyah = 0;
  }

  bindTooltip() {
    $(`[data-value=${this.get("tooltip")}]`).attr("checked", "checked");

    $("[name=tooltip-display]").on("change", event => {
      this.set("tooltip", $(event.target).data("value"));
    });
  }

  bindReset() {
    $("#reset-settings").on("click", event => this.resetSetting(event));
  }

  bindFontSize() {
    $("[data-trigger=font-size]").on("click", e => this.handleFontSize(e));
  }

  getTooltipType() {
    return this.get("tooltip");
  }

  saveSettings() {
    let setting = JSON.stringify(settings);
    this.store.set("setting", setting);
  }

  defaultSetting() {
    return {
      font: "v1",
      tooltip: "t",
      recitation: 7,
      nightMode: null,
      readingMode: false,
      translations: [131],
      repeatEnabled: false,
      repeatCount: 1,
      repeatFrom: null,
      repeatTo: null,
      repeatIteration: 1,
      repeatType: "single",
      pauseBwAyah: 0,
      repeatAyah: null,
      autoScroll: true,
      autoShowWordTooltip: false,
      wordFontSize: {
        mobile: 30,
        desktop: 30
      },
      translationFontSize: {
        mobile: 16,
        desktop: 16
      }
    };
  }

  updateFontSize() {
    let rules = [];
    let device = this.mobile ? "mobile" : "desktop";
    let setting = document.body.setting.get;

    let translationFontSize = setting("translationFontSize")[device];
    let wordFontSize =
      setting("wordFontSize")[device] || DEFAULT_FONT_SIZE[device];

    const plus = document.getElementById("font-size-plus");
    const minus = document.getElementById("font-size-minus");

    if (plus) {
      if (wordFontSize <= LOWER_FONT_SIZE_LIMIT) {
        plus.style.color = ENABLED_COLOR_VAL;
        minus.style.color = DISABLED_COLOR_VAL;
      } else if (wordFontSize >= UPPER_FONT_SIZE_LIMIT) {
        plus.style.color = DISABLED_COLOR_VAL;
        minus.style.color = ENABLED_COLOR_VAL;
      } else {
        plus.style.color = ENABLED_COLOR_VAL;
        minus.style.color = ENABLED_COLOR_VAL;
      }
    }

    const arabicFs = Math.min(
      Math.max(parseInt(wordFontSize), LOWER_FONT_SIZE_LIMIT),
      UPPER_FONT_SIZE_LIMIT
    );

    rules.push(`.verse .arabic, .w {font-size: ${arabicFs}px !important}`);

    rules.push(`.translation {font-size: ${translationFontSize}px !important}`);

    // add word spacing for v1 font to fix weird word overlapping issue on FF
    rules.push(
      `#verses-reading .arabic .v1{word-spacing: ${arabicFs *
        0.323}px !important}`
    );

    rules.push(
      `#verses-reading .v1.pause {word-spacing: ${arabicFs *
        0.423}px !important}`
    );

    global.styles = this.styles;
    this.styles.innerText = rules.join(" ");
  }

  get(key) {
    return settings[key];
  }

  set(key, value) {
    settings[key] = value;
    this.saveSettings();
    document.body.setting = this;
  }

  handleFontSize(e) {
    e.preventDefault();
    let device = this.mobile ? "mobile" : "desktop";
    let setting = document.body.setting || this;

    const data = e.target.dataset;
    const targetDom = $(data.target);
    const increment = +data.increment;

    let size =
      parseInt(targetDom.css("font-size"), 10) || DEFAULT_FONT_SIZE[device];
    size = size + increment;

    if (".verse .arabic" == data.target) {
      let sizes = setting.get("wordFontSize");
      sizes[device] = size;
      setting.set("wordFontSize", sizes);
    } else {
      let sizes = setting.get("translationFontSize");
      sizes[device] = size;
      setting.set("translationFontSize", sizes);
    }

    this.updateFontSize();
  }

  resetSetting(e) {
    settings = this.defaultSetting();
    this.saveSettings();

    this.resetPage();
  }

  resetPage() {
    //$("style.setting").remove();
    this.styles.innerText = "";
    let controller = document.getElementById("chapter-tabs");
    controller.chapter.changeTranslations(this.defaultSetting().translations);
  }
}
