// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="ajax-modal" data-url="url-to-load-content">
// </div>

import { Controller } from "stimulus";
import { Modal } from "bootstrap";

export default class extends Controller {
  connect() {
    this.element.addEventListener("click", e => {
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
    let ajaxModal = document.getElementById("#ajax-modal");

    this.removeModal(ajaxModal);

    let modal = `
    <div class="modal" tabindex="-1" id="ajax-modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modal-title">Loading</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="modal-body">
        <p class="text-center"><i class="fa fa-spinner animate-spin fa-2x my-3"></i> Loading...</p>
      </div>
      <div class="modal-footer" id="modal-footer>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;

    document.body.append(modal);

    ajaxModal.addEventListener("hidden.bs.modal", () => {
      this.removeModal(ajaxModal);
    });

    this.dialog = new Modal(ajaxModal, { backdrop: "static" });
  }

  removeModal(modal) {
    if (modal) {
      // can also use dom.remove, but parentNode.removeChild
      document.body.removeChild(modal);

      let backdrop = document.getElementsByClassName("modal-backdrop");
      if (backdrop) document.body.removeChild(backdrop);
    }
  }
}
