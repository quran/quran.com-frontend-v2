// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    const chapter = this;
    this.element[this.identifier] = chapter;
    // using same controller for reading, and translation mode
    // active tab keep track of current active view
    this.activeTab = $(this.element).find(".tab-pane.show .verses");

    // currently playing ayah
    this.currentVerse = null;

    // currently highlighted word
    this.activeWord = null;

    // intervals for each words of current ayah
    this.segmentTimers = [];

    const translationTab = document.querySelector("#pill-translation-tab");
    const readingTab = document.querySelector("#pill-reading-tab");

    translationTab.addEventListener("shown.bs.tab", e => {
      chapter.activeTab = $(e.target.dataset.target).find(".verses");
      chapter.activeTab.trigger("visibility:visible");
    });

    readingTab.addEventListener("shown.bs.tab", e => {
      chapter.activeTab = $(e.target.dataset.target).find(".verses");
      chapter.activeTab.trigger("visibility:visible");
    });

    translationTab.addEventListener("hidden.bs.tab", e => {
      $(e.target.dataset.target)
        .find(".verses")
        .trigger("visibility:hidden");
    });

    readingTab.addEventListener("hidden.bs.tab", e => {
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

  chapterId() {
    return this.element.dataset.chapterId;
  }

  setSegmentInterval(seekTime, segmentTimings) {
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
    //TODO: track highlighted words in memory and remove highlighting from them
    // DOm operation could be costly
    let showWordTooltip = false; // TODO: load from settings

    this.removeSegmentHighlight();

    const start = parseInt(startIndex, 10) + 1;
    const end = parseInt(endIndex, 10) + 1;
    const words = this.activeTab.find(
      `.verse[data-verse-number=${this.currentVerse}] .word`
    );

    for (let word = start, end1 = end; word < end1; word++) {
      words.eq(word - 1).addClass("highlight");
      if (showWordTooltip) words.eq(word - 1).tooltip("show");
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

  highlightWord(wordPosition) {}

  removeSegmentHighlight() {
    let showTooltip = false;
    //if (this.config.showTooltip) $(".highlight").tooltip("hide");
    // this.removeSegmentTimers();

    $(".word.highlight").removeClass("highlight");
  }

  removeHighlighting() {
    let verse = $(`.verse[data-verse-number=${this.currentVerse}]`);
    verse.removeClass("highlight");

    // remove highlighting from words
    verse.find(".highlight").removeClass("highlight");
  }

  loadVerses(verse) {
    // If this ayah is already loaded, scroll to it
    if (this.activeTab.find(`.verse[data-verse-number=${verse}]`).length > 0) {
      return Promise.resolve([]);
    }

    const chapter = this.chapterId();
    const verses = this.activeTab.find(".verse");
    const firstVerse = verses.first().data().verseNumber;
    const lastVerse = verses.last().data().verseNumber;

    let from, to;

    if (verse > lastVerse) {
      from = lastVerse;
      to = Math.ceil(verse / 10) * 10;
    } else {
      from = verse;
      to = firstVerse;
    }

    let request = fetch(
      `/${chapter}/load_verses?${$.param({ from, to, verse })}`
    )
      .then(response => response.text())
      .then(verses => this.insertVerses(verses))
      .then(dom => this.updatePagination(dom));

    return Promise.resolve(request);
  }

  changeFont(font) {
    let path = this.activeTab.find(".pagination").data("url");
    let verseList = this.activeTab;

    fetch(`${path}?${$.param({ font: font })}`)
      .then(response => response.text())
      .then(verses => {
        verseList.html(
          $(verses)
            .find("#verses")
            .html()
        );
      });
  }

  changeTranslations(newTranslationIds) {
    let path = this.activeTab.find(".pagination").data("url");
    let translationsToLoad;
    let verseList = this.activeTab;

    if (0 == newTranslationIds.length) {
      translationsToLoad = "no";
    } else {
      translationsToLoad = newTranslationIds.join(",");
    }

    fetch(`${path}?${$.param({ translations: translationsToLoad })}`)
      .then(response => response.text())
      .then(verses => {
        verseList.html(
          $(verses)
            .find("#verses")
            .html()
        );
      });
  }

  insertVerses(newVerses) {
    let dom = $("<div>").html(newVerses);
    let previousVerse = $(dom.find(".verse")[0]).data("verseNumber");
    let verseList = this.activeTab;

    while (
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
    }

    return Promise.resolve(dom);
  }
}
