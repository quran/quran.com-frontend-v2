import {Controller} from "stimulus";
import {debounce} from "lodash-es";
import DeviceDetector from "../utility/deviceDetector";

const FILTER_DELAY = 150;

export default class extends Controller {
  connect() {
    let el = this.element;

    this.searchBox = $(el).find("[name=query]");
    this.device = new DeviceDetector();

    this.bindSuggestion();
    this.resizeHandler();

    window.addEventListener("resize", () => this.resizeHandler());

    this.element
      .querySelector("#search-trigger")
      .addEventListener("click", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let mobile = this.device.isMobile();
        let query = this.searchBox.val();

        if (mobile && 0 == query.length) {
          el.classList.toggle("expand-collapse");
          el.classList.toggle("sb-search-open");
        }

        if (query.length > 0) {
          this.doSearch(query);
        }
      });

    document.addEventListener('click', (e) => {
      if (this.element.contains(e.target)) {
        $(".suggestions").show();
      } else {
        $(".suggestions").hide()
      }
    })

    $(".search-btn").click(() => {
      alert('s')
    })
  }

  bindSuggestion() {
    this.searchBox
      .change(e => {
        this.getSuggestions(e.target.value);
      })
      .keyup(
        debounce(function (e) {
          /* fire the above change event after every letter is typed with a delay of 250ms */
          $(this).change();
        }, FILTER_DELAY)
      );
  }

  resizeHandler() {
    let classes = this.element.classList;
    const expandable = this.element.dataset.expand == "true";

    if (this.device.isMobile() && expandable) {
      // collapse the search bar
      classes.remove("sb-search-open");
    } else {
      classes.add("sb-search-open");
      classes.remove("expand-collapse");
    }
  }

  getSuggestions(text) {
    if (text && text.length > 0) {
      fetch(`/search/suggestion?query=${text}`)
        .then(response => response.text())
        .then(suggestions => {
          $(".suggestions").html(suggestions);
        })
        .catch(error => callback([]));
    } else {
      $(".suggestions").empty();
    }
  }

  doSearch(query) {
    Turbolinks.visit(`/search?query=${query}`)
  }
}
