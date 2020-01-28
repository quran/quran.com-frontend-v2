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

    if (this.el.is(":visible")) {
      this.appear();
    } else {
      this.bindVisibleListener();
    }
  }

  appear() {
    if (this.el.data("more")) return;

    this.el.data("more", true);

    if (this.el.height() > 60) {
      this.el.uniqueId();
      let id = this.el.addClass("collapse read-more").attr("id");

      this.el.after(
        `<a class='readmore-control text-success' data-toggle='collapse' href='#${id}' aria-expanded='false' aria-controls='#${id}' id='readmore-${id}'></a>`
      );
    }
  }

  bindVisibleListener() {
    let that = this;
    let observer = new IntersectionObserver(
      function(entries) {
        var entry = entries[0];

        if (entry.intersectionRatio > 0) {
          that.appear();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: [0.25, 0.5, 0.75, 1.0]
      }
    );

    observer.observe(this.element);
  }

  disconnect() {
    this.el.removeClass("collapse");
    this.el.removeData("more");
    let readMore = `readmore-${this.el.attr("id")}`;

    $(`#${readMore}`).remove();
  }
}
