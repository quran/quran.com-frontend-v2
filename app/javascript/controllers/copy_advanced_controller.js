import {Controller} from "stimulus";
import copyToClipboard from "copy-to-clipboard";

export default class extends Controller {
  connect() {
    const {verseId, chapterId} = this.element.dataset;
    this.verseId = verseId;
    this.chapterId = chapterId;
    this.rangeType = "single";

    this.selects = $(".simple-select").select2({
      dropdownAutoWidth: true,
      width: "100%",
      dropdownCssClass: "select-stylee",
      placeholder: "selected option",
      //minimumResultsForSearch: -1
    });

    this.copyRangeFrom = $("#copy-range-ayah-from");
    this.copyRangeTo = $("#copy-range-ayah-to");
    this.copyRangeTo.attr("disabled", true);

    this.bindingElements();
  }

  disconnect() {
    const select = this.selects.data("select2");
    if (select) select.destroy();
  }

  bindingElements() {
    this.copyRangeFrom.on("change", e => {
      const from = Number(this.copyRangeFrom.val());
      this.copyRangeTo.val(0);

      this.copyRangeTo.find("option").each((i, option) => {
        // disable all options which are less then copy start
        const val = Number(option.value);
        option.disabled = val > 0 && val < from;
      });
      this.copyRangeTo.attr("disabled", false);
    });

    const copyTypes = $(this.element).find("[name=copy-type]")

    copyTypes.on("change", e => {
      this.rangeType = e.currentTarget.value;
      const rangeClasses = document.querySelector(".copy-range-ayah").classList;

      if ('single' == this.rangeType)
        rangeClasses.add('hidden')
      else
        rangeClasses.remove('hidden')
    });

    const submit = this.element.querySelector('#copy');
    submit.addEventListener('click', (e) => {
      e.preventDefault();
      this.doCopy(submit);
    })
  }

  doCopy(submit) {
    submit.innerHTML = 'Please wait..';
    submit.disabled = true;

    this.getText().then(response => response.text()).then(text => {
      copyToClipboard(text);
      submit.html('Copied!')

      setTimeout(() => {
        submit.innerHTML = 'Copy text';
        submit.disabled = false;
      }, 3000)
    }).catch(err => {
      submit.innerHTML = 'Copy text';
      submit.disabled = false;
    })
  }

  getText() {
    let [to, from] = [this.verseId, this.verseId];
    if (this.rangeType == "multiple") {
      to = document.querySelector("#copy-range-ayah-to").value;
      from = document.querySelector("#copy-range-ayah-from").value;
    }

    const copyOptions = {
      arabic: this.addArabic(),
      footnote: this.addFootnote(),
      translations: this.selectedTranslations().join(","),
      from,
      to
    }

    let headers = {"X-Requested-With": "XMLHttpRequest"};
    const copyUrl = `/${this.chapterId}/copy_text?${$.param(copyOptions)}`
    return fetch(copyUrl, {headers: headers});
  }

  selectedTranslations() {
    const selected = this.element.querySelectorAll('input[name="copy-translation"]:checked');
    return [...selected].map(x => x.value)
  }

  addFootnote() {
    return this.element.querySelector(".copy-footnote:checked").value
  }

  addArabic() {
    return this.element.querySelector('#copy-arabic').checked;
  }
}
