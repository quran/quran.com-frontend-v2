import SettingController from "./setting_controller";

export default class extends SettingController {
  connect() {
    super.connect();
    this.bindSwitch();
    this.bindRepeatSingle();
    this.bindRepeatRange();
    this.bindPause();
  }

  bindSwitch() {
    let repeatSwitch = $("#repeat-switch");

    repeatSwitch.on("change", () => {
      const enabled = repeatSwitch.is(":checked");
      this.set("repeatEnabled", enabled);
      this.updatePlayerRepeat();

      if (enabled) {
        $("#repeat-wrapper").removeClass("d-none fade");
      } else {
        $("#repeat-wrapper").addClass("d-none fade");
      }
    });

    repeatSwitch[0].checked = this.get("repeatEnabled");
    repeatSwitch.trigger("change");
  }

  bindRepeatSingle() {
    this.repeatSingle = $("#repeat-single-ayah");
    this.repeatSingleTimes = $("#repeat-single-times");

    this.repeatSingle.on("change", () => this.updateRepeatSingle());
    this.repeatSingleTimes.on("change", () => this.updateRepeatSingle());

    let signeTab = document.querySelector("#repeat-single");
    signeTab.addEventListener("shown.bs.tab", () => this.updateRepeatSingle());
  }

  bindRepeatRange() {
    this.repeatRangeFrom = $("#repeat-range-from");
    this.repeatRangeTo = $("#repeat-range-to");
    this.repeatRangeTimes = $("#repeat-range-times");

    this.repeatRangeFrom.on("change", () => this.updateRepeatRange());
    this.repeatRangeTo.on("change", () => this.updateRepeatRange());
    this.repeatRangeTimes.on("change", () => this.updateRepeatRange());

    let rangeTab = document.querySelector("#repeat-range");
    rangeTab.addEventListener("shown.bs.tab", () => this.updateRepeatRange());
  }

  updateRepeatSingle() {
    this.set("repeatType", "single");
    this.set("repeatCount", Number(this.repeatSingleTimes.val()));
    this.set("repeatAyah", Number(this.repeatSingle.val()));

    this.updatePlayerRepeat();
  }

  updateRepeatRange() {
    this.set("repeatType", "range");

    this.set("repeatCount", Number(this.repeatRangeTimes.val()));
    this.set("repeatFrom", Number(this.repeatRangeFrom.val()));
    this.set("repeatTo", Number(this.repeatRangeTo.val()));

    this.updatePlayerRepeat();
  }

  bindPause() {
    const pause = $("#pause-ayah");
    const pauseSelect = $("#pause-bw-ayah-seconds");
    let enablePause = pause.is(":checked");

    $("[name='pause-bw-ayah']").on("change", () => {
      enablePause = pause.is(":checked");
      this.updatePause(enablePause, pauseSelect.val());
    });

    pauseSelect.on("change", () => {
      this.updatePause(enablePause, pauseSelect.val());
    });
  }

  updatePause(enabled, seconds) {
    if (enabled) this.set("pauseBwAyah", Number(seconds));
    else this.set("pauseBwAyah", 0);

    this.updatePlayerRepeat();
  }

  updatePlayerRepeat() {
    let player,
      playerDom = document.getElementById("player");

    if (playerDom) player = playerDom.player;
    if (player) {
      return player.updateRepeatConfig(this.settings);
    }
  }
}
