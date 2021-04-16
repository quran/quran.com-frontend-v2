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
import DeviceDetector from "../utility/deviceDetector";

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
    this.el = el;

    this.bindAction(el);

    if (el.find(".arabic").hasClass("text_uthmani_tajweed")) {
      this.fixTajweedForSarari();
      this.bindTajweedTooltip();
    }
  }

  disconnect() {
  }

  copy() {
    copyToClipboard(this.copyText);

    const copyBtn = this.el.find(".quick-copy");
    let {title, done} = copyBtn.data();
    copyBtn.find("span").text(done);
    setTimeout(() => {
      copyBtn.find("span").text(title);
    }, 2000);
  }

  togglePlay(playButton) {
    let player,
      playerDom = document.getElementById("player");

    if (!playerDom) return;
    player = playerDom.player;

    if (playButton.find("span").hasClass("icon-play1")) {
      return player.playVerse(this.verseKey);
    } else {
      player.pauseCurrent();
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

  fixTajweedForSarari(){
    const deviceDetector = new DeviceDetector();

     if(deviceDetector.isSafari()){
       const text = this.el.find(".arabic").html()
       const textWithZwj = this.addZwj(text);
       //console.log("text before", text);
       //console.log("text after", textWithZwj);

       this.el.find(".arabic").html(textWithZwj);
     }
  }

  addZwj(text){
   return  text.replace(/([ئبت-خس-غف-نهيی])([^ء-يی\n ]*<[^>]+>[ً-ْٰۖۗۚۛۜ]*)(?=[آ-يی])/g, '$1&zwj;$2&zwj;');
  }

  bindAction(el) {
    if (el.data('reading')) {
      return
    }

    this.actionOpened = false;
    this.actionTrigger = el.find("#open-actions");
    this.actionTrigger.on("click", e => this.toggleActions(e));

    this.element
      .querySelector("#close-actions")
      .addEventListener("click", e => {
        e.stopImmediatePropagation();
        this.closeAction();
      });

    el.find(".quick-copy").on("click", e => {
      e.preventDefault();
      this.copy();
    });

    let playButton = el.find(".play");

    playButton.on("click", event => {
      event.preventDefault();
      this.togglePlay(playButton);
    });
  }

  toggleActions(event) {
    if (this.actionOpened) {
      this.closeAction();
    } else {
      this.openAction();
    }
  }

  openAction() {
    this.onClicked = this.click.bind(this);
    this.el.find(".actions-wrapper").removeClass("hidden");
    document.addEventListener("click", this.onClicked);

    setTimeout(() => {
      this.actionOpened = true;
    }, 100);
  }

  closeAction() {
    this.actionOpened = false;
    this.el.find(".actions-wrapper").addClass("hidden");
    document.removeEventListener("click", this.onClicked);
  }

  click(event) {
    const target = event.target;
    const clickedOut = !isChildOf(
      this.element.querySelector("#ayah-actions"),
      target
    );

    if (this.actionOpened && clickedOut) {
      this.closeAction();
    }
    return true;
  }

  get verseNumber() {
    return this.el.data("verseNumber");
  }

  get verseKey(){
    return this.el.data("key");
  }

  get copyText() {
    return this.el.data("text");
  }
}
