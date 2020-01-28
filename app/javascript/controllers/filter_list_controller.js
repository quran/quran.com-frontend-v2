// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "stimulus";
import { debounce } from "lodash-es";

export default class extends Controller {
  connect() {
    this.listFilter(
      $(this.element).data("list"),
      $(this.element).data("input")
    );
  }

  listFilter(list, input) {
    /* on change keyboard */
    $(input)
      .change(function() {
        var filter = $(this)
          .val()
          .toLowerCase();

        /* when user types more than 1 letter start search filter */
        if (filter.length > 1) {
          $(list)
            .find(
              "[data-filter-tags]:not([data-filter-tags*='" + filter + "'])"
            )
            .removeClass("js-filter-show")
            .addClass("js-filter-hide");

          $(list)
            .find("[data-filter-tags*='" + filter + "']")
            .removeClass("js-filter-hide")
            .addClass("js-filter-show");
        } else {
          $(list)
            .find("[data-filter-tags]")
            .removeClass("js-filter-hide js-filter-show");
        }

        return false;
      })
      .keyup(() => {
        $(input).change();
      });
  }
}
