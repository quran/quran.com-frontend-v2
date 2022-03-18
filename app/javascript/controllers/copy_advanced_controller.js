import {Controller} from "stimulus";
import copyToClipboard from "copy-to-clipboard";
import {getAyahIdFromKey} from "../utility/quran_utils";

export default class extends Controller {
  connect() {
    const {verseKey} = this.element.dataset;
    this.verseKey = verseKey;
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

    if (this.copyRangeTo.val().length == 0)
      this.copyRangeTo.attr("disabled", true);

    this.bindingElements();
  }

  disconnect() {
    const select = this.selects.data("select2");
    if (select) select.destroy();
  }

  bindingElements() {
    this.copyRangeFrom.on("change", e => {
      const from = this.copyRangeFrom.val();
      if ('0' == from) {
        this.copyRangeTo.attr("disabled", true);
        this.copyRangeTo.find("option").attr("disabled", "disabled")
        return
      }

      const selectedId = getAyahIdFromKey(from);

      this.copyRangeTo.find("option").each((i, option) => {
        // disable all options which are less then copy start
        if (0 != option.value) {
          const id = getAyahIdFromKey(option.value);
          option.disabled = id < selectedId;
        }
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
    $("#file-notice").addClass('hidden')

    this.getText().then(response => response.text()).then(text => {
      copyToClipboard(text);
      submit.innerHTML = 'Copied!';
      submit.disabled = false;
      this.prepareTextFile(text);

      setTimeout(() => {
        submit.innerHTML = 'Copy text';
      }, 3000)
    }).catch(err => {
      submit.innerHTML = 'Copy text';
      submit.disabled = false;
      $("#error-notice").removeClass('hidden');
    })
  }

  prepareTextFile(content) {
    const file = new Blob([content], {type: 'text/plain'})
    const link = $("#file-notice").find("a")[0]
    link.href = URL.createObjectURL(file);
    link.download = "quran.copy.txt";

    $("#file-notice").removeClass('hidden');
  }

  getText() {
    $("#error-notice").addClass('hidden');
    let [from, to] = [this.verseKey, this.verseKey];

    if (this.rangeType == "multiple") {
      from = this.copyRangeFrom.val();
      to = this.copyRangeTo.val();
    }

    if (! this.validSelection(from, to)) {
      return Promise.reject("Invalid ayah range");
    }

    const copyOptions = {
      arabic: this.addArabic(),
      footnote: this.addFootnote(),
      translations: this.selectedTranslations().join(","),
      xhr: true,
      from,
      to
    }

    let headers = {"X-Requested-With": "XMLHttpRequest"};
    const copyUrl = `/advance_copy/copy_text?${$.param(copyOptions)}`
    return fetch(copyUrl, {headers: headers});
  }

  validSelection(from, to) {
    if (
      0 == from || 0 == to ||
      undefined == from || undefined == to ||
      0 == from.length || 0 == to.length
    )
      return false;

    const idFrom = getAyahIdFromKey(from);
    const idTo = getAyahIdFromKey(to);

    return idFrom <= idTo;
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
