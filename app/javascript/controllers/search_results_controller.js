import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    this.selects = $(".simple-select").select2({
      dropdownAutoWidth: true,
      width: "100%",
      dropdownCssClass: "select-stylee",
      placeholder: "selected option"
    });
  }

  disconnect() {
    const select = this.selects.data("select2");
    if (select) select.destroy();
  }
}
