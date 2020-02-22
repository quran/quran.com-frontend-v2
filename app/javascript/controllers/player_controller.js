// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import { Controller } from "stimulus";
import { Howl, Howler } from "howler";

const AUDIO_CDN = "https://verses.quran.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = true;

export default class extends Controller {
  connect() {
    let el = this.element;
    let setting = document.body.setting;

    this.config = {
      chapter: el.dataset.chapterId,
      firstVerse: null,
      lastVerse: null,
      preloadTrack: {},
      interval: null,
      autoScroll: true,
      repeatIteration: setting.get("repeatIteration"), // how many time player should repeating a range setting
      recitation: setting.get("recitation"),
      repeatSetting: {
        enabled: setting.get("repeatEnabled"),
        type: setting.get("repeatType"), // or range
        count: setting.get("repeatCount") // number of time to play each ayah
      }
    };

    this.alignTimers = [];
    this.track = {};
    this.audioData = {};

    this.progressBar = $("#player #player-bar").slider({
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      enabled: false
    });
  }
}
