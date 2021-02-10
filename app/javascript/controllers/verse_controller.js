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
import isChildOf from "../utility/child-of";

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
    const el = $(this.element);
    this.bindAction(el);

    if (el.find(".arabic").hasClass("text_uthmani_tajweed")) {
      this.bindTajweedTooltip();
    }

    this.el = el;
  }

  disconnect() {
  }

  copy() {
    copyToClipboard(this.copyText);

    const copyBtn = this.el.find('.quick-copy');
    let {title, done} = copyBtn.data();
    copyBtn.find('span').text(done);
    setTimeout(() => {
      copyBtn.find('span').text(title)
    }, 2000);
  }

  togglePlay(playButton) {
    let player,
      playerDom = document.getElementById("player");

    if (!playerDom) return;
    player = playerDom.player;

    if (playButton.find("span").hasClass("icon-play1")) {
      return player.play(this.verseNumber);
    } else {
      player.handlePauseBtnClick();
    }
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

  bindAction(el) {
    el.find('.open-actions').on('click', e => {
      el.find('.actions-wrapper').toggleClass('hidden');
    })

    el.find('.quick-copy').on('click', e => {
      e.preventDefault();
      this.copy();
    })

    let playButton = el.find(".play");

    playButton.on("click", event => {
      event.preventDefault();
      this.togglePlay(playButton);
    });
  }

  get verseNumber() {
    return this.el.data("verseNumber")
  }

  get copyText() {
    return this.el.data("text")
  }
}
