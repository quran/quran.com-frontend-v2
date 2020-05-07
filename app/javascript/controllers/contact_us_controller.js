import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    let form = $(this.element);

    form.on("ajax:success", (event, xhr) => {
      const defaultThankYouMsg = "";

      form
        .find(".alert")
        .html(xhr.message || defaultThankYouMsg)
        .removeClass("d-none");

      $(".waves-ripple").remove();
      form[0].reset();
    });

    form.on("ajax:error", event => {
      form
        .find(".alert")
        .html("Sorry, something went wrong. We'll fix this issue soon.")
        .addClass("alert-danger")
        .removeClass("d-none");

      $(".waves-ripple").remove();
    });
  }
}
