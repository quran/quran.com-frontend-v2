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
    $('[data-toggle="tooltip"]').tooltip({ boundary: "window" });
    this.element[this.identifier] = this;
    this.dragActionBar();
  }

  dragActionBar() {
    const slider = document.querySelector(".surah-actions");
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener("mousedown", e => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    slider.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      slider.scrollLeft = scrollLeft - walk;
      console.log(walk);
    });
  }

  updatePagination(dom) {
    const lastVerse = $(dom.find(".verse").last()).data("verseNumber");

    // Update next page ref if it exists.
    const nextPage = $("#verses_pagination a[rel=next]");
    if (nextPage.length > 0) {
      let ref = nextPage.attr('href');
      const updatedRef = ref.replace(/page=\d+/, `page=${Math.ceil(lastVerse / 10) + 1}`);
      nextPage.attr('href', updatedRef);
    }
  }

  loadVerses(verse) {
    // If this ayah is already loaded, scroll to it
    if ($(`#verses .verse[data-verse-number=${verse}]`).length > 0) {
      return Promise.resolve([]);
    }

    const chapter = this.element.dataset.chapterId;
    const lastVerse = $("#verses .verse:last").data().verseNumber;
    const firstVerse = $("#verses .verse:first").data().verseNumber;

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

    return Promise.resolve(dom);
  }
}
