// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="ajax-modal" data-url="url-to-load-content">
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    $(this.element).on("click", e => {
      if ($(e.target).hasClass("disabled")) return;

      this.loadModal(e);
    });
  }

  loadModal(e) {
    var that = this;
    e.preventDefault();
    e.stopImmediatePropagation();

    let target = $(e.currentTarget);
    let url = target.data("url");
    let classes = target.data("class");

    this.createModel(classes);

    $("#ajax-modal").on("hidden.bs.modal", function(e) {
      $("#ajax-modal")
        .empty()
        .remove();
    });

    $.get(url, data => {})
      .done(content => {
        const response = $("<div>").html(content);
        const responseBody = response.find("#body");
        that.dialog.find("#modal-title").html(response.find("#title").html());
        that.dialog.find("#modal-body").html(response.find("#modal").html());
      })
      .fail(err => {
        //TODO: show error
      });
  }

  createModel(classes) {
    if ($(".modal").length > 0) {
      $(".modal").remove();
      $(".modal-backdrop").remove();
    }

    let modal = `
        <div class="modal" tabindex="-1" role="dialog" id="ajax-modal">
  <div class='modal-dialog ${classes}' role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modal-title">Loading</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div id="modal-body">
      <div class="modal-body" id="modal-body">
        <p class="text-center"><i class="fa fa-spinner animate-spin fa-2x my-3"></i> Loading...</p>
      </div>
        <div class="modal-footer" id="modal-footer">
          <a data-dismiss="modal" class="btn btn-secondary" href="#">Close</a>
        </div>
      </div>
    </div>
  </div>
</div>
`;

    this.dialog = $(modal);
    this.dialog.appendTo("body");

    $("#ajax-modal").on("hidden.bs.modal", function(e) {
      $("#ajax-modal")
        .empty()
        .remove();
    });

    this.dialog.modal({ backdrop: "static" });
  }
}
