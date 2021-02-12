// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";
import { debounce } from "lodash.debounce";

export default class extends Controller {
  connect() {
    this.el = $(this.element);

    this.listFilter(this.el.data("list"), this.el.data("input"));
  }

  listFilter(container, input) {
    var that = this;
    var list = $(container);
    var searchInput = $(input);
    try{
      document.querySelector(".dropdown."+list.attr("id")).addEventListener("shown.bs.dropdown", () =>
        searchInput.trigger("focus")
      );
    }catch(e){
      searchInput.trigger("focus");
    }

    /* on change keyboard */
    if(searchInput.length){
      searchInput.change(
        debounce(function(e) {
          var filter = searchInput.val().toLowerCase();
          that.doFilter(filter, list);
          return false;
        }, 100)
      );

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
      list
        .find(`[data-filter-tags]:not([data-filter-tags*="${text}"])`)
        .removeClass("filter-show")
        .addClass("hidden");

      list
        .find(`[data-filter-tags*="${text}"]`)
        .removeClass("hidden")
        .addClass("filter-show");
    } else {
      list.find("[data-filter-tags]").removeClass("hidden filter-show");
    }
  }
}
