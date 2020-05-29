import { Controller } from "stimulus";

var PRE_DEFINED_FOOTNOTES = {
  sg: "Singular",
  pl: "Plural",
  dl:
    "<b>Dual</b> <br/> A form for verbs and pronouns in Arabic language when addressing two people" //A form for verbs and pronouns in Arabic language when addressing two people
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
        $.rails.ajax(`/foot_note/${id}`);
      }
    });

    foodnotes.each((i, dom) => {
      let text = dom.innerText.replace(" ", "");

      if (PRE_DEFINED_FOOTNOTES[text]) {
        $(dom).tooltip({ title: PRE_DEFINED_FOOTNOTES[text], html: true });
      }
    });
  }

  disconnect() {
    this.el.find("sup").tooltip("dispose");
  }
}
