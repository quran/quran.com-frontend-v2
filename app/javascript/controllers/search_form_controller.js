import { Controller } from "stimulus";
import debounce from "lodash/debounce";
import DeviceDetector from "../utility/deviceDetector";

const FILTER_DELAY = 150;

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.device = new DeviceDetector();

    this.suggestions = this.el.find("#suggestions");
    this.bindSuggestion();

    document.addEventListener("click", e => {
      if (this.element.contains(e.target)) {
        this.showSuggestions();
      } else {
        this.hideSuggestions();
      }
    });
  }

  bindSuggestion() {
    this.searchBox = this.el.find("[name=query]");

    //trigger the change when search input is cleared
    this.searchBox[0].addEventListener("search", () => {
      this.searchBox.trigger("change");
    });

    this.searchBox
      .change(e => {
        this.getSuggestions(e.target.value);
      })
      .keyup(
        debounce(function(e) {
          /* fire the above change event after every letter is typed with a delay of 250ms */
          $(this).change();
        }, FILTER_DELAY)
      );
  }

  getSuggestions(text) {
    if (text && text.length > 0) {
      this.showSuggestions();

      fetch(`/search/suggestion?query=${text}`)
        .then(response => response.text())
        .then(suggestions => {
          this.suggestions.html(suggestions);
        })
        .catch(error => callback([]));
    } else {
      this.hideSuggestions();
    }
  }

  showSuggestions() {
    this.el.addClass("show-suggestion");
  }

  hideSuggestions() {
    this.el.removeClass("show-suggestion");
  }

  doSearch(query) {
    Turbolinks.visit(`/search?query=${query}`);
  }
}
