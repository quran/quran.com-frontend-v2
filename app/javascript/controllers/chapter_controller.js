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

  loadVerses(verse, verseKey) {
    document.body.loader.show();

    // pause infinite page loader
    this.pausePageLoader();

    const chapter = this.id();
    const reading = this.isReadingMode();
    let  font, translations;
    const setting = document.body.setting;
    font = setting.currentFont;
    translations = setting.selectedTranslations.join(',')

    let request = fetch(
      `/${chapter}/load_verses?${$.param({verse: verseKey, reading, font, translations})}`,
      {headers: {"X-Requested-With": "XMLHttpRequest"}}
    )
      .then(response => response.text())
      .then(verses => {
        document.body.loader.hide();
        this.insertVerses(verses)
      })

    return Promise.resolve(request);
  }

  get isChapterMode(){
    return true
  }
}
