// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import AudioController from "./audio_controller";
import Tooltip from "bootstrap/js/src/tooltip";

const USE_HTML5 = false;

export default class extends AudioController {
  connect() {
    super.connect();
    this.element.player = this;
    this.el = $(this.element);

    this.progressInterval = null;
    this.repeatCurrent = false;

    this.audioData = {};
    this.pauseSeconds = 0;

    this.chapter = null;
    this.firstVerse = null;
    this.lastVerse = null;
    this.currentVerse = null;

    this.playBtn = null;
    this.loadingBtn = null;

    this.loadSettings();
    this.buildPlayer();
    this.bindPlayerEvents();
  }

  loadSettings(currentVerse = null, lastVerse = null) {
    this.config = {
      autoScroll: this.getSetting("autoScroll"),
      recitation: this.getSetting("recitation"),
      showTooltip: false,
      repeat: {
        verse: null,
        type: this.getSetting("repeatType") || "single", // or range
        count: this.getSetting("repeatCount"), // number of time to play each ayah
        from: this.getSetting("repeatFrom"),
        to: this.getSetting("repeatTo"),
        currentIteration: 1
      }
    };

    this.pauseSeconds = 0;
    this.currentVerse = currentVerse;
    this.lastVerse = lastVerse;
  }

  updatePause(pauseSec) {
    this.pauseSeconds = pauseSec;
  }

  updateRepeatCount(count) {
    this.config.repeat.count = count;
  }

  updateRepeat(setting, repeatRange) {
    this.config.repeat = {
      enabled: setting.repeatEnabled,
      count: setting.repeatCount,
      type: setting.repeatType,
      verse: setting.repeatAyah,
      from: setting.repeatFrom,
      to: setting.repeatTo,
      currentIteration: 1
    };

    // Rest next ayah to play when user change the repeat setting
    // rollback to previously playing ayah if user has not set repeat start
    this.firstVerse = repeatRange.first;
    this.lastVerse = repeatRange.last;
    this.currentVerse = repeatRange.first;
    if (!!customSegments) {
      this.config.segmentPlayer = true;
      this.config.autoScroll = false;
      this.config.customSegments = customSegments;
      this.currentVerse = setting.repeatAyah;
    }
    this.updateVerses().then(() => {
      this.createHowl(this.currentVerse, this.config.segmentPlayer);
      if (this.isPlaying()) this.play(this.currentVerse);
    });
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
    });
  }

  disconnect() {
    if (this.isPlaying()) this.currentHowl.stop();

    //unload all tracks
    this.preloadTrack = {};
    this.audioData = {};

    Howler.unload();
    this.progressBar.removeEventListener("change", this.onProgressChanged);
    this.progressBar.disabled = true;
  }

  isPlaying() {
    if (this.currentHowl) {
      return this.currentHowl.playing()
    }

    return false;
  }

  isLoading() {
    if (this.currentHowl)
      return 'loaded' != this.currentHowl.state();

    return true;
  }

  buildPlayer() {
    this.progressBar = this.el.find("#player-range").get(0);
    this.progressBar.disabled = true;
    this.bindAutoScroll();
    this.bindRepeatCurrentAyah();
  }

  bindAutoScroll() {
    // auto scroll component
    const scrollButton = this.element.querySelector("#btn-scroll");
    let classList = scrollButton.classList;

    new Tooltip(scrollButton, {
      placement: "top",
      boundary: "window",
      html: true,
      sanitize: false,
      title: scrollButton.dataset.title
    });

    if (this.config.autoScroll) {
      classList.add("selected");
    }

    scrollButton.addEventListener("click", event => {
      event.preventDefault();
      this.config.autoScroll = !this.config.autoScroll;

      if (this.config.autoScroll) {
        classList.add("selected");
        this.chapter && this.chapter.scrollToVerse(this.currentVerse);
      } else {
        classList.remove("selected");
      }

      this.settings.saveSettings();
    });
  }

  bindRepeatCurrentAyah() {
    const repeatBtn = $("#player .icon-repeat")
    new Tooltip(repeatBtn[0], {
      placement: "top",
      boundary: "window",
      html: true,
      sanitize: false,
      title: repeatBtn.data('title')
    });

    repeatBtn.on("click", event => {
      event.preventDefault();
      this.repeatCurrent = !this.repeatCurrent;
      repeatBtn.toggleClass("selected");
    });
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
      this.currentHowl.pause();
    }
    verse = verse || this.currentVerse;

    // enable progress bar if disabled
    this.progressBar.disabled = false;
    this.progressBar.value = this.progressBar.value || 0;
    this.currentVerse = verse;

    this.loadTrack(this.currentVerse).then((track) => {
      this.currentTrack = track;
      track.howl.play()
    })
  }

  playCurrent() {
    this.play(this.currentVerse);
  }

  playVerse(verse) {
    // called outside of player
    if (this.isPlaying()) {
      this.currentHowl.stop();
      // stop event isn't working?
      this.setPlayerCtrls('play');
    }

    this.currentVerse = verse;
    this.playCurrent();
  }

  pauseCurrent() {
    if (this.isPlaying()) this.currentHowl.pause();
  }

  playNext() {
    this.config.repeat.currentIteration = 1;
    const next = this.getNextTrackVerse();
    if(next){
      this.loading();

      this.playVerse(next);
    }
  }

  playPrevious() {
    this.config.repeat.currentIteration = 1;
    const previous = this.getPreviousTrackVerse();

    if(previous){
      this.loading();

      this.playVerse(previous);
    }
  }

  bindPlayerEvents() {
    this.playBtn = this.el.find("#btn-play");
    this.pauseBtn = this.el.find("#btn-pause");
    this.loadingBtn = this.el.find("#btn-loading");

    this.previousBtn = this.el.find("#btn-previous");
    this.nextBtn = this.el.find("#btn-next");

    new Tooltip(this.loadingBtn.get(0), {
      placement: "top",
      boundary: "window",
      html: true,
      sanitize: false,
      title: this.loadingBtn.data('title')
    });

    // player controls
    this.playBtn.on("click", event => {
      event.preventDefault();
      this.playCurrent();
    });

    this.pauseBtn.on("click", event => {
      event.preventDefault();
      this.pauseCurrent();
    });

    this.previousBtn.on("click", event => {
      event.preventDefault();
      this.playPrevious();
    });

    this.nextBtn.on("click", event => {
      event.preventDefault();
      this.playNext();
    });

    // slider
    this.progressBar.addEventListener("change", e =>
      this.onProgressChanged(e.target.value)
    );
  }

  onProgressChanged(value) {
    // duration data for some audio file is missing,
    // let howler calculate duration for such files
    if (this.currentHowl) {
      let duration = this.currentHowl.duration();

      let time = (duration / 100) * value;
      this.currentHowl.seek(time);
    }
  }

  loading() {
    this.setPlayerCtrls("loading");
  }

  setPlayerCtrls(type) {
    let thisVerse = $(
      `.verse[data-verse-number=${this.currentVerse}]`
    ).find(".play .quran-icon");

    thisVerse.removeClass('icon-play1 icon-pause icon-loading');

    if ("play" == type) {
      this.playBtn.removeClass('d-none');
      this.loadingBtn.addClass('d-none');
      this.pauseBtn.addClass('d-none');
      thisVerse.addClass('icon-play1');
    } else if ("pause" == type) {
      this.playBtn.addClass('d-none');
      this.loadingBtn.addClass('d-none');
      this.pauseBtn.removeClass('d-none');
      thisVerse.addClass('icon-pause');
    } else {
      // loading
      this.playBtn.addClass('d-none');
      this.loadingBtn.removeClass('d-none');
      this.pauseBtn.addClass('d-none');
      thisVerse.addClass('icon-loading');
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
      this.loadTrack(next);

      this.nextBtn.removeAttr("disabled");
    } else {
      this.nextBtn.attr("disabled", "disabled");
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
    clearInterval(this.progressInterval);
  }

  setProgressBarInterval() {
    this.removeProgressInterval();
    const totalDuration = this.currentHowl.duration();

    $("#player .current-time")
      .removeClass("hidden")
      .text("00:00");

    $("#player .all-time")
      .removeClass("hidden")
      .text(this.formatTime(totalDuration));

    this.progressInterval = setInterval(() => {
      let currentTime = this.currentHowl.seek();
      let progressPercentage =
        Math.floor((currentTime / totalDuration) * 1000) / 10;

      this.progressBar.value = progressPercentage;
      document.getElementById("player-range").style.background =
        "linear-gradient(to right, #00acc2 0%, #00acc2 " +
        progressPercentage +
        "%, #fff " +
        progressPercentage +
        "%, white 100%)";
      $("#player .current-time").text(this.formatTime(currentTime));
    }, 500);
  }

  removePlayerListeners() {
    this.chapter.removeHighlighting();

    this.removeProgressInterval();
    this.setPlayerCtrls("play");
  }

  onVerseEnd() {
    if (this.config.segmentPlayer == false) {
      this.progressBar.value = 0;
    }

    if (this.pauseSeconds > 0) {
      setTimeout(() => this.onVerseEnded(), this.pauseSeconds * 1000);
    } else {
      this.onVerseEnded();
    }
  }

  onVerseEnded() {
    if (this.repeatCurrent) {
      this.repeatSingleVerse(0, 10000);
    } else if (this.config.repeat.enabled) {
      "single" == this.config.repeat.type
        ? this.repeatSingleVerse()
        : this.repeatRangeVerses();
    } else {
      this.playNext();
    }
  }

  repeatSingleVerse(
    currentIteration = this.config.repeat.currentIteration,
    count = this.config.repeat.count
  ) {
    if (currentIteration <= count) {
      //  play the same verse
      this.config.repeat.currentIteration++;
      this.play();
    } else {
      this.config.repeat.currentIteration = 1;
      if (this.config.segmentPlayer) {
        document
          .getElementById("segment-player")
          .segmentPlayer.resetPlayButton();
      } else {
        this.playNext();
      }
    }
  }

  repeatRangeVerses() {
    let repeatSetting = this.config.repeat;

    if (this.currentVerse == repeatSetting.to) {
      if (repeatSetting.currentIteration <= repeatSetting.count) {
        this.play(repeatSetting.from);
        repeatSetting.currentIteration++;
      } else {
        // play next ayah or stop here?
        // we've played the selected range
        this.currentVerse = repeatSetting.from;
      }
    } else {
      this.playNext();
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
      this.currentHowl.seek(),
      this.preloadTrack[this.currentVerse].segments,
      this.isPlaying()
    );
  }

  loadTrack(verse) {
    if (this.preloadTrack[verse]) {
      return Promise.resolve(this.preloadTrack[verse])
    } else {
      this.loading();
      return this.createHowl(verse);
    }
  }

  createHowl(verse) {
    return this.loadVerseAudio(verse).then(() => {
      let audio = this.audioData[verse];
      let audioPath = this.buildAudioUrl(audio.path);

      return this.loadHowler().then(() => {
        let howl = new Howl({
          src: [audioPath],
          html5: USE_HTML5,
          autoplay: false,
          onloaderror: () => {
            // when audio is failed to load.
          },
          onplayerror: () => {
            this.setPlayerCtrls("play");

            //Fires when the sound is unable to play
            this.currentHowl.once("unlock", () => {
              this.currentHowl.play();
            });
          },
          onplay: () => {
            this.onPlay();
            this.setPlayerCtrls("pause")
          },
          onpause: () => {
            this.setPlayerCtrls("play")

            this.removePlayerListeners();
          },
          onstop: () => {
            this.setPlayerCtrls("play")
            this.removePlayerListeners();
          },
          onseek: () => {
            this.removePlayerListeners();

            this.onSeek();
          },
          onend: () => {
            this.setPlayerCtrls("play");

            this.removePlayerListeners();
            this.onVerseEnd();
          }
        });

        this.preloadTrack[verse] = {
          howl: howl,
          segments: audio.segments,
          verse: verse
        };

        return Promise.resolve(this.preloadTrack[verse]);
      })
    })
  }

  updateVerses() {
    return this.fetchAudioData(this.firstVerse, this.lastVerse);
  }

  setRecitation(id) {
    const wasPlaying = this.isPlaying();

    this.config.recitation = id;
    this.preloadTrack = {};
    this.audioData = {};

    this.fetchAudioData(this.firstVerse, this.lastVerse).then(() => {
      if (wasPlaying) {
        this.pauseCurrent();
        this.play(this.currentVerse);
      }
    });
  }

  loadVerseAudio(verse) {
    if (this.audioData[verse]) {
      return Promise.resolve(this.audioData[verse])
    } else {
      verse = parseInt(verse)
      return this.fetchAudioData(verse, verse + 10)
    }
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

  get currentHowl() {
    if (this.currentTrack)
      return this.currentTrack.howl
  }
}
