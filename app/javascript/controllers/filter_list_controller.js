// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.listFilter(this.el.data("list"), this.el.data("input"));
  }

  listFilter(container, input) {
    let that = this;
    let list = $(container);
    let searchInput = $(input);

    /* on change keyboard */
    if (searchInput.length) {
      if (searchInput.is(":visible")) searchInput.trigger("focus");

      searchInput.on("change", () => {
        var filter = searchInput.val().toLowerCase();
        that.doFilter(filter, list);
      });

      // trigger change when user clear the search box
      searchInput[0].addEventListener("search", () =>
        searchInput.trigger("change")
      );

      searchInput.keyup(() => {
        searchInput.trigger("change");
      });
    }
  }

  doFilter(text, list) {
    /* when user types more than 1 letter start search filter */
    if (text.length >= 1) {
      text = text.toLowerCase();

      const elemWithTags = list.find("[data-filter-tags]");
      elemWithTags.each((i, elem) => {
        if (elem.dataset.filterTags.includes(text)) {
          elem.classList.remove("hidden");
          const parent = elem.parentNode;
          if (parent.classList.contains("hidden")) {
            // show parent as well
            parent.classList.remove("hidden");
          }
        } else {
          elem.classList.add("hidden");
        }
      });
    } else {
      list.find("[data-filter-tags]").removeClass("hidden filter-show");
    }
  }
}
