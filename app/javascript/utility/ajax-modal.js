import Modal from "bootstrap/js/src/modal";

class AjaxModal {
  loadModal(url, cssClasses) {
    this.createModel(cssClasses);

    $("#ajax-modal").on("hidden.bs.modal", function (e) {
      $("#ajax-modal")
        .empty()
        .remove();
    });

    fetch(url, {headers: {"X-Requested-With": "XMLHttpRequest"}})
      .then(resp => resp.text())
      .then(content => {
        const response = $("<div>").html(content);

        const title = response
          .find("#title")
          .html();

        const body = response
          .find("#modal")
          .html();

        if(title && title.length > 0){
          document.getElementById("ajax-modal-title").innerHTML = title
          document.getElementById("ajax-modal-body").innerHTML = body
        }
      })
      .catch(err => {
        //TODO: show error
      });
  }

  createModel(classes='') {
    this.removeModal("ajax-modal");

    $(".actions-wrapper").addClass("hidden");
    let modal;

    modal = `
        <div class="modal-dialog ${classes}">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title text text--black" id="ajax-modal-title">Loading</h5>
              <a class="close text--green" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" class="quran-icon icon-times-circle"></span>
              </a>
            </div>

            <div id="ajax-modal-body">
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
      this.removeModal();
    });

    // expose modal to global
    // we want to hide this from other classes( e.g when user click on tafsir link)
    global.dialog = new Modal(ajaxModal, {backdrop: "static"});
    global.dialog.show();
  }

  removeModal(id) {
    let modal = document.getElementById(id || "ajax-modal");
    if (modal) {
      document.body.removeChild(modal);

      let backdrop = document.getElementsByClassName("modal-backdrop");
      if (backdrop && backdrop.length > 0)
        document.body.removeChild(backdrop[0]);
    }
  }
}

export default AjaxModal;
