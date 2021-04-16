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
    // no info mode in juz view
    return false;
  }

  id() {
    return this.element.dataset.juzNumber;
  }

  getVerseKey(verse){
    return verse;
  }

  get isChapterMode(){
    return false
  }
}
