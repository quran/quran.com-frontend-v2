import {Controller} from "stimulus";

const AUDIO_CDN = "https://audio.qurancdn.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = false;
let Howl, Howler;

export default class extends Controller {
  connect(){
    this.getSetting = document.body.setting.get;
    this.preloadTrack = {};
    this.currentTrack = {
      howl: null,
      segments: []
    };
  }

  buildAudioUrl(path) {
    if (!/(http)?s?:?\/\//.test(path)) {
      path = AUDIO_CDN + path;
    }
    return path;
  }

  loadHowler() {
    if (Howl) {
      return Promise.resolve()
    }

    return import("howler").then(howler => {
      Howl = howler.Howl;
      Howler = howler.Howler;
    });
  }
}
