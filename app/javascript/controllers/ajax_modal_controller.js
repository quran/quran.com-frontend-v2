// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="ajax-modal" data-url="url-to-load-content">
// </div>

import { Controller } from "stimulus";
import Modal from "bootstrap/js/src/modal";

export default class extends Controller {
  connect() {
    this.element.addEventListener("click", e => this.loadModal(e));
  }

  loadModal(e) {
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

    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then(resp => resp.text())
      .then(content => {
        const response = $("<div>").html(content);
        document.getElementById("ajax-modal-title").innerHTML = response
          .find("#title")
          .html();
        document.getElementById("ajax-modal-body").innerHTML = response
          .find("#modal")
          .html();
      })
      .catch(err => {
        //TODO: show error
      });
  }

  createModel(classes) {
    this.removeModal("#ajax-modal");
    $(".actions-wrapper").addClass("hidden");
    let modal;

    modal = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text text--black" id="ajax-modal-title">Loading</h5>
              <a class="close text--green" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" class="icon-times-circle"></span>
              </a>
            </div>
            <div class="modal-body" id="ajax-modal-body">
              <p class="text-center"><span class='spinner text text--grey'><i class='spinner--swirl'></i></span> Loading...</p>
            </div>
          </div>
        </div>`;

    let ajaxModal = document.createElement("div");
    ajaxModal.classList.add("modal");
    ajaxModal.id = "ajax-modal";
    ajaxModal.innerHTML = modal;
    document.body.append(ajaxModal);

    ajaxModal.addEventListener("hidden.bs.modal", () => {
      this.removeModal(ajaxModal);
    });

    global.dialog = new Modal(ajaxModal, { backdrop: "static" });
    global.dialog.show();
  }

  removeModal() {
    let modal = document.getElementById("ajax-modal");
    if (modal) {
      // can also use dom.remove, but parentNode.removeChild
      document.body.removeChild(modal);

      let backdrop = document.getElementsByClassName("modal-backdrop");
      if (backdrop && backdrop.length > 0)
        document.body.removeChild(backdrop[0]);
    }
  }
}
