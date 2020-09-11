// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import SettingController from "./setting_controller";

export default class extends SettingController {
  connect() {
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
