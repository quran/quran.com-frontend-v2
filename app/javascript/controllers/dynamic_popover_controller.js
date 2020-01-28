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
    this.loaded = false;
    this.el = $(this.element);
    this.autoClose = true;
    let triggerOnHover = "hover" == this.el.data("trigger");
    let url = this.el.data("url");

    this.el.on("click", event => {
      if (!this.loaded) this.loadCard(url, triggerOnHover ? "hover" : "click");
    });

    if (triggerOnHover) {
      this.el.mouseenter(event => {
        if (!this.loaded) this.loadCard(url, "hover");
      });
    }

    let that = this;
    $(document).on("click", e => {
      var dom = $(e.target);
      //TODO: clean this
      if (dom.closest(".popover-body").length == 0) {
        if (that.loaded) {
          that.autoClose && that.el.popover("dispose");
          that.loaded = false;
        }
      } else if ("A" == $(e.target).prop("tagName")) {
        that.autoClose && that.el.popover("dispose");
        that.loaded = false;
      }
    });
  }

  dismiss() {}

  disconnect() {
    this.el.off("click");
    this.el.off("mouseenter");
    this.el = null;
  }

  loadCard(url, trigger) {
    $(".round-card.popup").remove();
    var that = this;

    $.get(url, data => {
      that.loaded = true;
    })
      .done(content => {
        that.loaded = true;

        that.el.popover({
          html: true,
          sanitize: false,
          trigger: trigger,
          template: `<div class="popover round-card popup alert alert-dismissible" role="tooltip">
                       <div class="arrow"></div>
                       <div class="popover-body"></div>
                       </div>`,
          content: content
        });

        that.el.popover("show");
        that.autoClose = true;
      })
      .fail(err => {});
  }
}
