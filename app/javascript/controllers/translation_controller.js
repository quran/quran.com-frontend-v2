import { Controller } from "stimulus";
import Tooltip from "bootstrap/js/src/tooltip";

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
      e.stopImmediatePropagation();

      let target = e.target;

      let id = target.getAttribute("foot_note");

      if (id && id.length > 0) {
        fetch(`/foot_note/${id}`, {headers: {"X-Requested-With": "XMLHttpRequest"}})
      }
    });

    foodnotes.each((i, dom) => {
      let text = dom.innerText.replace(" ", "");

      if (PRE_DEFINED_FOOTNOTES[text]) {
        new Tooltip(dom, {
          title: PRE_DEFINED_FOOTNOTES[text],
          html: true,
          direction: "top"
        });
      }
    });
  }

  disconnect() {
    //this.el.find("sup").tooltip("dispose");
  }
}
