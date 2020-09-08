// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import { Controller } from "stimulus";
import { Howl, Howler } from "howler";
import Slider from "bootstrap-slider";
import Tooltip from "bootstrap/js/src/tooltip";

const AUDIO_CDN = "https://audio.qurancdn.com/";
//"https://download.quranicaudio.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = false;

export default class extends Controller {
  connect() {
    this.element[this.identifier] = this;
    this.settings = document.body.setting;

    this.playWordQueue = [];
    this.resumeOnWordPlayEnd = false;
    this.preloadTrack = {};
    this.segmentTimers = [];
    this.track = {};
    this.audioData = {};
    this.playerProgressInterval = null;

    this.config = {
      chapter: null,
      firstVerse: null,
      lastVerse: null,
      currentVerse: null,
      autoScroll: this.settings.get("autoScroll"),
      recitation: this.settings.get("recitation"),
      showTooltip: false,
      repeat: {
        verse: null,
        enabled: this.settings.get("repeatEnabled"),
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

  init(chapter, firstVerse, lastVerse) {
    this.chapter = chapter;
    this.config.chapter = chapter.chapterId()
    this.config.firstVerse = firstVerse
    this.config.lastVerse = lastVerse

    const that = this;
    this.updateVerses().then(() => {
      // set first ayah track to play, if player isn't already playing any ayah
      that.track.currentVerse ||= that.firstVerse;

      // preload howl for first track
      that.preloadTrack[that.track.currentVerse] = {
        verse: that.firstVerse,
        howl: that.createHowl(that.firstVerse, false)
      };
    });

    setTimeout(() => this.scrollToVerse(this.config.firstVerse), 100);
  }

  disconnect() {
    if (this.isPlaying()) this.track.howl.stop();

    //unload all tracks
    Howler.unload();
    this.progressBar.destroy();
  }

  isPlaying() {
    return this.track.howl && this.track.howl.playing();
  }

  buildPlayer() {
    let that = this;

    this.progressBar = new Slider("#player #player-bar", {
      min: 0,
      max: 100,
      step: 0.1,
      value: 0,
      enabled: false
    });

    // auto scroll component
    this.scrollButton = this.element.querySelector("#auto-scroll-btn");

    new Tooltip(this.scrollButton, {
      placement: "top",
      boundary: "window",
      html: true,
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
        this.scrollToCurrentVerse();
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

    verse = verse || this.track.currentVerse;

    // enable progress bar if disabled
    this.progressBar.enable();
    this.progressBar.setValue(0);

    this.removeSegmentHighlight();
    this.track.currentVerse = verse;

    // play
    if (this.preloadTrack[verse]) {
      this.track.howl = this.preloadTrack[verse].howl;
      this.track.howl.play();
    } else {
      this.loading();
      this.track.howl = this.createHowl(verse, true);
    }
  }

  handlePlayBtnClick() {
    if (this.isPlaying()) {
      this.track.howl.pause();
    } else {
      this.play(this.track.currentVerse);
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
    this.progressBar.on("change", value => {
      this.handleProgressBarChange(value);
    });
  }

  handleProgressBarChange(value) {
    let time = (this.track.howl.duration() / 100) * value.newValue;
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

      const scrollLength = verseTopOffset - (headerHeight + 50);
      const scrollTime = Math.min(500, scrollLength * 10);

      if (bottomOffsetCheck || topOffsetCheck) {
        $("html, body")
          .stop(true, true)
          .animate(
            {
              scrollTop: scrollLength
            },
            scrollTime
          );
      }
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
      `#verses .verse[data-verse-number=${this.track.currentVerse}]`
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

  setProgressBarInterval() {
    clearInterval(this.playerProgressInterval);
    const totalDuration = this.track.howl.duration();

    $("#player .total-time")
      .removeClass("d-none")
      .text(this.formatTime(totalDuration));

    this.playerProgressInterval = setInterval(() => {
      let currentTime = this.track.howl.seek();
      let progressPercentage =
        Math.floor((currentTime / totalDuration) * 1000) / 10;

      this.progressBar.setValue(progressPercentage);

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
      words.eq(word - 1).addClass("highlight");
      if (this.config.showTooltip) words.eq(word - 1).tooltip("show");
    }
  }

  removeProgressInterval() {
    clearInterval(this.playerProgressInterval);
  }

  preloadNextVerse() {
    let next = this.getNextTrackVerse();

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
    // this.verseDropdown.val(this.track.currentVerse).trigger("change");
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
    this.progressBar.setValue(0);

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
    if (this.config.repeat.iteration < this.config.repeat.count) {
      //  play the same verse
      this.config.repeat.iteration++;
      this.play();
      console.log("repating current verse", this.track.currentVerse);
    } else {
      this.config.repeat.iteration = 1;

      this.handleNextBtnClick();
    }
  }

  repeatRangeVerses() {
    let repeatSetting = this.config.repeat;

    if (this.track.currentVerse == repeatSetting.to) {
      // current itration is finished
      if (repeatSetting.iteration < repeatSetting.count) {
        console.log(
          "repeating range, ",
          repeatSetting.iteration,
          " count",
          repeatSetting.count
        );
        this.play(repeatSetting.from);
        repeatSetting.iteration++;
      } else {
        // play next ayah or stop here?
        // we've played the selected range
        this.track.currentVerse = repeatSetting.from;
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
    } else this.setSegmentInterval(true);
  }

  highlightCurrentVerse() {
    this.removeVerseHighlight();
    $(`#verses .verse[data-verse-number=${this.track.currentVerse}]`).addClass(
      "highlight"
    );
  }

  removeVerseHighlight() {
    $(".verse.highlight").removeClass("highlight");
  }

  removeSegmentHighlight() {
    if (this.config.showTooltip) $(".highlight").tooltip("hide");
    $(".word.highlight").removeClass("highlight");
  }

  createHowl(verse, autoplay) {
    return new Howl({
      src: [this.audioData[verse].audio],
      html5: USE_HTML5,
      autoplay: autoplay,
      onloaderror: () => {
        // when audio is failed to load.
      },
      onplayerror: () => {
        //Fires when the sound is unable to play
        this.updatePlayerControls();

        this.track.howl.once("unlock", () => {
          this.track.howl.play();
        });
      },
      onplay: () => {
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

  changeVersesContainer(container) {
    this.container = $(container);
  }

  updateVerses() {
    let verses = $(".tab-pane.show .verses");

    this.firstVerse = verses.first().data("verse-number");
    this.lastVerse = verses.last().data("verse-number");

    return this.fetchAudioData(this.firstVerse, this.lastVerse);
  }

  setRecitation(recitationId) {
    this.config.recitation = recitationId;
    this.settings.set("recitation", recitationId);
    this.preloadTrack = {};
    this.audioData = {};

    this.this.fetchAudioData(this.firstVerse, this.lastVerse).then(() => {
      // set first track to play
      // clear the loaded tracks

      let wasPlaying = this.isPlaying();
      wasPlaying && this.handlePauseBtnClick();
      this.track.howl = null;

      wasPlaying && this.play(this.track.currentVerse);
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
