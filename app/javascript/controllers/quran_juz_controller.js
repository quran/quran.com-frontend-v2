// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import QuranController from "./quran_controller";

export default class extends QuranController {
  isInfoMode() {
    // no info mode in MuhsafPage view
    return false;
  }

  id() {
    return this.element.dataset.id;
  }

  loadVerses(verse, verseKey) {
    document.body.loader.show();

    // pause infinite page loader
    this.pausePageLoader();

    const juz = this.id();
    const reading = this.isReadingMode();
    const setting = document.body.setting;
    const font = setting.currentFont;
    const translations = setting.selectedTranslations.join(',');

    debugger
    let request = fetch(
      `/juz/${juz}/load_verses?${$.param({verse: verseKey, reading, font, translations})}`,
      {headers: {"X-Requested-With": "XMLHttpRequest"}}
    )
      .then(response => response.text())
      .then(verses => {
        document.body.loader.hide();
        this.insertVerses(verses)
      });

    return Promise.resolve(request);
  }

  get isChapterMode(){
    return false
  }
}
