import {Controller} from "stimulus";

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
    this.el = $(this.element)
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

      this.initPlayer();
    }, 100);
  }

  bindTabs() {
    this.translationTab.addEventListener("tab.shown", e => this.tabChanged(e, 'translation'));
    this.readingTab.addEventListener("tab.shown", e => this.tabChanged(e, 'reading'));

    this.activeTab.on("items:added", () => {
      // new ayah are added to page. Refresh the player's first and last ayah
      this.initPlayer();
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

    this.pageLoader = pageVerses.get(0).infinitePage;
    this.resumePageLoader();

    this.activeTab = pageVerses.find(".verses");

    if (this.playingCurrentVerse) {
      // player is playing this ayah. Scroll to it and start highlighting
      const current = this.currentVerse;

      this.jumpToVerse(current.number, current.key).then(() => {
        const player = document.getElementById("player").player;
        player.pauseCurrent();
        player.playCurrent();
      });
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

        this.jumpToVerse(verse, verseKey).then(() => {
          if (this.playingCurrentVerse) {
            const player = document.getElementById("player").player;
            player.playVerse(verseKey);
          }
        })
      });
  }

  jumpToVerse(verse, verseKey) {
    const dom = this.findVerse(verseKey);

    // If this ayah is already loaded, scroll to it
    if (dom.length > 0) {
      return this.setCurrentVerse(verseKey, dom)
    }

    return this.loadVerses(verse).then(() => {
      this.setCurrentVerse(verseKey)
    });
  }

  highlightCurrent() {
    this.removeHighlighting();
    this.currentVerse.el.addClass("highlight");
  }

  scrollToCurrent() {
    const current = this.currentVerse;

    // activate verse item in dropdown filter
    $("#verse-list .dropdown-item").removeClass("active");
    let activeVerse = $("#verse-list").find(`[verse-key='${current.key}']`);
    activeVerse.addClass("active");
    $("#ayah-dropdown #current").html(this.verseText(current.number, current.key));

    let verseTopOffset = current.el.offset().top;
    let verseHeight = current.el.outerHeight();
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
      this.removeSegmentTimers();
    }
  }

  removeSegmentTimers() {
    if (this.segmentTimers.length > 0) {
      for (let alignTimer of this.segmentTimers) {
        clearTimeout(alignTimer);
      }

      return (this.segmentTimers = []);
    }
  }

  findVerse(key) {
    return this.activeTab.find(`.verse[data-key='${key}']`)
  }

  verseText(verse, verseKey) {
    // in chapter mode, we'll show verse number
    // and verse key in juz or page view
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

  setCurrentVerse(key, verseEl) {
    verseEl = verseEl || this.findVerse(key);

    this.currentVerse = {
      el: verseEl,
      number: verseEl.data('verse'),
      key: key,
      playing: verseEl.data('playing')
    }

    this.scrollToCurrent();
    this.highlightCurrent();

    return Promise.resolve([]);
  }

  get playingCurrentVerse() {
    return this.currentVerse.playing
  }
}
