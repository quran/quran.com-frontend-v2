// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//

import {Controller} from "stimulus";

export default class extends Controller {
  selectedLang = ''

  filter(e) {
      const currentLang = e.target.dataset.selectedLang;
      if(currentLang === this.selectedLang){
        this.selectedLang = ''
      } else {
        this.selectedLang = currentLang;
      }
      this.applyFilter();
  }

  applyFilter () {
    // style the filters
    document.getElementById('filters').querySelectorAll('button').forEach(element => {
        if(element.dataset.selectedLang === this.selectedLang) {
            element.classList.remove('btn-outline-secondary');
            element.classList.add('btn-secondary');
        }else{
            element.classList.remove('btn-secondary');
            element.classList.add('btn-outline-secondary');
        }
    });
    
    // filter the results
    document.getElementById('tafsir-results').querySelectorAll('li').forEach(element => {
        element.hidden = this.selectedLang && element.dataset.lang !== this.selectedLang;
    });
  }
}
