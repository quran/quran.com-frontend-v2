// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import QuranController from "./quran_controller";

export default class extends QuranController {
  connect() {
    super.connect()

    this.infoTab = document.querySelector(".surah-info-tab");
    this.infoTab.addEventListener("tab.shown", e => this.tabChanged(e, 'info'));
  }

  verseText(verse, verseKey){
    return verse;
  }

  isInfoMode() {
    return this.infoTab.classList.contains("tabs__item--selected");
  }

  id() {
    return this.el.data('id');
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

  highlightSegment(startIndex, endIndex) {
    const words = this.activeTab.find(
      `.verse[data-key=${this.getVerseKey(this.currentVerse)}] .word`
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
  removeSegmentHighlight() {
    let words = $(".word.highlight");

    words.each((i, word) => {
      let tip = word.tooltip;

      if (tip && tip._popper) tip.hide();

      word.classList.remove("highlight");
    });
  }

  loadVerses(verse) {
    document.body.loader.show();
    // called when user jump to ayah from repeat setting
    verse = Number(verse);

    // pause infinite page loader
    this.pausePageLoader();

    const chapter = this.id();
    const reading = this.isReadingMode();
    let from, to, font, translations;

    // instead of loading all ayah, let's load batch of 10 around the selected verse
    // i.e if user want to jump to 200, we'll load 195 to 205
    from = Math.max(1, verse - 2);
    to = Math.min(verse + 5, this.totalVerses);
    font = document.body.setting.get("font");
    translations = document.body.setting.get("translations").join(',')

    let request = fetch(
      `/${chapter}/load_verses?${$.param({from, to, verse, reading, font, translations})}`,
      {headers: {"X-Requested-With": "XMLHttpRequest"}}
    )
      .then(response => response.text())
      .then(verses => {
        document.body.loader.hide();
        this.insertVerses(verses)
      })

    return Promise.resolve(request);
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

    if (this.currentVerse) {
      return this.jumpToVerse(this.currentVerse)
    }

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

  initPlayer() {
    const player = document.getElementById("player").player;
    const verses = this.activeTab.find(".verse");

    player.init(
      this,
      verses.first().data("verseNumber"),
      verses.last().data("verseNumber"),
      this.currentVerse
    );
  }
}
