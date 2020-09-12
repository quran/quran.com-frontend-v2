// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import SettingController from "./setting_controller";
import Tooltip from "bootstrap/js/src/tooltip";

const recitationStyles = {
  mujawwad: "Mujawwad is a melodic style of Holy Quran recitation",
  murattal: "Murattal is at a slower pace, used for study and practice",
  muallim: "Muallim is teaching style recitation of Holy Quran"
}

export default class extends SettingController {
  connect() {
    super.connect()

    const recitation = this.get("recitation");

    this.element.querySelectorAll("[name=recitation]").forEach(reciter => {
      if (recitation == reciter.value) {
        reciter.setAttribute("checked", "checked");
      }
    });

    $(this.element)
      .find("[name=recitation]")
      .on("change", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.updateReciter(e.target.value);
      });

    $(this.element)
      .find("[name=recitation]")


    this.element.querySelectorAll('[data-style]').forEach(elem =>{
      new Tooltip(elem, {direction: 'left', title: recitationStyles[elem.dataset.style]})
    })
  }

  disconnect() {
    $(document).off("change", "[name=font]", e => {
    });
  }

  updateReciter(newRecitation) {
    let playerDom = document.getElementById("player");
    let player = playerDom.player;
    this.set("recitation", newRecitation)

    player.setRecitation(newRecitation);
  }
}
