// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import { Controller } from "stimulus";
import { Howl, Howler } from "howler";

const AUDIO_CDN = "https://download.quranicaudio.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = true;

export default class extends Controller {
  connect() {
    this.element[this.identifier] = this;

    let el = this.element;
    let setting = document.body.setting;
    let container = $("#verses");
    let verseDomList = container.find(".verse");

    this.config = {
      chapter: container.data("chapterId"),
      totalVerses: container.data("totalVerses"),
      firstVerse: verseDomList.first().data("verseNumber"),
      lastVerse: verseDomList.last().data("verseNumber"),
      currentVerse: null,
      autoScroll: setting.get("autoScroll"),
      repeatIteration: setting.get("repeatIteration"), // how many time player should repeating a range setting
      recitation: setting.get("recitation"),
      repeat: {
        enabled: setting.get("repeatEnabled"),
        type: setting.get("repeatType"), // or range
        count: setting.get("repeatCount") // number of time to play each ayah
      }
    };

    this.preloadTrack = {};
    this.segmentTimers = [];
    this.track = {};
    this.audioData = {};
    this.playerProgressInterval = null;

    this.buildPlayer();
  }

  disconnect() {
    if (this.track.howl) this.track.howl.stop();

    //unload all tracks
    Howler.unload();
  }

  buildPlayer() {
    let that = this;
    this.progressBar = $("#player #player-bar").slider({
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      enabled: false
    });

    //repeat popover
    $("#player .repeat-btn").popover({
      title: $("#player .repeat-popover-title"),
      content: $("#player .repeat-popover-content"),
      html: true,
      placement: "top"
    });

    if (this.config.repeat.enabled) {
      $("#player .repeat-btn .fa").addClass("text-primary");
    }

    // auto scroll component
    this.scrollButton = $(".auto-scroll-btn");
    this.scrollButton.tooltip();
    this.scrollButton.on("click", () => {
      this.scrollButton.toggleClass("active");
      this.config.autoScroll = !this.config.autoScroll;

      if (this.config.autoScroll) {
        this.scrollToCurrentVerse();
      }
    });

    this.updateVerses().then(() => {
      // set first track to play
      that.track.currentVerse = that.firstVerse;

      // preload howl for first track
      that.preloadTrack[that.firstVerse] = {
        verse: that.firstVerse,
        howl: that.createHowl(that.firstVerse, false)
      };

      that.bindPlayerEvents();
      // # set repeat range
      that.config.repeat.from = Number($("#repeat-popover-range-from").val());
      that.config.repeat.to = Number($("#repeat-popover-range-to").val());
    });
  }

  play(verse) {
    // stop previous track
    if (this.track.howl && this.track.howl.playing()) {
      this.track.howl.stop();
    }

    verse = verse || this.track.currentVerse;

    // enable progress bar if disabled
    this.progressBar.slider("enable");
    this.progressBar.slider("setValue", 0);

    this.removeSegmentHighlight();
    this.track.currentVerse = verse;

    // play
    if (this.preloadTrack[verse]) {
      this.track.howl = this.preloadTrack[verse].howl;
      this.track.howl.play();
    } else this.track.howl = this.createHowl(verse, true);
  }

  handlePlayBtnClick() {
    this.play(this.track.currentVerse);
  }

  handlePauseBtnClick() {
    if (this.track.howl && this.track.howl.playing()) this.track.howl.pause();
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
    // unload the player when user navigate
    //$(document).one 'turbolinks:visit', @unload

    // player controls
    $("#player .play-btn").on("click", event => {
      event.preventDefault();
      this.handlePlayBtnClick();
    });

    $("#player .pause-btn").on("click", event => {
      event.preventDefault();
      this.handlePauseBtnClick();
    });

    $("#player .previous-btn").on("click", event => {
      event.preventDefault();
      this.handlePreviousBtnClick();
    });

    $("#player .next-btn").on("click", event => {
      event.preventDefault();
      this.handleNextBtnClick();
    });

    $("#player .auto-scroll-btn").on("click", event => {
      event.preventDefault();
      this.handleScrollBtnClick();
    });

    // select a verse from drop down
    $("#player .dropdown-verse .dropdown-item").on("click", event => {
      this.handleDropdownVerseClick();
    });

    // slider
    this.progressBar.slider("on", "change", value => {
      this.handleProgressBarChange(value);
    });
  }

  handleProgressBarChange(value) {
    let time = (this.track.howl.duration() / 100) * value.newValue;
    this.track.howl.seek(time);
  }

  addVerse(verse) {}

  scrollToCurrentVerse() {
    if (this.track.currentVerse) {
      this.scrollToVerse(this.track.currentVerse);
    }
  }

  scrollToVerse(verse) {
    let verseElement = $(`#verses .verse[data-verse-number=${verse}]`);

    if (verseElement.length > 0) {
      let verseTopOffset = verseElement.offset().top;
      let verseHeight = verseElement.outerHeight();
      let currentScroll = $(window).scrollTop();
      let windowHeight = window.innerHeight;
      let headerHeight =
        $("header").outerHeight() + $(".surah-actions").outerHeight();
      let playerHeight = $("#player").outerHeight();

      // scroll if there isn't a space to appear completely
      let bottomOffsetCheck =
        verseTopOffset + verseHeight >
        currentScroll + windowHeight - playerHeight;
      let topOffsetCheck = verseTopOffset < currentScroll + headerHeight;

      if (bottomOffsetCheck || topOffsetCheck) {
        $("html, body")
          .stop(true, true)
          .animate(
            {
              scrollTop: verseTopOffset - headerHeight
            },
            500
          );
      }
    }
  }

  updatePlayerControls() {
    if (this.track.howl && this.track.howl.playing())
      this.setPlayCtrls("pause");
    else this.setPlayCtrls("play");
  }

  setPlayCtrls(type) {
    $("#player .play-ctrls")
      .removeClass("play pause loading")
      .addClass(type);

    let thisVerse = $(
      `#verses .verse[data-verse-number=${this.track.currentVerse}]`
    );
    thisVerse
      .find(".play .fa")
      .removeClass("fa-play-solid fa-pause-solid")
      .addClass(`fa-${type}-solid`);
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

  setProgressBarInterval() {
    clearInterval(this.playerProgressInterval);

    this.playerProgressInterval = setInterval(() => {
      let currentTime = this.track.howl.seek();
      let progressPercentage =
        Math.floor((currentTime / this.track.howl.duration()) * 1000) / 10;
      this.progressBar.slider("setValue", progressPercentage);

      $("#player .timer").text(this.formatTime(currentTime));
    }, 500);
  }

  removeSegmentTimers() {
    if (this.segmentTimers.length > 0) {
      for (let alignTimer of this.segmentTimers) {
        clearTimeout(alignTimer);
      }
      return (this.segmentTimers = []);
    }
  }

  setSegmentInterval(currentOnly) {
    this.removeSegmentTimers();

    let segments = this.audioData[this.track.currentVerse].segments || [];
    let seek = this.track.howl.seek();

    if (typeof seek != "number") {
      this.removeSegmentHighlight();
      console.error("howl bug: howl.seek() returned object instead of number");
    }

    let currentTime = seek * 1000;

    $.each(segments, (index, segment) => {
      let startTime = parseInt(segment[2], 10);
      let endTime = parseInt(segment[3], 10);

      //continue if the segment is passed
      if (currentTime > endTime) return true;

      if (currentTime > startTime) {
        this.highlightSegment(segment[0], segment[1]);
      } else {
        let highlightAfter = startTime - currentTime;

        this.segmentTimers.push(
          setTimeout(() => {
            this.highlightSegment(segment[0], segment[1]);
          }, highlightAfter)
        );
      }
    });
  }

  highlightSegment(startIndex, endIndex) {
    //TODO: track highlighted words in memory and remove highlighting from them
    // DOm operation could be costly

    this.removeSegmentHighlight();

    const start = parseInt(startIndex, 10) + 1;
    const end = parseInt(endIndex, 10) + 1;
    const words = $(
      `#verses .verse[data-verse-number=${this.track.currentVerse}] .word`
    );

    for (let word = start, end1 = end; word < end1; word++) {
      words.eq(word - 1).addClass("word-highlight");
    }
  }

  removeProgressInterval() {
    clearInterval(this.playerProgressInterval);
  }

  preloadNextVerse() {
    let next = this.getNextTrackVerse();
    console.log("preloading next verse");

    if (next) {
      this.preloadTrack[next] = {
        verse: next,
        howl: this.createHowl(next, false)
      };

      $(".next-btn").removeAttr("disabled");
    } else {
      $(".next-btn").attr("disabled", "disabled");
    }
  }

  onPlay() {
    // set selected verse in the dropdown menu
    //@setMenuSelectedVerse()

    // highlight current ayah
    this.highlightCurrentVerse();

    //scroll to current ayah if setting is on
    if (this.config.autoScroll) this.scrollToCurrentVerse();

    this.setProgressBarInterval();
    this.setSegmentInterval();

    this.preloadNextVerse();
  }

  getNextTrackVerse() {
    return this.track.currentVerse < this.lastVerse
      ? this.track.currentVerse + 1
      : null;
  }

  getPreviousTrackVerse() {
    return this.track.currentVerse > this.firstVerse
      ? this.track.currentVerse - 1
      : null;
  }

  removePlayerListeners() {
    this.removeProgressInterval();
    this.removeVerseHighlight();
    this.removeSegmentHighlight();
    this.removeSegmentTimers();
    this.updatePlayerControls();
  }

  onVerseEnd() {
    this.progressBar.slider("setValue", 0);

    let nextTrackVerse = this.getNextTrackVerse();

    // Repeat or play next?

    if (this.config.repeat.enabled) {
    } else {
      // simply play next ayah
      this.play(nextTrackVerse);
    }
  }

  onSeek() {
    if (this.track.howl.playing())
      // due to howl bug, run @setAlignHighlight() after 100ms, this reduced occurance of bug
      // note: this won't affect align accuracy
      setTimeout(() => {
        this.setSegmentInterval();
      }, 100);
    else this.setSegmentInterval(true);
  }

  highlightCurrentVerse() {
    this.removeVerseHighlight();
    $(`#verses .verse[data-verse-number=${this.track.currentVerse}]`).addClass(
      "verse-highlight"
    );
  }

  removeVerseHighlight() {
    $(".verse-highlight").removeClass("verse-highlight");
  }

  removeSegmentHighlight() {
    $(".word-highlight").removeClass("word-highlight");
  }

  createHowl(verse, autoplay) {
    return new Howl({
      src: [this.audioData[verse].audio],
      html5: USE_HTML5,
      autoplay: autoplay,
      onplayerror: () => {},
      onplay: data => {
        this.updatePlayerControls();
        this.onPlay();
      },
      onpause: () => {
        this.removePlayerListeners();

        this.updatePlayerControls();
      },
      onstop: () => {
        this.removePlayerListeners();

        this.updatePlayerControls();
      },
      onseek: () => {
        this.removePlayerListeners();

        this.onSeek();
      },
      onend: () => {
        $("#player .timer").text("00:00");
        this.removePlayerListeners();

        this.onVerseEnd();
      }
    });
  }

  updateVerses() {
    let verses = $("#verses .verse");

    this.firstVerse = verses.first().data("verse-number");
    this.lastVerse = verses.last().data("verse-number");

    return this.fetchAudioData(this.firstVerse, this.lastVerse);
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
        chapter: this.config.chapter,
        recitation: this.config.recitation,
        page
      };

      let callback = data => {
        let enteries = Object.entries(data);

        for (const [key, val] of enteries) {
          if (!/(http)?s?:?\/\//.test(val.audio)) {
            val.audio = AUDIO_CDN + val.audio;
          }

          audioData[key] = val;
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
