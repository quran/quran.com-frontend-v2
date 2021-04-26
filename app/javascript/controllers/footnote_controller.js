// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction

import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    this.updateInternalLinks();

    const btnClose = this.element.querySelector('#close-footnote')
    btnClose.addEventListener('click', () => {
      this.element.classList.toggle('d-none')
    })
  }

  updateInternalLinks() {
    this.element.querySelectorAll('a').forEach(item => {
      if (item.host === location.host) {
        item.classList.remove()
        item.classList.add('see-more')
        item.setAttribute('data-controller', 'ajax-modal');
        item.setAttribute('data-class', 'modal-lg');

        const path = item.pathname.replace('/', '').split(':')
        const chapter = path[0];
        const ayah = path[1].split('-')

        const translation = $(this.element).closest('.verse__translations').data('resourceContentId')
        const url = `/${chapter}/referenced_verse?from=${ayah[0]}&to=${ayah[1] || ayah[0]}&translations=${translation}`;

        item.setAttribute('data-url', url)
        item.href = 'javascript:;';
      }
    });
  }
}
