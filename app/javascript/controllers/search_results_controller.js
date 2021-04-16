import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    const el = $(this.element)
    this.selects = el.find(".simple-select").select2({
      dropdownAutoWidth: true,
      width: "100%",
      dropdownCssClass: "select-stylee",
      placeholder: "selected option"
    });

    el.find(".simple-select").on('change', (e) => {
      el.find('form').submit();
    })
  }

  disconnect() {
    const select = this.selects.data("select2");
    if (select) select.destroy();
  }
}
