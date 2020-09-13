// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="verse" data-verse=VERSE_NUMBER>
// </div>

import { Controller } from "stimulus";
import copyToClipboard from "copy-to-clipboard";
import Tooltip from "bootstrap/js/src/tooltip";

const TAJWEED_RULE_DESCRIPTION = {
  ham_wasl: "Hamzat ul Wasl",
  slnt: "Silent",
  laam_shamsiyah: "Lam Shamsiyyah",
  madda_normal: "Normal Prolongation: 2 Vowels",
  madda_permissible: "Permissible Prolongation: 2, 4, 6 Vowels",
  madda_necessary: "Necessary Prolongation: 6 Vowels",
  madda_obligatory: "Obligatory Prolongation: 4-5 Vowels",
  qalaqah: "Qalaqah",
  ikhafa_shafawi: "Ikhafa' Shafawi - With Meem",
  ikhafa: "Ikhafa'",
  iqlab: "Iqlab",
  idgham_shafawi: "Idgham Shafawi - With Meem",
  idgham_ghunnah: "Idgham - With Ghunnah",
  idgham_wo_ghunnah: "Idgham - Without Ghunnah",
  idgham_mutajanisayn: "Idgham - Mutajanisayn",
  idgham_mutaqaribayn: "Idgham - Mutaqaribayn",
  ghunnah: "Ghunnah: 2 Vowels"
};

const TAJWEED_RULES = [
  "ham_wasl",
  "slnt",
  "laam_shamsiyah",
  "madda_normal",
  "madda_permissible",
  "madda_necessary",
  "madda_obligatory",
  "qalaqah",
  "ikhafa_shafawi",
  "ikhafa",
  "iqlab",
  "idgham_shafawi",
  "idgham_ghunnah",
  "idgham_wo_ghunnah",
  "idgham_mutajanisayn",
  "idgham_mutaqaribayn",
  "ghunnah"
];

export default class extends Controller {
  static targets = ["actions"];

  connect() {
    this.el = $(this.element);

    /*if (
      this.el.find(".arabic").height() + this.el.find(".translation").height() <
      20
    ) {
      this.actionsTarget.classList.add("col-md-12", "order-md-1");
      this.actionsTarget.children[0].classList.remove("flex-md-column");
      this.actionsTarget.children[0].classList.add("justify-content-md-evenly");
      this.element.classList.add("pb-md-2");
    }*/

    this.element.querySelectorAll(".ayah-action").forEach(actionDom => {
      new Tooltip(actionDom, {
        trigger: "hover",
        placement: "right",
        html: true,
        template:
          "<div class='tooltip bs-tooltip-top' role='tooltip'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>",
        title: () => {
          const locale = window.locale;
          return `<div class='${locale}'>${actionDom.dataset.title}</div>`;
        }
      });
    });

    let copyDom = this.el.find(".copy");

    copyDom.click(e => {
      e.preventDefault();
      this.copy();
    });

    this.copyDom = copyDom;

    this.playButton = this.el.find(".play-verse");

    this.playButton.on("click", event => {
      event.preventDefault();
      //event.stopImmediatePropagation();

      let player,
        playerDom = document.getElementById("player");

      if (playerDom) player = playerDom.player;

      if (this.playButton.find(".fa").hasClass("fa-play-solid")) {
        if (player) {
          return player.play(this.el.data("verseNumber"));
        }
      } else {
        if (player) {
          player.handlePauseBtnClick();
        }
      }
    });

    if (this.el.find(".arabic").hasClass("text_uthmani_tajweed")) {
      this.bindTajweedTooltip();
    }
  }

  disconnect() {}

  copy() {
    copyToClipboard(this.el.data("text"));

    let title = this.copyDom.data("original-title");
    let done = this.copyDom.attr("done");

    this.copyDom
      .attr("title", done)
      .tooltip("_fixTitle")
      .tooltip("show");
    this.copyDom.on("hidden.bs.tooltip", () =>
      this.copyDom.attr("title", title).tooltip("_fixTitle")
    );
  }

  bindTajweedTooltip() {
    let dom = this.element;

    TAJWEED_RULES.forEach(name => {
      dom.querySelectorAll(`.${name}`).forEach(tajweed => {
        new Tooltip(tajweed, {
          title: TAJWEED_RULE_DESCRIPTION[name],
          html: true,
          direction: "top"
        });
      });
    });
  }
}
