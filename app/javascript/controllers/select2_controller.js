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
    let el = $(this.element);

    let options = {allowClear: true};

    if (el.data("multiple")) {
      options["multiple"] = true;
    }

    if (el.data("tags")) {
      options["tags"] = true;
    }

    if (el.data("parent")) options["dropdownParent"] = $(el.data("parent"));

    options["templateResult"] = item => {
      return this.dropdownItemTemplate(item);
    };

    this.select = el.select2(options);
  }

  dropdownItemTemplate(item) {
    if (item.loading) return item.text;

    if (item.element && item.element.dataset.description) {
      let container = $(`
        <div class='select2-result'>
           <strong>${item.text}</strong>
          <div class='select2-result__title'>${item.element.dataset.description}</div>
      </div>`);

      return container;
    } else {
      return item.text;
    }
  }

  disconnect() {
    const select = this.select.data('select2');
    if (select) select.destroy();
  }
}
