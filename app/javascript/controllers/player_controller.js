// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import { Controller } from "stimulus";
import Tooltip from "bootstrap/js/src/tooltip";

const AUDIO_CDN = "https://audio.qurancdn.com/";
//"https://download.quranicaudio.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = false;
let Howl, Howler;

export default class extends Controller {
  connect() {
    import("howler").then(howler => {
      Howl = howler.Howl;
      Howler = howler.Howler;
    });

    this.element[this.identifier] = this;
    this.settings = document.body.setting;

    this.playWordQueue = [];
    this.resumeOnWordPlayEnd = false;
    this.preloadTrack = {};
    this.segmentTimers = [];
    this.track = {};
    this.audioData = {};
    this.playerProgressInterval = null;

    this.chapter = null;
    this.firstVerse = null;
    this.lastVerse = null;
    this.currentVerse = null;

    this.config = {
      autoScroll: this.settings.get("autoScroll"),
      recitation: this.settings.get("recitation"),
      showTooltip: false,
      repeat: {
        verse: null,
        type: this.settings.get("repeatType") || "single", // or range
        count: this.settings.get("repeatCount"), // number of time to play each ayah
        from: this.settings.get("repeatFrom"),
        to: this.settings.get("repeatTo"),
        iteration: 1
      }
    };

    this.buildPlayer();
    this.bindPlayerEvents();
  }

  updateRepeatConfig(setting) {
    this.config.repeat = {
      enabled: setting.repeatEnabled,
      count: setting.repeatCount,
      type: setting.repeatType,
      verse: setting.repeatAyah,
      from: setting.repeatFrom,
      to: setting.repeatTo,
      iteration: 1
    };

    if ("single" == setting.repeatType) this.currentVerse = setting.repeatAyah;
    else this.currentVerse = setting.repeatFrom;

    if (this.isPlaying()) this.play(this.currentVerse);
  }

  init(chapter, firstVerse, lastVerse) {
    this.chapter = chapter;
    this.firstVerse = firstVerse;
    this.lastVerse = lastVerse;

    const that = this;
    this.updateVerses().then(() => {
      // set first ayah track to play, if player isn't already playing any ayah
      that.currentVerse = that.currentVerse || that.firstVerse;

      // preload howl for first ayah
      that.createHowl(that.currentVerse, false);
      //chapter.scrollToVerse(that.currentVerse);
    });
  }

  disconnect() {
    if (this.isPlaying()) this.track.howl.stop();

    this.preloadTrack = {};
    this.playWordQueue = [];
    //unload all tracks
    Howler.unload();
    this.progressBar.removeEventListener(this.onProgressChange);
    this.progressBar.disabled = true;
  }

  isPlaying() {
    return this.track.howl && this.track.howl.playing();
  }

  buildPlayer() {
    this.progressBar = document.getElementById("player-range");

    // auto scroll component
    this.scrollButton = this.element.querySelector("#auto-scroll-btn");

    new Tooltip(this.scrollButton, {
      placement: "top",
      boundary: "window",
      html: true,
      sanitize: false,
      title: this.scrollButton.dataset.title
    });

    let scrollBtnClasses = this.scrollButton.classList;

    if (this.config.autoScroll) {
      scrollBtnClasses.add("text-primary");
      scrollBtnClasses.remove("text-muted");
    }

    this.scrollButton.addEventListener("click", event => {
      event.preventDefault();
      this.config.autoScroll = !this.config.autoScroll;

      if (this.config.autoScroll) {
        scrollBtnClasses.add("text-primary");
        scrollBtnClasses.remove("text-muted");

        this.chapter && this.chapter.scrollToVerse(this.currentVerse);
      } else {
        scrollBtnClasses.remove("text-primary");
        scrollBtnClasses.add("text-muted");
      }

      this.settings.saveSettings();
    });
  }

  playWord(audioPath) {
    this.resumeOnWordPlayEnd = this.resumeOnWordPlayEnd || this.isPlaying();

    let howl = new Howl({
      src: [`${AUDIO_CDN}${audioPath}`],
      html5: USE_HTML5,
      onload: () => {
        this.isPlaying() && this.handlePauseBtnClick();
      },
      onplayerror: () => {
        this.playWordQueue = [];

        this.resumeOnWordPlayEnd && this.handlePlayBtnClick();
        this.resumeOnWordPlayEnd = false;
      },
      onend: () => {
        this.playWordQueue.shift();

        if (this.playWordQueue[0]) {
          this.playWordQueue[0].play();
        } else {
          this.resumeOnWordPlayEnd && this.handlePlayBtnClick();
          this.resumeOnWordPlayEnd = false;
        }
      }
    });

    this.playWordQueue.push(howl);

    if (this.playWordQueue.length == 1) {
      // don't play this word if system is playing another word.
      // we'll play next word using howler's onend callback
      howl.play();
    }

    return howl;
  }

  seekToWord(wordPosition) {
    let segments = this.audioData[this.track.currentVerse].segments || [];
    let wordSegment = segments[wordPosition];

    if (wordSegment) {
    }
  }

  play(verse) {
    // stop previous track
    if (this.isPlaying()) {
      this.track.howl.stop();
    }

    verse = verse || this.currentVerse;

    // enable progress bar if disabled
    this.progressBar.disabled = false;
    this.progressBar.value = this.progressBar.value || 0;

    this.chapter.removeSegmentHighlight();
    this.currentVerse = verse;

    // play
    if (this.preloadTrack[verse]) {
      this.track = this.preloadTrack[verse];
      this.track.howl.play();
    } else {
      this.loading();
      this.track = this.createHowl(verse, true);
    }
  }

  handlePlayBtnClick() {
    if (this.isPlaying()) {
      this.track.howl.pause();
    } else {
      this.play(this.currentVerse);
    }
  }

  handlePauseBtnClick() {
    if (this.isPlaying()) this.track.howl.pause();
  }

  handleNextBtnClick() {
    const next = this.getNextTrackVerse();
    if (next) this.play(next);
  }

  handlePreviousBtnClick() {
    const previous = this.getPreviousTrackVerse();

    if (previous) this.play(previous);
  }

  bindPlayerEvents() {
    // player controls
    $("#player .play-btn").on("click", event => {
      event.preventDefault();
      this.handlePlayBtnClick();
    });

    $("#player .previous-btn").on("click", event => {
      event.preventDefault();
      this.handlePreviousBtnClick();
    });

    $("#player .next-btn").on("click", event => {
      event.preventDefault();
      this.handleNextBtnClick();
    });

    // slider
    this.onProgressChange = e => this.handleProgressBarChange(e.target.value);
    this.progressBar.addEventListener("change", this.onProgressChange);
  }

  handleProgressBarChange(value) {
    // duration data for some audio file is missing,
    // let howler calculate duration for such files
    let duration = this.track.duration || this.track.howl.duration();

    let time = (duration / 100) * value;
    this.track.howl.seek(time);
  }

  jumpToVerse(verse) {
    // this method is called when user:
    // select ayah from verse dropdown
    // from play range dropdown

    let wasPlaying = this.isPlaying();
    if ($(`#verses .verse[data-verse-number=${verse}]`).length > 0) {
      this.scrollToVerse(verse);

      if (wasPlaying) {
        this.play(verse);
      }

      return Promise.resolve([]);
    } else {
      // this verse isn't present in the page. Load it
      let controller = document.getElementById("chapter-tabs");

      controller.chapter.loadVerses(verse).then(() => {
        this.updateVerses();
        this.scrollToVerse(verse);

        if (wasPlaying) {
          this.play(verse);
        }

        return Promise.resolve([]);
      });
    }
  }

  updatePlayerControls() {
    if (this.isPlaying()) this.setPlayCtrls("pause");
    else this.setPlayCtrls("play");
  }

  loading() {
    this.setPlayCtrls("loading");
  }

  setPlayCtrls(type) {
    let p = $("#player .play-btn");
    p.removeClass("fa-play-circle fa-pause-circle fa-spinner animate-spin");

    let thisVerse = $(
      `#verses .verse[data-verse-number=${this.currentVerse}]`
    ).find(".play .fa");

    thisVerse.removeClass(
      "fa-play-circle fa-pause-circle fa-spinner animate-spin"
    );

    if ("loading" == type) {
      p.addClass("fa-spinner animate-spin");
      thisVerse.addClass("fa-spinner animate-spin");
    } else {
      p.addClass(`fa-${type}-circle`);
      thisVerse.addClass(`fa-${type}-circle`);
    }
  }

  pad(n, width) {
    n = n + "";

    if (n.length >= width) return n;
    else return new Array(width - n.length + 1).join("0") + n;
  }

  formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds - minutes * 60);
    return this.pad(minutes, 2) + ":" + this.pad(seconds, 2);
  }

  preloadNextVerse() {
    let next = this.getNextTrackVerse();

    if (next) {
      this.createHowl(next, false);

      $(".next-btn").removeAttr("disabled");
    } else {
      $(".next-btn").attr("disabled", "disabled");
    }
  }

  onPlay() {
    // highlight current ayah
    this.chapter.highlightVerse(this.currentVerse);

    //scroll to current ayah if setting is on
    if (this.config.autoScroll) {
      this.chapter.scrollToVerse(this.currentVerse);
    }

    this.setProgressBarInterval();
    this.setSegmentInterval();

    this.preloadNextVerse();
  }

  getNextTrackVerse() {
    return this.currentVerse < this.lastVerse ? this.currentVerse + 1 : null;
  }

  getPreviousTrackVerse() {
    return this.currentVerse > this.firstVerse ? this.currentVerse - 1 : null;
  }

  removeProgressInterval() {
    clearInterval(this.playerProgressInterval);
  }

  setProgressBarInterval() {
    clearInterval(this.playerProgressInterval);
    const totalDuration = this.track.duration || this.track.howl.duration();

    $("#player .timer")
      .removeClass("d-none")
      .text("00:00");

    $("#player .total-time")
      .removeClass("d-none")
      .text(this.formatTime(totalDuration));

    this.playerProgressInterval = setInterval(() => {
      let currentTime = this.track.howl.seek();
      let progressPercentage =
        Math.floor((currentTime / totalDuration) * 1000) / 10;

      this.progressBar.value = progressPercentage;

      $("#player .timer").text(this.formatTime(currentTime));
    }, 500);
  }

  removePlayerListeners() {
    this.chapter.removeHighlighting();

    this.removeProgressInterval();
    this.updatePlayerControls();
  }

  onVerseEnd() {
    this.progressBar.value = 0;

    if (this.config.repeat.enabled) {
      "single" == this.config.repeat.type
        ? this.repeatSingleVerse()
        : this.repeatRangeVerses();
    } else {
      // simply play next ayah
      this.handleNextBtnClick();
    }
  }

  repeatSingleVerse() {
    if (this.config.repeat.iteration <= this.config.repeat.count) {
      //  play the same verse
      this.config.repeat.iteration++;
      this.play();
      console.log("repeating current verse", this.currentVerse);
    } else {
      this.config.repeat.iteration = 1;

      this.handleNextBtnClick();
    }
  }

  repeatRangeVerses() {
    let repeatSetting = this.config.repeat;

    if (this.currentVerse == repeatSetting.to) {
      if (repeatSetting.iteration <= repeatSetting.count) {
        this.play(repeatSetting.from);
        repeatSetting.iteration++;
      } else {
        // play next ayah or stop here?
        // we've played the selected range
        this.currentVerse = repeatSetting.from;
      }
    } else {
      this.handleNextBtnClick();
    }
  }

  onSeek() {
    if (this.isPlaying()) {
      this.setProgressBarInterval();
      // due to howl bug, run @setAlignHighlight() after 100ms, this reduced occurance of bug
      // note: this won't affect align accuracy
      setTimeout(() => {
        this.setSegmentInterval();
      }, 100);
    } else this.setSegmentInterval();
  }

  setSegmentInterval() {
    this.chapter.setSegmentInterval(
      this.track.howl.seek(),
      this.preloadTrack[this.currentVerse].segments
    );
  }

  createHowl(verse, autoplay) {
    if (this.preloadTrack[verse]) {
      // howl is already created
      return this.preloadTrack[verse];
    }

    let audioData = this.audioData[verse];
    let audioPath = this.buildAudioUrl(audioData.path);

    let howl = new Howl({
      src: [audioPath],
      html5: USE_HTML5,
      autoplay: autoplay,
      onloaderror: () => {
        // when audio is failed to load.
      },
      onplayerror: () => {
        this.updatePlayerControls();

        //Fires when the sound is unable to play
        this.track.howl.once("unlock", () => {
          this.track.howl.play();
        });
      },
      onplay: () => {
        this.updatePlayerControls();

        this.onPlay();
      },
      onpause: () => {
        this.updatePlayerControls();

        this.removePlayerListeners();
      },
      onstop: () => {
        this.updatePlayerControls();

        this.removePlayerListeners();
      },
      onseek: () => {
        this.removePlayerListeners();

        this.onSeek();
      },
      onend: () => {
        this.updatePlayerControls();

        this.removePlayerListeners();
        this.onVerseEnd();
      }
    });

    this.preloadTrack[verse] = {
      howl: howl,
      segments: audioData.segments,
      verse: verse
    };

    return this.preloadTrack[verse];
  }

  buildAudioUrl(path) {
    if (!/(http)?s?:?\/\//.test(path)) {
      path = AUDIO_CDN + path;
    }

    return path;
  }

  updateVerses() {
    return this.fetchAudioData(this.firstVerse, this.lastVerse);
  }

  setRecitation(recitationId) {
    this.config.recitation = recitationId;
    this.settings.set("recitation", recitationId);
    this.preloadTrack = {};
    this.audioData = {};

    this.fetchAudioData(this.firstVerse, this.lastVerse).then(() => {
      let wasPlaying = this.isPlaying();
      wasPlaying && this.handlePauseBtnClick();

      wasPlaying && this.play(this.currentVerse);
    });
  }

  fetchAudioData(firstVerse, lastVerse) {
    let audioData = this.audioData;
    let requests = [];

    let firstPage = Math.floor((firstVerse - 1) / 10);
    let lastPage = Math.floor((lastVerse - 1) / 10);

    //TODO: We can detect page number without loop. For ayah 1-10 page is 1, for 11-20 page is 2
    for (let page = firstPage, end = lastPage + 1; page < end; page++) {
      // continue if data exist
      if (audioData.hasOwnProperty(page * 10 + 1)) {
        continue;
      }

      // get page
      let audioRequestQuery = {
        chapter: this.chapter.chapterId(),
        recitation: this.config.recitation,
        page
      };

      let callback = data => {
        let enteries = Object.entries(data);

        for (const [key, file] of enteries) {
          audioData[key] = {
            path: file.audio,
            duration: file.duration,
            segments: file.segments
          };
        }
      };

      let audioRequest = fetch(`/audio?${$.param(audioRequestQuery)}`)
        .then(response => response.json())
        .then(verses => callback(verses))
        .catch(error => callback({}));

      requests.push(audioRequest);
    }

    return Promise.all(requests);
  }
}
