// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="word">
// </div>

import {Controller} from "stimulus";
import Tooltip from "bootstrap/js/src/tooltip";

export default class extends Controller {
  connect() {
    super.connect();
    let el = this.element;
    const dataset = el.dataset;

    el.tooltip = new Tooltip(el, {
      trigger: "hover",
      placement: "top",
      html: true,
      sanitize: false,
      template:
        "<div class='tooltip bs-tooltip-top' role='tooltip'><div class='arrow'></div><div class='tooltip-inner'></div></div>",
      title: () => {
        const local = dataset.local;
        const tooltip = document.body.setting.get("tooltip");

        const text = dataset[tooltip];
        return `<div class='${local}'>${text}</div>`;
      }
    });

    this.bindEvents();
    this.el = el;
  }

  dbClick() {
    let player,
      playerDom = document.getElementById("player");

    if (playerDom) player = playerDom.player;
    //if (player) {
    //  return player.seekToWord(this.el.dataset.position);
    //}
  }

  disconnect() {
    this.el.removeEventListener("click", () => {
    });
    this.el.removeEventListener("dblclick", () => {
    });

    if (this.el.tooltip) {
      this.el.tooltip.dispose()
    }
  }

  play() {
    let wordPlayer;
    let playerDom = document.getElementById("player");

    if (playerDom) wordPlayer = playerDom.wordPlayer;

    if (wordPlayer) {
      const {audio, key} = this.element.dataset;
      GoogleAnalytic.trackEvent("Play Word", "Play", key, 1);
      wordPlayer.play(audio);
    }
  }

  bindEvents() {
    this.element.addEventListener("dblclick", e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.dbClick(e);
    });

    this.element.addEventListener("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.play()
    });
  }
}
