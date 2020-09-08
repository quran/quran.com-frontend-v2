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
    this.activeTab = $(this.element).find(".tab-pane.show .verses");

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
  }

  highlightVerse(verseNumber) {}

  highlightWord(wordPosition) {}

  removeHighlighting() {}

  loadVerses(verse) {
    // If this ayah is already loaded, scroll to it
    if (this.activeTab.find(`.verse[data-verse-number=${verse}]`).length > 0) {
      return Promise.resolve([]);
    }

    const chapter = this.element.dataset.chapterId;
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
