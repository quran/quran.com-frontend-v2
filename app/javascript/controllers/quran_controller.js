import {Controller} from "stimulus";
import {getAyahIdFromKey} from "../utility/quran_utils";

export default class extends Controller {
  initialize() {
    this.pageLoader = null
    this.element.reader = this;

    // current verse
    this.currentVerse = {
      el: null,
      number: null,
      key: null,
      playing: false
    }

    this.bindAyahJump();

    // disable turbolink scroll position.
    // we want to scroll to first ayah on page load
    document.addEventListener("turbolinks:load", () => this.scrollToTop());
  }

  connect() {
    this.translationTab = document.querySelector(".translation-tab");
    this.readingTab = document.querySelector(".reading-tab");
    this.el = $(this.element);
    this.totalVerses = Number(this.el.data('totalVerses'));

    // using same controller for reading, and translation mode
    // active tab keep track of current active view
    this.activeTab = this.el.find(".tab-pane.show .verses");

    // intervals for each words of current ayah
    this.segmentTimers = [];

    this.bindTabs();

    setTimeout(() => {
      if (!this.isInfoMode()) {
        this.pageLoader = this.activeTab.closest('.verses-wrapper')[0].infinitePage
      }

      this.updatePlayer();
    }, 100);
  }

  bindTabs() {
    this.translationTab.addEventListener("tab.shown", e => this.tabChanged(e, 'translation'));
    this.readingTab.addEventListener("tab.shown", e => this.tabChanged(e, 'reading'));

    this.activeTab.on("items:added", () => {
      // new ayah are added to page.
      // Refresh the player's first and last ayah
      this.updatePlayer(true);
    });
  }

  tabChanged(e, mode) {
    this.pausePageLoader();

    const tab = e.currentTarget;
    const url = tab.href;
    let query = {};

    if ('info' != mode) {
      query.reading = 'reading' == mode
    }
    url && this.updateURLState(url, query);

    const pageVerses = $(tab.dataset.target).find(".verses-wrapper");
    this.activeTab = pageVerses.find(".verses");
    this.pageLoader = pageVerses.get(0).infinitePage;

    if (this.activeTab.find(".render-async").length > 0) {
      document.addEventListener('lazy:loaded', () => {
        // jump to ayah once lazy tab is loaded.
        this.jumpToCurrent();
        this.resumePageLoader();
      }, {once: true});
    } else {
      this.jumpToCurrent();
      this.resumePageLoader();
    }
  }

  isReadingMode() {
    return this.readingTab.classList.contains("tabs__item--selected");
  }

  isTranslationsMode() {
    return this.translationTab.classList.contains("tabs__item--selected");
  }

  bindAyahJump() {
    $("#verse-list")
      .find(".dropdown-item")
      .on("click", e => {
        e.preventDefault();
        const {verse, verseKey} = e.currentTarget.dataset;

        this.jumpToVerse(verse, verseKey);
      });
  }

  jumpToCurrent() {
    const current = this.currentVerse;
    if (current.key) {
      this.jumpToVerse(current.number, current.key);
    }
  }

  setPlaying(verseKey) {
    this.currentVerse.playing = false

    this.setCurrentVerse(getAyahIdFromKey(verseKey), verseKey)
    this.currentVerse.playing = true;
  }

  resetSegments(seekTime, segmentTimings, isPlaying) {
    this.removeSegments();
    let segments = segmentTimings || [];

    let currentTime = seekTime * 1000;

    $.each(segments, (index, segment) => {
      let startTime = parseInt(segment[2], 10);
      let endTime = parseInt(segment[3], 10);

      //continue if the segment is passed
      if (currentTime > endTime) return true;

      if (currentTime > startTime) {
        this.highlightSegment(segment[0], segment[1]);
        if (!isPlaying) {
          // if player is not playing, just highlight seek the word
          return;
        }
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
    const words = this.findVerse(this.currentVerse.key).find('.word')

    // tajweed mode don't show words
    if (0 == words.length) return;

    const showWordTooltip = document.body.setting.get("autoShowWordTooltip");
    this.removeSegmentHighlight();

    const start = parseInt(startIndex, 10) + 1;
    const end = parseInt(endIndex, 10) + 1;

    for (let word = start, end1 = end; word < end1; word++) {
      words.eq(word - 1).addClass("highlight");

      if (showWordTooltip) {
        let tip = words.eq(word - 1)[0].tooltip;
        tip && tip.show();
      }
    }
  }

  removeSegmentHighlight() {
    let words = $(".word.highlight");

    words.each((i, word) => {
      let tip = word.tooltip;

      if (tip && tip._popper) tip.hide();

      word.classList.remove("highlight");
    });
  }

  jumpToVerse(verse, verseKey) {
    const dom = this.findVerse(verseKey);

    // If this ayah is already loaded, scroll to it
    if (dom.length > 0) {
      return this.setCurrentVerse(verse, verseKey)
    }

    return this.loadVerses(verse, verseKey).then(() => {
      this.setCurrentVerse(verse, verseKey)
    });
  }

  highlightCurrent() {
    this.removeHighlighting();
    const verseEl = this.findVerse(this.currentVerse.key);
    verseEl.addClass("highlight");
  }

  scrollToCurrent() {
    const current = this.currentVerse;
    const verseEl = this.findVerse(current.key);

    if (verseEl.length == 0)
      return

    // activate verse item in dropdown filter
    $("#verse-list .dropdown-item").removeClass("active");
    let activeVerse = $("#verse-list").find(`[verse-key='${current.key}']`);
    activeVerse.addClass("active");
    $("#ayah-dropdown #current").html(this.verseText(current.number, current.key));

    let verseTopOffset = verseEl.offset().top;
    let verseHeight = verseEl.outerHeight();
    let currentScroll = $(window).scrollTop();
    let windowHeight = window.innerHeight;
    let headerHeight =
      $(".header").outerHeight() + $(".surah-actions").outerHeight();
    let playerHeight = $("#player").outerHeight();

    // scroll if there isn't a space to appear completely
    let bottomOffsetCheck =
      verseTopOffset + verseHeight >
      currentScroll + windowHeight - playerHeight;
    let topOffsetCheck = verseTopOffset < currentScroll + headerHeight;

    const scrollLength = verseTopOffset - (headerHeight + 50);

    if (bottomOffsetCheck || topOffsetCheck) {
      document.scrollingElement.scrollTo({
        top: scrollLength,
        behavior: "smooth"
      });
    }
  }

  insertVerses(newVerses) {
    let verseList = this.activeTab;
    verseList.html(newVerses);

    this.activeTab.trigger("items:added");
    this.resumePageLoader();
    return Promise.resolve(verseList);
  }

  removeHighlighting() {
    const highlightedVerses = $(`.verse.highlight`);

    if (highlightedVerses.length > 0) {
      highlightedVerses.removeClass("highlight");
      this.removeSegments();
    }
  }

  removeSegments() {
    if (this.segmentTimers.length > 0) {
      for (let alignTimer of this.segmentTimers) {
        clearTimeout(alignTimer);
      }

      return (this.segmentTimers = []);
    }
    this.removeSegmentHighlight();
  }

  findVerse(key) {
    return this.activeTab.find(`.verse[data-key='${key}']`)
  }

  verseText(verseNumber, verseKey) {
    // in chapter mode, we'll show verse number
    // and verse key in juz or page view
    if (this.isChapterMode)
      return verseNumber
    else
      return verseKey;
  }

  disconnect() {
    document.removeEventListener("turbolinks:load", () => this.scrollToTop());
  }

  scrollToTop() {
    document.body.scrollIntoView();
  }

  pausePageLoader() {
    if (this.pageLoader) this.pageLoader.pause()
  }

  resumePageLoader() {
    if (this.pageLoader) this.pageLoader.resume()
  }

  updateURLState(url, state) {
    window.history.pushState(state, "", url);
  }

  // private
  setCurrentVerse(verseNum, verseKey) {
    const verseEl = this.findVerse(verseKey);

    const last = this.currentVerse;

    this.currentVerse = {
      number: verseNum,
      key: verseKey,
      playing: verseEl.data('playing')
    }

    if (last.playing) {
      //this.player.pauseCurrent();
      this.player.playVerse(verseKey);
    }

    this.scrollToCurrent();
    this.highlightCurrent();

    return Promise.resolve([]);
  }

  updatePlayer(added) {
    const verses = this.activeTab.find(".verse");

    if(added){
      this.player.updateVerses(
        verses.first().data("key"),
        verses.last().data("key")
      );
    } else{
      this.player.init(
        this,
        verses.first().data("key"),
        verses.last().data("key")
      );
    }
   }

  getLazyTab(url, target, lazy) {
    const lazyParent = `{"root":"${target}"}`;
    const id = Math.random()
      .toString(36)
      .substring(7);

    return `<div
              class="render-async my-3"
              id="render-async-${id}"
              data-path="${url}"
              data-method="GET"
              data-headers="{}"
              data-success-event="lazy:loaded"
              data-lazy-load=${lazy ? lazyParent : false}
              data-controller="render-async">
               <p class="text-center p-3">
                 <span class='spinner text text--grey'><i class='spinner--swirl'></i></span>
               </p>
            </div>`;
  }

  changeFont(font) {
    const readingUrl = `${this.readingTab.href}&font=${font}`;
    const translationUrl = `${this.translationTab.href}&font=${font}`;

    const readingTarget = this.readingTab.dataset.target;
    const translationTarget = this.translationTab.dataset.target;

    const readingPage = document.querySelector(`${readingTarget} .verses`);
    const translationPage = document.querySelector(
      `${translationTarget} .verses`
    );

    window.pageSettings.font = font;

    readingPage.innerHTML = this.getLazyTab(
      readingUrl,
      readingTarget,
      !this.isReadingMode()
    );

    translationPage.innerHTML = this.getLazyTab(
      translationUrl,
      translationTarget,
      !this.isTranslationsMode()
    );

    if (this.currentVerse.key) {
      return this.jumpToVerse(this.currentVerse.number, this.currentVerse.key)
    }

    return Promise.resolve();
  }

  changeTranslations(newTranslationIds) {
    document.querySelector("#open-translations count").textContent = newTranslationIds.length

    let translationsToLoad;

    if (0 == newTranslationIds.length) {
      translationsToLoad = "no";
    } else {
      translationsToLoad = newTranslationIds.join(",");
    }
    document.body.loader.show();

    const path = `${this.translationTab.href}&${$.param({
      translations: translationsToLoad
    })}`;

    const verseList = $(this.translationTab.dataset.target).find(".verses");

    fetch(`${path}`, {headers: {"X-Requested-With": "XMLHttpRequest"}})
      .then(response => response.text())
      .then(verses => {
        verseList.html(verses);
        document.body.loader.hide();
      });
  }

  get playingCurrentVerse() {
    return this.currentVerse.playing
  }

  get player() {
    return document.getElementById("player").player;
  }
}
