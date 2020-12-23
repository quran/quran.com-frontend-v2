// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="verse" data-verse=VERSE_NUMBER>
// </div>

import {Controller} from "stimulus";
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
  connect() {
    let el = $(this.element);

    this.bindAyahActions(el);
    this.bindAyahRangeSelection(el);

    if (el.find(".arabic").hasClass("text_uthmani_tajweed")) {
      this.bindTajweedTooltip();
    }

    this.el = el;
  }

  bindAyahRangeSelection(el) {
    el.find('.arabic')
      .on('mouseup', () => this.wrapWordRange(el));
  }

  wrapWordRange(el) {
    $('.word.in-range').unwrap($('.word-range'))
    $('.word.in-range').removeClass('in-range');

    const selection = document.getSelection();

    let startPosition, endPosition;

    if(selection){
       let start = selection.anchorNode.parentElement;
       let end = selection.extentNode.parentElement;

      let p1 = start.dataset.position;
      let p2 = end.dataset.position;

      startPosition = Math.min(p1, p2);
      endPosition = Math.max(p1, p2);

      for(let i=startPosition; i <= endPosition; i++){
          el.find(`[data-position=${i}]`).addClass('in-range');
      }

      $(".word.in-range").wrapAll("<span class='word-range' data-controller='words-range'/>");
    }
  }

  bindAyahActions(el) {
    //TODO: enable these action only for reading mode.
    this.element.querySelectorAll(".ayah-action").forEach(actionDom => {
      actionDom.tooltip = new Tooltip(actionDom, {
        trigger: "hover",
        placement: "right",
        html: true,
        sanitize: false,
        template:
          "<div class='tooltip bs-tooltip-top' role='tooltip'><div class='tooltip-arrow'></div><div class='tooltip-inner'></div></div>",
        title: () => {
          const locale = window.locale;
          return `<div class='${locale}'>${actionDom.dataset.title}</div>`;
        }
      });
    });

    let copyDom = this.element.querySelector(".copy");
    copyDom && copyDom.addEventListener('click', e => {
      e.preventDefault();
      this.copy();
    });

    this.copyDom = copyDom;

    let playButton = el.find(".ayah-action.play");

    playButton.on("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      let player,
        playerDom = document.getElementById("player");

      if (playerDom) player = playerDom.player;

      if (playButton.find(".fa").hasClass("fa-play-circle")) {
        if (player) {
          return player.play(el.data("verseNumber"));
        }
      } else {
        if (player) {
          player.handlePauseBtnClick();
        }
      }
    });
  }

  disconnect() {
  }

  copy() {
    copyToClipboard(this.el.data("text"));

    let {title, done} = this.copyDom.dataset;

    this.copyDom.title = `<div class='${window.locale}'>${done}</div>`
    this.copyDom.tooltip._fixTitle()

    this.copyDom.tooltip.show();

    this.copyDom.addEventListener("hidden.bs.tooltip", () => {
        this.copyDom.setAttribute("title", title);
        this.copyDom.tooltip._fixTitle()
      }
    );
  }

  bindTajweedTooltip() {
    let dom = this.element;

    TAJWEED_RULES.forEach(name => {
      dom.querySelectorAll(`.${name}`).forEach(tajweed => {
        new Tooltip(tajweed, {
          title: TAJWEED_RULE_DESCRIPTION[name],
          html: true,
          sanitize: false,
          direction: "top"
        });
      });
    });
  }
}
