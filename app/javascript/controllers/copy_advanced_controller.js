import {Controller} from "stimulus";
import copyToClipboard from "copy-to-clipboard";

export default class extends Controller {
  connect() {
    const {verseId, chapterId} = this.element.dataset;
    this.verseId = verseId;
    this.chapterId = chapterId;
    this.rangeType = "single";
    this.addFootnotes = false;

    this.selects = $(".simple-select").select2({
      // dropdownAutoWidth: true,
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
  }

  translationsHandler() {
    if (
      document.querySelectorAll('input[name="copy-translation"]:checked')
        .length > 0
    ) {
      document
        .querySelector(".copy-footnote-section")
        .classList.remove("hidden");
    } else {
      document.querySelector(".copy-footnote-section").classList.add("hidden");
    }
  }

  footnoteHandler(e) {
    this.addFootnotes = e.target.value == "yes" ? true : false;
  }

  copyHandler() {
    let [to, from] = [this.verseId, this.verseId];
    if (this.rangeType == "multiple") {
      to = document.querySelector("#copy-range-ayah-to").value;
      from = document.querySelector("#copy-range-ayah-from").value;
    }
    const selectedTransaltions = [
      ...document.querySelectorAll('input[name="copy-translation"]:checked')
    ].map(x => x.value);
    const url = `/${
      this.chapterId
    }/load_verses.text?to=${to}&from=${from}&translations=${selectedTransaltions.join()}&add_footnotes=${
      this.addFootnotes
    }`;
    fetch(url, {headers: {"X-Requested-With": "XMLHttpRequest"}})
      .then(resp => resp.text())
      .then(content => {
        copyToClipboard(content);
      })
      .catch(err => {
        //TODO: show error
      });
  }
}
