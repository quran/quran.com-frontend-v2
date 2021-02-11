// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction

import { Controller } from "stimulus";

export default class extends Controller {

  connect() {
    this.updateInternalLinks();
  }

  updateInternalLinks(){
    this.element.querySelectorAll('a').forEach(item => {
      if(item.host === location.host){
        item.setAttribute('data-controller', 'ajax-modal');
        const verseId = item.pathname.split(':')[1];
        const chapterId = item.pathname.split(':')[0];

        const url = `${
          chapterId
        }/referenced_verse?to=${verseId}&from=${verseId}
        &translations=${this.element.dataset.resourceContentId}&skip_sessions=true`;
        
        item.setAttribute('data-url', url)
        item.href = 'javascript:;';
      }
    });
  }

} 