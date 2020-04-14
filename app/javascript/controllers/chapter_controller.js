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
    this.element[this.identifier] = this;
  }

  loadVerses(start) {
    let chapter = this.element.dataset.chapterId;

    let request = fetch(`/${chapter}/load_verses?${$.param({ verse: start })}`)
      .then(response => response.text())
      .then(verses => this.insertVerses(verses));

    return Promise.resolve(request);
  }

  changeTranslations(newTranslationIds) {
    let path = $("#verses_pagination").data("url");
    let translationsToLoad;

    if (0 == newTranslationIds.length) {
      translationsToLoad = "no";
    } else {
      translationsToLoad = newTranslationIds.join(",");
    }

    fetch(`${path}?${$.param({ translations: translationsToLoad })}`)
      .then(response => response.text())
      .then(verses => {
        $("#verses").html(
          $(verses)
            .find("#verses")
            .html()
        );
      });
  }

  insertVerses(newVerses) {
    let dom = $("<div>").html(newVerses);
    let previousVerse = $(dom.find(".verse")[0]).data("verseNumber");

    while (
      $(`#verses .verse[data-verse-number=${previousVerse}]`).length == 0 &&
      previousVerse > 0
    ) {
      previousVerse = previousVerse - 1;
    }

    if (previousVerse > 0) {
      let targetDom = $(`#verses .verse[data-verse-number=${previousVerse}]`);
      targetDom.after(newVerses);
    } else {
      let nextVerse = $(dom.find(".verse")[dom.find(".verse").length - 1]).data(
        "verseNumber"
      );

      while ($(`#verses .verse[data-verse-number=${nextVerse}]`).length == 0) {
        nextVerse = nextVerse + 1;
      }

      let targetDom = $(`#verses .verse[data-verse-number=${nextVerse}]`);
      targetDom.before(newVerses);
    }
  }
}
