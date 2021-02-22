// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import {Controller} from "stimulus";

export default class extends Controller {
  initialize() {
    this.translationTab = document.querySelector(".translation-tab");
    this.readingTab = document.querySelector(".reading-tab");
    this.infoTab = document.querySelector(".surah-info-tab");
    this.pageLoader = null
    this.bindAyahJump();
  }

  connect() {
    const chapter = this;
    const el = $(this.element)
    // store ref of controller in dom
    this.element.chapterEl = chapter;

    // disable turbolink scroll position.
    // we want to scroll to first ayah on page load
    document.addEventListener("turbolinks:load", () => this.scrollToTop());

    // using same controller for reading, and translation mode
    // active tab keep track of current active view
    this.activeTab = el.find(".tab-pane.show .verses");

    // currently playing ayah
    this.currentVerse = null;
    this.totalVerses = Number(el.data('totalVerses'));

    // currently highlighted word
    this.activeWord = null;

    // intervals for each words of current ayah
    this.segmentTimers = [];

    this.translationTab.addEventListener("tab.shown", e => this.tabChanged(e, 'translation'));
    this.readingTab.addEventListener("tab.shown", e => this.tabChanged(e, 'reading'));
    this.infoTab.addEventListener("tab.shown", e => this.tabChanged(e, 'info'));

    this.activeTab.on("items:added", () => {
      // this event is triggered from infinite scrolling controller
      // new ayah are added to page. Refresh the player's first and last ayah
      this.initPlayer();
    });

    setTimeout(() => {
      this.initPlayer();
    }, 100);
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
  }

  disconnect() {
    document.removeEventListener("turbolinks:load", () => this.scrollToTop());
  }

  scrollToTop() {
    document.body.scrollIntoView();
  }

  bindAyahJump() {
    $("#verse-list")
      .find(".dropdown-item")
      .on("click", e => {
        e.preventDefault();
        document.body.loader.show();

        const ayah = e.currentTarget.dataset.verse;

        this.loadVerses(ayah).then(() => {
          this.scrollToVerse(ayah);
          document.body.loader.hide();
          this.activeTab.trigger("items:added");
        });
      });
  }

  isReadingMode() {
    return this.readingTab.classList.contains("tabs__item--selected");
  }

  isTranslationsMode() {
    return this.translationTab.classList.contains("tabs__item--selected");
  }

  isInfoMode() {
    return this.infoTab.classList.contains("tabs__item--selected");
  }

  updateURLState(url, state) {
    window.history.pushState(state, "", url);
  }

  scrollToVerse(verse) {
    $("#verse-list .dropdown-item").removeClass("active");
    let activeVerse = $("#verse-list").find(`[data-filter-tags=${verse}]`);
    activeVerse.addClass("active");
    $("#ayah-dropdown #current").html(verse);

    let verseElement = this.activeTab.find(
      `.verse[data-verse-number=${verse}]`
    );

    if (verseElement.length > 0) {
      this.highlightVerse(verse);

      let verseTopOffset = verseElement.offset().top;
      let verseHeight = verseElement.outerHeight();
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
      const scrollTime = Math.min(500, scrollLength * 10);

      if (bottomOffsetCheck || topOffsetCheck) {
        document.scrollingElement.scrollTo({
          top: scrollLength,
          behavior: "smooth"
        });
      }
    }
  }

  chapterId() {
    return this.element.dataset.chapterId;
  }

  setSegmentInterval(seekTime, segmentTimings, isPlaying) {
    this.removeSegmentTimers();

    let segments = segmentTimings || [];

    if (typeof seekTime != "number") {
      this.removeSegmentHighlight();
    }

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

  removeSegmentTimers() {
    if (this.segmentTimers.length > 0) {
      for (let alignTimer of this.segmentTimers) {
        clearTimeout(alignTimer);
      }
      return (this.segmentTimers = []);
    }
  }

  highlightSegment(startIndex, endIndex) {
    const words = this.activeTab.find(
      `.verse[data-verse-number=${this.currentVerse}] .word`
    );

    // tajweed mode don't show words
    if (0 == words.length) return;

    //TODO: track highlighted words in memory and remove highlighting from them
    // DOm operation could be costly
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

  highlightVerse(verseNumber) {
    if (this.currentVerse) {
      this.removeHighlighting();
    }
    this.currentVerse = verseNumber;

    this.activeTab
      .find(`.verse[data-verse-number=${verseNumber}]`)
      .addClass("highlight");
  }

  removeSegmentHighlight() {
    let words = $(".word.highlight");

    words.each((i, word) => {
      let tip = word.tooltip;

      if (tip && tip._popper) tip.hide();

      word.classList.remove("highlight");
    });
  }

  removeHighlighting() {
    let verse = $(`.verse[data-verse-number=${this.currentVerse}]`);
    verse.removeClass("highlight");

    this.removeSegmentTimers();
  }

  updatePagination(dom) {
    /*
    const verses = this.activeTab.find(".verse");
    const lastVerse = verses.last().data().verseNumber;

    // Update next page ref if it exists.
    const nextPage = this.activeTab.find(".pagination a[rel=next]");
    if (nextPage.length > 0) {
      let ref = nextPage.attr("href");
      const updatedRef = ref.replace(
        /page=\d+/,
        `page=${Math.ceil(lastVerse / 10) + 1}`
      );
      nextPage.attr("href", updatedRef);
    }
    // resume the infinite pagination
    const page = this.getInfinitePage()
    if (page) {
      page.resume();
    }

    return Promise.resolve([]);*/
  }

  loadVerses(verse) {
    // called when user jump to ayah from repeat setting
    verse = Number(verse);

    // If this ayah is already loaded, scroll to it
    if (this.activeTab.find(`.verse[data-verse-number=${verse}]`).length > 0) {
      this.scrollToVerse(verse);
      return Promise.resolve([]);
    }

    // pause infinite page loader
    this.pausePageLoader();

    const chapter = this.chapterId();
    const reading = this.isReadingMode();
    let from, to;

    // instead of loading all ayah, let's load batch of 10 around the selected verse
    // i.e if user want to jump to 200, we'll load 195 to 205
    from = Math.max(1, verse - 2);
    to = Math.min(verse + 5, this.totalVerses);

    let request = fetch(
      `/${chapter}/load_verses?${$.param({from, to, verse, reading})}`,
      {headers: {"X-Requested-With": "XMLHttpRequest"}}
    )
      .then(response => response.text())
      .then(verses => this.insertVerses(verses))
      .then(() => this.scrollToVerse(verse));

    return Promise.resolve(request);
  }

  changeFont(font) {
    const readingUrl = `${this.readingTab.href}&font=${font}`;
    const translationUrl = `${this.translationTab.href}&font=${font}`;

    const readingTarget = this.readingTab.dataset.target;
    const translationTarget = this.translationTab.dataset.target;

    debugger
    const readingPage = document.querySelector(`${readingTarget} .verses`);
    const translationPage = document.querySelector(
      `${translationTarget} .verses`
    );

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

    return Promise.resolve();
  }

  getLazyTab(url, target, lazy) {
    const lazyParent = `{"root":"${target}"}`;
    const id = Math.random()
      .toString(36)
      .substring(7);

    return `<div
              className="render-async"
              id="render-async-${id}"
              data-path="${url}"
              data-method="GET"
              data-headers="{}"
              data-lazy-load=${lazy ? lazyParent : false}
              data-controller="render-async">
               <p className="text-center p-3">
                 <span class='spinner text text--grey'><i class='spinner--swirl'></i></span>
               </p>
            </div>`;
  }

  changeTranslations(newTranslationIds) {
    document.querySelector("#open-translations count").textContent = newTranslationIds.length

    // changing translation should always update the translation tab
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

  insertVerses(newVerses) {
    let verseList = this.activeTab;
    // simply replace current page with newly loaded verses
    verseList.html(newVerses);

    this.resumePageLoader();
    return Promise.resolve(verseList);
  }

  initPlayer() {
    const player = document.getElementById("player").player;
    const verses = this.activeTab.find(".verse");

    player.init(
      this,
      verses.first().data("verseNumber"),
      verses.last().data("verseNumber")
    );
  }

  pausePageLoader() {
    if (this.pageLoader) this.pageLoader.pause()
  }

  resumePageLoader() {
    if (this.pageLoader) this.pageLoader.resume()
  }
}
