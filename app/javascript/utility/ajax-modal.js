class AjaxModal {
  loadModal(url, title) {
    this.createModel(title);
    var that = this;

    $.get(url, data => {})
      .done(content => {
        const response = $("<div>").html(content);
        const responseBody = response.find("#body");
        that.dialog.find("#modal-title").html(response.find("#title").html());
        that.dialog.find("#body").html(response.find("#modal").html());
      })
      .fail(err => {
        if (401 == err.status) {
          that.dialog.find(".modal-body").html(
            `<h2>${err.responseText}</h2>
              <p><a href="/users/sign_in?return_to=${location.pathname}" class="btn btn-primary">Login</a></p>
              `
          );
        }
      });
  }

  createModel(title) {
    if ($("#ajax-modal").length > 0) $("#ajax-modal").remove();

    let modal = `
        <div class="modal" tabindex="-1" role="dialog" id="ajax-modal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modal-title">${title || "Loading..."}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div id="body">
      <div class="modal-body" id="modal-body">
        <p class="text-center"><i class="fa fa-spinner1 animate-spin fa-2x my-3"></i> Loading</p>
      </div>
      <div class="modal-footer" id="modal-footer"></div>
      </div>
    </div>
  </div>
</div>
`;
    this.dialog = $(modal);
    this.dialog.appendTo("body");
    this.dialog.modal({ backdrop: "static" });
  }
}

export default AjaxModal;
