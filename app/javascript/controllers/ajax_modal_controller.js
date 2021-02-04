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
    this.element.addEventListener("click", e => {
      this.loadModal(e);
    });
  }

  loadModal(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    let target = $(e.currentTarget);
    let url = target.data("url");
    let classes = target.data("class");
    const type = target.data("type");
    this.createModel(classes, type);

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

  createModel(classes, type) {
    this.removeModal("#ajax-modal");
    $(".actions-wrapper").addClass("hidden");
    let modal;
    if(type == "copy"){
      modal = `
        <div class="copy-wrapper">
          <div class="copy">
            <div class="copy__header">
              <p class="text text--black text--large2 text--semibold" id="ajax-modal-title">Copy options</p>
              <div class="icon-x" id="advance-copy-wraper-close"></div>
            </div>
            <div id="ajax-modal-body"><p class="text-center">Loading..</p></div>
          </div>
        </div>
      `;
    }else{
      modal = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="ajax-modal-title">Loading</h5>
              <a class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" class="fa fa-times fa-center"></span>
              </a>
            </div>
            <div class="modal-body" id="ajax-modal-body">
              <p class="text-center"><i class="fa fa-spinner animate-spin fa-2x my-3"></i> Loading...</p>
            </div>
            <div class="modal-footer" id="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>`;
    }
    let ajaxModal = document.createElement("div");
    if(type != "copy")
      ajaxModal.classList.add("modal");
    ajaxModal.id = "ajax-modal";
    ajaxModal.innerHTML = modal;
    document.body.append(ajaxModal);
    if(type == "copy")
      document.querySelector("#advance-copy-wraper-close").addEventListener("click", () => this.removeModal());
    ajaxModal.addEventListener("hidden.bs.modal", () => {
      this.removeModal(ajaxModal);
    });
    if(type != "copy"){
      global.dialog = new Modal(ajaxModal, { backdrop: "static" });
      global.dialog.show(); 
    }
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
