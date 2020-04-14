import { Controller } from "stimulus";

var PRE_DEFINED_FOOTNOTES = {
  sg: "Singular",
  pl: "Plural"
};

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    this.bindFootnotes();
  }

  bindFootnotes() {
    let foodnotes = this.el.find("sup");

    foodnotes.click(e => {
      e.preventDefault();
      let target = e.target;

      let id = target.getAttribute("foot_note");

      if (id && id.length > 0) {
        $.get(`/foot_note/${id}`);
      }
    });

    foodnotes.each((i, dom) => {
      let text = dom.innerText.replace(" ", "");

      if (PRE_DEFINED_FOOTNOTES[text]) {
        $(dom).tooltip({ title: PRE_DEFINED_FOOTNOTES[text] });
      }
    });
  }

  disconnect() {
    this.el.find("sup").tooltip("dispose");
  }
}
