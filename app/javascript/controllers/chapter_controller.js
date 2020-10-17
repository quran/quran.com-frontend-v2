// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  initialize() {
    this.translationTab = document.querySelector("#pill-translation-tab");
    this.readingTab = document.querySelector("#pill-reading-tab");
    this.infoTab = document.querySelector("#pill-surah-info-tab");

    // this.setURLState();
    this.bindAyahJump();
  }

  connect() {
    const chapter = this;
    this.element[this.identifier] = chapter;
    // using same controller for reading, and translation mode
    // active tab keep track of current active view
    this.activeTab = $(this.element).find(".tab-pane.show .verses");

    // currently playing ayah
    this.currentVerse = null;

    this.totalVerses = Number(this.element.dataset.totalVerses);

    // currently highlighted word
    this.activeWord = null;

    // intervals for each words of current ayah
    this.segmentTimers = [];

    this.translationTab && this.translationTab.addEventListener("shown.bs.tab", e => {
      const url = e.target.href;
      url && this.updateURLState(url, { reading: false });
      chapter.activeTab = $(e.target.dataset.target).find(".verses");
      chapter.activeTab.trigger("visibility:visible");
    });

    this.readingTab && this.readingTab.addEventListener("shown.bs.tab", e => {
      const url = e.target.href;
      url && this.updateURLState(url, { reading: true });
      chapter.activeTab = $(e.target.dataset.target).find(".verses");
      chapter.activeTab.trigger("visibility:visible");
    });

    this.infoTab && this.infoTab.addEventListener("shown.bs.tab", e => {
      const url = e.target.href;
      url && this.updateURLState(url, {});
    });

    this.translationTab && this.translationTab.addEventListener("hidden.bs.tab", e => {
      $(e.target.dataset.target)
        .find(".verses")
        .trigger("visibility:hidden");
    });

    this.readingTab && this.readingTab.addEventListener("hidden.bs.tab", e => {
      $(e.target.dataset.target)
        .find(".verses")
        .trigger("visibility:hidden");
    });

    this.activeTab.on("items:added", () => {
      // this event is triggered from infinite scrolling controller
      // new ayah are added to page. Refresh the player's first and last ayah

      const player = document.getElementById("player").player;
      const verses = chapter.activeTab.find(".verse");
      player.init(
        chapter,
        verses.first().data("verseNumber"),
        verses.last().data("verseNumber")
      );
    });

    setTimeout(() => {
      const player = document.getElementById("player").player;
      const verses = chapter.activeTab.find(".verse");
      player.init(
        chapter,
        verses.first().data("verseNumber"),
        verses.last().data("verseNumber")
      );
    }, 100);
  }

  setURLState() {
    // set the selected tab url and state in the url, if not already there
    const paramString = window.location.search;
    if (paramString.includes("reading=true")) {
      this.updateURLState(window.location.href, { reading: true });
    } else if (paramString.includes("reading=false")) {
      this.updateURLState(window.location.href, { reading: false });
    } else {
      if (this.isTranslationsMode()) {
        this.updateURLState(this.translationTab.href, { reading: false });
      } else if (this.isReadingMode()) {
        this.updateURLState(this.readingTab.href, { reading: true });
      }
    }
  }

  bindAyahJump() {
    $("#verse-list")
      .find(".dropdown-item a")
      .on("click", e => {
        document.body.loader.show();

        e.preventDefault();
        e.stopImmediatePropagation();

        const ayah = e.currentTarget.dataset.verse;
        // TODO: we need to refactor this now, repeating this a lot
        // create a utility to load verses, update page, tell player to load audio etc
        this.loadVerses(ayah).then(() => {
          this.scrollToVerse(ayah);
          document.body.loader.hide();
          this.activeTab.trigger("items:added");
        });
      });
  }

  isReadingMode() {
    return this.readingTab.classList.contains("active");
  }

  isTranslationsMode() {
    return this.translationTab.classList.contains("active");
  }

  updateURLState(url, state) {
    window.history.pushState(state, "", url);
  }

  scrollToVerse(verse) {
    let verseElement = this.activeTab.find(
      `.verse[data-verse-number=${verse}]`
    );

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
    this.activeTab[0].infinitePage.resume();

    return Promise.resolve([]);
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
    this.activeTab[0].infinitePage.pause();
    const chapter = this.chapterId();
    const reading = this.isReadingMode();
    let from, to;

    //const verses = this.activeTab.find(".verse");
    //const firstVerse = verses.first().data().verseNumber;
    //const lastVerse = verses.last().data().verseNumber;

    /*if (verse > lastVerse) {
      from = lastVerse;
      to = Math.ceil(verse / 10) * 10;
    } else {
      from = verse;
      to = firstVerse;
    }*/

    // instead of loading all ayah, lets say load batch of 10 around the select verse
    // i.e if user want to jump to 200, we'll load 195 to 205
    from = Math.max(1, verse - 2);
    to = Math.min(verse + 5, this.totalVerses);

    let request = fetch(
      `/${chapter}/load_verses?${$.param({ from, to, verse, reading })}`
    )
      .then(response => response.text())
      .then(verses => this.insertVerses(verses))
      //.then(updatedDom => this.updatePagination(updatedDom))
      .then(() => this.scrollToVerse(verse));

    return Promise.resolve(request);
  }

  changeFont(font) {
    const readingUrl = `${this.readingTab.href}&font=${font}`;
    const translationUrl = `${this.translationTab.href}&font=${font}`;

    const readingTarget = this.readingTab.dataset.target;
    const translationTarget = this.translationTab.dataset.target;

    const readingPage = document.querySelector(`${readingTarget} #verses`);
    const translationPage = document.querySelector(
      `${translationTarget} #verses`
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
                 <i className="fa fa-spinner fa-spin"></i>
               </p>
            </div>`;
  }

  changeTranslations(newTranslationIds) {
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

    let verseList = $(this.translationTab.dataset.target).find("#verses");

    fetch(`${path}`)
      .then(response => response.text())
      .then(verses => {
        verseList.html(
          $(verses)
            .find("#verses")
            .html()
        );

        document.body.loader.hide();
      });
  }

  insertVerses(newVerses) {
    //let dom = $("<div>").html(newVerses);
    let verseList = this.activeTab;
    //let previousVerse = $(dom.find(".verse")[0]).data("verseNumber");

    /*while (
      verseList.find(`.verse[data-verse-number=${previousVerse}]`).length ==
      0 &&
      previousVerse > 0
      ) {
      previousVerse = previousVerse - 1;
    }

    if (previousVerse > 0) {
      let targetDom = verseList.find(
        `.verse[data-verse-number=${previousVerse}]`
      );
      targetDom.after(newVerses);
    } else {
      let nextVerse = $(dom.find(".verse")[dom.find(".verse").length - 1]).data(
        "verseNumber"
      );

      while (
        verseList.find(`.verse[data-verse-number=${nextVerse}]`).length == 0
        ) {
        nextVerse = nextVerse + 1;
      }

      let targetDom = verseList.find(`.verse[data-verse-number=${nextVerse}]`);
      targetDom.before(newVerses);
    }*/

    // simply replace current page with newly loaded verses
    verseList.find("#verses").html(newVerses);
    this.activeTab[0].infinitePage.resume();

    return Promise.resolve(verseList);
  }
}
