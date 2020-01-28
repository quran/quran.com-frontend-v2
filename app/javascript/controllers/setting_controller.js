// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>
/*
import { Controller } from "stimulus";
let settings = {}

export default class extends Controller {
  static targets = [
    'fontSize',
    'wordTooltip',
    'reset',
    'readingMode',
    'translations',
    'recitation'
  ];

  connect() {
    $(document).on('click', '.font-size', this.handleFontSize);
    $(document).on("click", '.word-tooltip', this.handleTooltip);
    $(document).on('click', '#reset-setting', this.resetSetting);
    $(document).on('click', '#toggle-readingmode', this.toggleReadingMode);
    $(document).on('hide.bs.dropdown', '#translation-dropdown', this.reloadTranslations);
    $(document).on('hide.bs.dropdown', '#reciter-dropdown', this.updateReciter);
  }

  defaultSetting() {
    return {
      font: 'qcf_v2',
      tooltip: 'translation',
      recitation:  7,
      readingMode: false,
      translations: [],
      arabicFontSize: {
        mobile: 30,
        desktop: 50
      },
      translationFontSize: {
        mobile: 17,
        desktop: 20
      }
    };
  }

  reset(event) {
    event.preventDefault();

    this.settings = this.defaultSetting();
    this.resetPage();
    this.save();
  }
}

class Settings {
  constructor() {
    $(document).on('click', '.font-size', this.handleFontSize);
    $(document).on("click", '.word-tooltip', this.handleTooltip);
    $(document).on('click', '#reset-setting', this.resetSetting);
    $(document).on('click', '#toggle-readingmode', this.toggleReadingMode);
    $(document).on('hide.bs.dropdown', '#translation-dropdown', this.reloadTranslations);

    this.updatePage();
  }

  updateReciter() {
    const activeRecitation = $("#reciter-dropdown-menu .dropdown-item.active");
    return player.setRecitation(activeRecitation.data('recitation'));
  }

  reloadTranslations() {
    const activeTranslations = $("#translation-dropdown-menu .dropdown-item.active");
    const translationIds = [];
    activeTranslations.each((i, t) => translationIds.push($(t).data('translation')));
    return $.get(`${$('#verses-pagination').data('url')}`, {translations: translationIds.join(',')}, function(response) {
      $("#verses").html(response);
      return $this.bindWordTooltip($('.word'));
    });
  }

  get(key) {
    return this.settings[key];
  }

  toggleNightMode(e) {
    e.preventDefault();
    const isNightMode = $("body").hasClass('night');
    $("body").toggleClass('night');
    $('#toggle-nightmode').toggleClass('text-primary');
    this.settings.nightMode =  !isNightMode;
    return this.saveSettings();
  }

  handleTooltip(e) {
    e.preventDefault();
    const target = $(e.target);
    target.parent('.dropdown-menu');
    target.toggleClass('active');
    return this.settings.tooltip = target.data('tooltip') || target.parent().data('tooltip');
  }

  handleFontSize(e) {
    e.preventDefault();
    const that = $(e.target);
    const target = that.closest('li').data('target');
    const targetDom = $(target);

    let size = parseInt(targetDom.css('font-size'), 10);
    size = that.hasClass('increase') ? size + 1 : size - 1;

    return this.changeFontSize(targetDom, size);
  }

  getTooltipType() {
    if (this.settings.tooltip === 'transliteration') {
      return 'tr';
    } else {
      return 't';
    }
  }

  changeFontSize(target, size) {
    target.css('font-size', size );
    return window.matchMedia("(max-width: 610px)");
  }

  resetSetting(e) {
    e.preventDefault();
    $('body').removeClass('night');
    this.settings = this.defaultSetting();
    this.resetPage();
    return this.saveSettings();
  }

  resetPage() {
    $(".translation").css('font-size', '20px');
    return $(".word").css('font-size', '50px');
  }

  updatePage() {
    const isNightMode = this.get('nightMode');
    const setDark = function(e) {
      if (e.matches) {
        return $("body").addClass('night');
      } else {
        if (isNightMode) {
          return $('body').addClass('night');
        } else {
          return $('body').removeClass('night');
        }
      }
    };

    const nightMode = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(nightMode);
    return document.addEventListener("DOMContentLoaded", () => setDark(mql));
  }

  saveSettings() {
    return localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  defaultSetting() {
    return {
      font: 'qcf_v2',
      tooltip: 'translation',
      recitation:  7,
      nightMode: false,
      readingMode: false,
      translations: [],
      arabicFontSize: {
        mobile: 30,
        desktop: 50
      },
      translationFontSize: {
        mobile: 17,
        desktop: 20
      }
    };
  }
}
*/
