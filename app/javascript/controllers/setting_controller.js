// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import {Controller} from "stimulus";
import LocalStore from "../utility/local-store";
import DeviceDetector from "../utility/deviceDetector";
import {getQuranReader} from "../utility/controller-helpers";

global.settings = {};

const DEFAULT_FONT_SIZE = {
  v1: {
    mobile: 20,
    desktop: 30,
  },
  v2: {
    mobile: 16,
    desktop: 30,
  },
  indopak: {
    mobile: 25,
    desktop: 30,
  },
  default: {
    mobile: 16,
    desktop: 30,
  }
};

const DEFAULT_TRANSLATION_SIZE = {
  mobile: 16,
  desktop: 16
}

const LOWER_FONT_SIZE_LIMIT = 15;
const UPPER_FONT_SIZE_LIMIT = 150;
const DISABLED_COLOR_VAL = "var(--gray)";
const ENABLED_COLOR_VAL = "#b1bec5";

export default class extends Controller {
  connect() {
    document.body.setting = document.body.setting || this;

    this.store = new LocalStore();
    this.loadSettings();
    this.device = new DeviceDetector();
    this.mobile = this.device.isMobile();

    window.addEventListener("resize", () => this.resizeHandler());

    $("style.setting").remove();

    this.styles = document.createElement("style");
    this.styles.classList.add("setting");
    document.head.appendChild(this.styles);

    this.bindReset();
    this.bindTooltip();
    this.bindFontSize();
    this.updateFontSize();
  }

  hideSetting() {
    document.querySelector(".menus").classList.add("hidden");
    document.querySelector(".menus__tab").classList.add("hidden");
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
    // for example user has set to repeat 2:255 then switch to other surah that don't have ayah 255
    // and our player will be clueless, there are lot of edge cases here.
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
      translations: [131, 20],
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
      arabicFontSize: DEFAULT_FONT_SIZE,
      translationFontSize: DEFAULT_TRANSLATION_SIZE
    };
  }

  updateFontSize() {
    let rules = [];
    let device = this.mobile ? "mobile" : "desktop";

    let translationFontSize = parseInt(this.translationFontSize()[device]);
    let arFontSize = parseInt(this.wordFontSize()[device]);

    const arabicFs = Math.min(
      Math.max(arFontSize, LOWER_FONT_SIZE_LIMIT),
      UPPER_FONT_SIZE_LIMIT
    );

    rules.push(`.verse .arabic, .w{font-size: ${arabicFs}px !important}`);
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

    let targetDom, defaultFs;

    const data = e.target.dataset;
    const increment = +data.increment;

    if ('arabic' == data.target) {
      targetDom = $(".verse .arabic");
      defaultFs = this.wordFontSize()[device];
    } else {
      targetDom = $(".verse .translation");
      defaultFs = this.translationFontSize()[device];
    }

    let size =
      parseInt(targetDom.css("font-size") || defaultFs, 10)

    size = size + increment;

    let plusBtn;
    let minusBtn;

    if ("arabic" == data.target) {
      // each Arabic script script has different font sizes
      let arabicSizes = setting.get("arabicFontSize") || DEFAULT_FONT_SIZE;

      if (arabicSizes[setting.get("font")]) {
        arabicSizes[setting.get("font")][device] = size
      } else {
        arabicSizes['default'][device] = size
      }
      setting.set("arabicFontSize", arabicSizes);

      plusBtn = document.getElementById("font-size-plus--arabic");
      minusBtn = document.getElementById("font-size-minus--arabic");
    } else {
      let sizes = setting.get("translationFontSize") || DEFAULT_TRANSLATION_SIZE;
      sizes[device] = size;
      setting.set("translationFontSize", sizes);
      plusBtn = document.getElementById("font-size-plus--translation");
      minusBtn = document.getElementById("font-size-minus--translation");
    }

    if (size <= LOWER_FONT_SIZE_LIMIT) {
      minusBtn.style.color = DISABLED_COLOR_VAL
      minusBtn.disabled = true
      minusBtn.ariaDisabled = true
    } else {
      minusBtn.style.color = ENABLED_COLOR_VAL
      minusBtn.disabled = false
      minusBtn.ariaDisabled = false
    }

    if (size >= UPPER_FONT_SIZE_LIMIT) {
      plusBtn.style.color = DISABLED_COLOR_VAL
      plusBtn.disabled = true
      plusBtn.ariaDisabled = true
    } else {
      plusBtn.style.color = ENABLED_COLOR_VAL;
      plusBtn.disabled = null
      plusBtn.ariaDisabled = null
    }

    this.updateFontSize();
  }

  resetSetting(e) {
    settings = this.defaultSetting();
    this.saveSettings();

    this.resetPage();
  }

  resetPage() {
    this.styles.innerText = "";
    getQuranReader().changeTranslations(this.defaultSetting().translations)
  }

  wordFontSize() {
    let setting = document.body.setting.get;
    const fontSizes = setting("arabicFontSize") || DEFAULT_FONT_SIZE;

    return fontSizes[this.currentFont] || fontSizes.default;
  }

  translationFontSize() {
    let setting = document.body.setting.get;
    return setting("translationFontSize") || DEFAULT_TRANSLATION_SIZE
  }

  get currentFont() {
    let font = null;
    if (window.pageSettings) {
      font = pageSettings.font;
    }

    if (!font) {
      const setting = document.body.setting.get;
      font = setting('font')
    }
    return font
  }

  get selectedTranslations(){
    if (window.pageSettings) {
      return pageSettings.translations;
    } else{
      return [];
    }
  }
}
