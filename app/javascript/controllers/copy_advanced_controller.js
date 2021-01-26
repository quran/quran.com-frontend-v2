import { Controller } from "stimulus";
import copyToClipboard from "copy-to-clipboard";

export default class extends Controller {
  connect() {
    this.verseId = this.element.dataset.verseId;
    this.chapterId = this.element.dataset.chapterId;
    this.rangeType = 'single';
    this.addFootnotes = false;
    $('.simple-select').select2({
      // dropdownAutoWidth: true,
      width: '100%',
      dropdownCssClass: 'select-stylee',
      placeholder: 'selected option',
      minimumResultsForSearch: -1,
    });
    this.bindingElements(); 
  }
  
  bindingElements(){
    this.copySingle = $("#repeat-single-ayah");
    this.copyRange = $("#copy-range-ayah-radio");

    this.copySingle.on("change", (e) => this.toggleRangeWraper(e));
    this.copyRange.on("change", (e) => this.toggleRangeWraper(e));
  }
  
  toggleRangeWraper(e){
    this.rangeType = e.target.dataset.name;
    document.querySelector(".copy-range-ayah").classList.toggle("hidden");
  }
  
  translationsHandler(){
    if(document.querySelectorAll('input[name="copy-translation"]:checked').length > 0){
      document.querySelector(".copy-footnote-section").classList.remove("hidden");
    }else{
      document.querySelector(".copy-footnote-section").classList.add("hidden");
    }
  }
  
  footnoteHandler(e){
    this.addFootnotes = e.target.value == 'yes' ? true : false;
  }
  
  copyHandler(){
    let [to,from] = [this.verseId, this.verseId];
    if(this.rangeType == 'multiple'){
      to =  document.querySelector("#copy-range-ayah-to").value;
      from =  document.querySelector("#copy-range-ayah-from").value;
    }
    const selectedTransaltions = [...document.querySelectorAll('input[name="copy-translation"]:checked')].map(x => x.value);
    const url = `/chapters/${this.chapterId}/clipboard.text?to=${to}&from=${from}&translations=${selectedTransaltions}&add_footnotes=${this.addFootnotes}`;
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(resp => resp.text())
      .then(content => {
        copyToClipboard(content);
      })
      .catch(err => {
        //TODO: show error
      });
  }
  
  removeModal(){
    $("#ajax-modal")
        .empty()
        .remove();
  }
  
}