// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="chapter" data-chapter=CHAPTER_NUMBER>
// </div>

import QuranController from "./quran_controller";
import {getPageFromKey} from "../utility/quran_utils";

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
      `/${chapter}/load_verses?${$.param({verse: verseKey, page: getPageFromKey(verseKey), reading, font, translations})}`,
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
