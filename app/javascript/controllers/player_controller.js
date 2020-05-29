// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="player">
// </div>

import { Controller } from "stimulus";
import { Howl, Howler } from "howler";

const AUDIO_CDN = "https://audio.qurancdn.com/";
//"https://download.quranicaudio.com/";
// TODO: should set to false to use web audio instead, but that requires CORS
const USE_HTML5 = false;

export default class extends Controller {
  connect() {
    this.element[this.identifier] = this;
    this.settings = document.body.setting;

    let el = this.element;
    let container = $("#verses");
    let verseDomList = container.find(".verse");

    //TODO: eventually, we'll move word play to separate controller.
    // maybe one move player to utility, and have word and ayah player controller.

    this.playWordQueue = [];
    this.resumeOnWordPlayEnd = false;

    this.config = {
      chapter: container.data("chapterId"),
      totalVerses: container.data("totalVerses"),
      firstVerse: verseDomList.first().data("verseNumber"),
      lastVerse: verseDomList.last().data("verseNumber"),
      currentVerse: null,
      autoScroll: this.settings.get("autoScroll"),
      recitation: this.settings.get("recitation"),
      showTooltip: true,
      repeat: {
        enabled: this.settings.get("repeatEnabled"),
        verse: verseDomList.first().data("verseNumber"),
        type: this.settings.get("repeatType") || "single", // or range
        count: this.settings.get("repeatCount"), // number of time to play each ayah
        from: this.settings.get("repeatFrom"),
        to: this.settings.get("repeatTo"),
        iteration: 1
      }
    };

    this.preloadTrack = {};
    this.segmentTimers = [];
    this.track = {};
    this.audioData = {};
    this.playerProgressInterval = null;

    this.buildPlayer();
    this.populatePlayerVerses();
    container.on("items:added", () => {
      // this event is triggered from infinite scrolling controller
      // new ayah are added to page. Refresh the play first and last ayah
      this.updateVerses();
    });

    setTimeout(() => this.scrollToVerse(this.config.firstVerse), 100);
  }

  disconnect() {
    if (this.isPlaying()) this.track.howl.stop();

    //unload all tracks
    Howler.unload();

    this.progressBar.slider("destroy");

    if (this.verseDropdown.data("select2"))
      this.verseDropdown.data("select2").destroy();

    if (this.chapterDropdown.data("select2"))
      this.chapterDropdown.data("select2").destroy();
  }

  isPlaying() {
    return this.track.howl && this.track.howl.playing();
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
      placement: "top",
      container: "body",
      boundary: "window"
    });

    if (this.config.repeat.enabled) {
      $("#player .repeat-btn .fa").addClass("text-primary");
    }

    // activate the repeat tabs
    $(`#repeat-popover-pills-${this.config.repeat.type}-tab`).trigger("click");

    // auto scroll component
    this.scrollButton = $(".auto-scroll-btn");
    this.scrollButton.tooltip({ placement: "top", boundary: "window" });

    if (this.config.autoScroll) {
      this.scrollButton.addClass("active");
    }

    this.scrollButton.on("click", event => {
      event.preventDefault();
      this.scrollButton.toggleClass("active");
      this.config.autoScroll = !this.config.autoScroll;

      if (this.config.autoScroll) {
        this.scrollToCurrentVerse();
      }

      this.settings.saveSettings();
    });

    this.repeatButton = $(".repeat-btn");
    if (this.config.repeat.enabled) {
      this.repeatButton.addClass("active");
      $("#repeat-popover-switch").attr("checked", true);
      $(".repeat-popover-content .overlay").toggle(false);
    }

    this.updateVerses().then(() => {
      // set first track to play
      that.track.currentVerse = that.firstVerse;

      // preload howl for first track
      that.preloadTrack[that.firstVerse] = {
        verse: that.firstVerse,
        howl: that.createHowl(that.firstVerse, false)
      };

      that.bindPlayerEvents();
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
    this.progressBar.slider("enable");
    this.progressBar.slider("setValue", 0);

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
    this.play(this.track.currentVerse);
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

    // slider
    this.progressBar.slider("on", "change", value => {
      this.handleProgressBarChange(value);
    });

    const hidePopover = e => {
      if ($(e.target).closest(".popover").length == 0)
        this.repeatButton.popover("hide");
    };

    // hide popover when clicked outside
    this.repeatButton.on("shown.bs.popover", () =>
      $(document).on("click", hidePopover)
    );

    this.repeatButton.on("hide.bs.popover", () => {
      $(document).off("click", hidePopover);

      this.config.repeat.count = Number(
        $(`#repeat-popover-${this.config.repeat.type}-repeat`).val()
      );

      //  set repeat range
      this.config.repeat.from = Number($("#repeat-popover-range-from").val());
      this.config.repeat.to = Number($("#repeat-popover-range-to").val());
      this.config.repeat.verse = Number($("#repeat-popover-single").val());

      // reset repeat iteration.
      this.config.repeat.iteration = 1;

      if (this.config.repeat.enabled) {
        let verse =
          "single" == this.config.repeat.type
            ? this.config.repeat.verse
            : this.config.repeat.from;
        this.jumpToVerse(Number(verse));
      }

      this.settings.set("repeatType", this.config.repeat.type);
      this.settings.set("repeatEnabled", this.config.repeat.enabled);
      this.settings.set("repeatCount", this.config.repeat.count);
      this.settings.set("repeatFrom", this.config.repeat.from);
      this.settings.set("repeatTo", this.config.repeat.to);
    });

    $("#repeat-popover-switch").change(event => {
      let checked = $(event.target).is(":checked");
      $(".repeat-popover-content .overlay").toggle(!checked);
      this.repeatButton.toggleClass("active", checked);

      this.config.repeat.enabled = checked;
    });

    $("#repeat-popover-pills-single-tab").on("show.bs.tab", () => {
      this.config.repeat.type = "single";
    });

    $("#repeat-popover-pills-range-tab").on("show.bs.tab", () => {
      this.config.repeat.type = "range";
    });
  }

  populatePlayerVerses() {
    let total = $("#verses").data("total-verses") + 1;
    let verses = [];
    //let dropDownVerses = [];
    //let chapter = $("#verses").data("chapter-id");
    let i18nLabel = $("#player-verse-dropdown").data("i18n-label");

    let verseSelect2Data = [];

    for (let verse = 1, end = total; verse < end; verse++) {
      verses.push(`<option value='${verse}'>${verse}</option>`);

      /*  dropDownVerses.push(
                              `<div class='dropdown-item'  data-verse='${verse}'> <a href='/${chapter}/${verse}'>${i18nLabel} ${verse}</a></div>`
                          );*/
      verseSelect2Data.push({
        id: verse,
        text: `${i18nLabel} ${verse}`
      });
    }

    this.verseDropdown = $("#player-verse-dropdown").select2({
      data: verseSelect2Data,
      width: "150px"
    });

    this.verseDropdown.on("select2:select", e => {
      this.jumpToVerse(Number(e.currentTarget.value));
    });

    const surahNameTemplate = surah => {
      if (surah.loading) return surah.text;
      const data = surah.element.dataset;
      return `<div class='row select2-result'>
                <div class="col-2">${surah.element.value}</div>
                <div class="col-7">
                  ${data.nameSimple}
                </div>
                <div class="col-3">
                  ${data.arabic}
                </div>
                <div class="col-10 offset-2">
                  ${data.translatedName}
                </div>
              </div>`;
    };

    const matchChapterName = (params, data) => {
      const query = $.trim(params.term).toLowerCase();
      if (!query) return data;
      let translatedName = data.element.getAttribute("data-translated-name");
      let arabicName = data.element.getAttribute("data-arabic");
      let simpleName = data.element.text;

      if (simpleName.toLowerCase().indexOf(query) > -1) {
        return data;
      }
      if (translatedName.toLowerCase().indexOf(query) > -1) {
        return data;
      }
      if (arabicName.indexOf(query) > -1) {
        return data;
      }
      return null;
    };

    this.chapterDropdown = $("#chapter-select").select2({
      width: "250px",
      templateResult: surahNameTemplate,
      matcher: matchChapterName,
      escapeMarkup: text => text
    });

    this.chapterDropdown.on("select2:select", e => {
      Turbolinks.visit(`/${e.currentTarget.value}`);
    });

    verses = verses.join("");

    $("#repeat-popover-single").html(verses);
    $("#repeat-popover-range-from").html(verses);
    $("#repeat-popover-range-to").html(verses);
    // $("#player-verse-dropdown").html(dropDownVerses.join(''));

    const selectConfig = {
      width: "100px",
      dropdownParent: $(".repeat-popover-content")
    };

    $("#repeat-popover-single").select2({
      width: "100%",
      dropdownParent: $(".repeat-popover-content")
    });

    $("#repeat-popover-range-from").select2(selectConfig);
    $("#repeat-popover-range-to").select2(selectConfig);
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
      let controller = document.getElementById("verses");

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
    $("#repeat-popover-range-from")
      .val(verse)
      .trigger("change");
    $("#repeat-popover-range-to")
      .val(verse)
      .trigger("change");
    $("#repeat-popover-single")
      .val(verse)
      .trigger("change");

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
    let p = $("#player .play-ctrls");
    p.removeClass("play pause loading fa-spinner1 animate-spin");

    let thisVerse = $(
      `#verses .verse[data-verse-number=${this.track.currentVerse}]`
    ).find(".play .fa");

    thisVerse.removeClass(
      "fa-play-solid fa-pause-solid fa-spinner1 animate-spin"
    );

    if ("loading" == type) {
      p.addClass("fa-spinner1 animate-spin");
      thisVerse.addClass("fa-spinner1 animate-spin");
    } else {
      p.addClass(type);
      thisVerse.addClass(`fa-${type}-solid`);
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

    this.verseDropdown.val(this.track.currentVerse).trigger("change");
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
      "verse-highlight"
    );
  }

  removeVerseHighlight() {
    $(".verse-highlight").removeClass("verse-highlight");
  }

  removeSegmentHighlight() {
    if (this.config.showTooltip) $(".word-highlight").tooltip("hide");
    $(".word-highlight").removeClass("word-highlight");
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

  updateVerses() {
    let verses = $("#verses .verse");

    this.firstVerse = verses.first().data("verse-number");
    this.lastVerse = verses.last().data("verse-number");

    return this.fetchAudioData(this.firstVerse, this.lastVerse);
  }

  setRecitation(recitationId) {
    this.config.recitation = recitationId;
    this.settings.set("recitation", recitationId);
    this.preloadTrack = {};
    this.audioData = {};

    this.updateVerses().then(() => {
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
