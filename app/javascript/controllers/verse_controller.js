// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="verse" data-verse=VERSE_NUMBER>
// </div>

import { Controller } from "stimulus";
import copyToClipboard from "copy-to-clipboard";

export default class extends Controller {
  connect() {
    this.el = $(this.element);
    $(this.el)
      .find("[data-toggle=tooltip]")
      .tooltip();
    let copyDom = this.el.find(".copy");

    copyDom.click(e => {
      e.preventDefault();
      this.copy();
    });

    this.copyDom = copyDom;

    let foodnotes = this.el.find(".translation sup");

    foodnotes.click(e => {
      e.preventDefault();
      let id = $(e.target).attr("foot_note");
      $.get(`/foot_note/${id}`);
    });

    this.playButton = this.el.find(".play-verse");

    this.playButton.on("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();

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
  }

  disconnect() {}

  copy() {
    copyToClipboard(this.el.find(".text").text());

    let title = this.copyDom.data("original-title");
    let done = this.copyDom.attr("done");

    this.copyDom
      .attr("title", done)
      .tooltip("_fixTitle")
      .tooltip("show");
    this.copyDom.on("hidden.bs.tooltip", () =>
      this.copyDom.attr("title", title).tooltip("_fixTitle")
    );

    GoogleAnalytic.trackEvent("Copy", "Verse", this.el.data("key"), 1);
  }

  share() {}
}
