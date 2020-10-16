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
    let tooltipSwitch = $("#tooltip-switch");

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

    tooltipSwitch.on("change", () => {
      const enabled = tooltipSwitch.is(":checked");
      this.set("autoShowWordTooltip", enabled);
    });

    repeatSwitch[0].checked = this.get("repeatEnabled");
    tooltipSwitch[0].checked = this.get("autoShowWordTooltip");

    repeatSwitch.trigger("change");
    tooltipSwitch.trigger("change");
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
    this.repeatRangeTo.attr("disabled", true);

    this.repeatRangeFrom.on("change", e => {
      const from = Number(this.repeatRangeFrom.val());
      this.repeatRangeTo.val(0);

      this.repeatRangeTo.find("option").each((i, option) => {
        // disable all options which are less then repeat start
        const val = Number(option.value);
        option.disabled = val > 0 && val < from;
      });

      this.repeatRangeTo.attr("disabled", false);

      this.updateRepeatRange();
    });
    this.repeatRangeTo.on("change", () => this.updateRepeatRange());
    this.repeatRangeTimes.on("change", () => this.updateRepeatRange());

    let rangeTab = document.querySelector("#repeat-range");
    rangeTab.addEventListener("shown.bs.tab", () => this.updateRepeatRange());
  }

  updateRepeatSingle() {
    const verseToRepeat = Number(this.repeatSingle.val());
    this.set("repeatType", "single");
    this.set("repeatCount", Number(this.repeatSingleTimes.val()));
    this.set("repeatAyah", verseToRepeat);

    this.updatePlayerRepeat();
  }

  jumpTo(verse) {
    let controller = document.getElementById("chapter-tabs");
    return controller.chapter.loadVerses(verse);
  }

  updateRepeatRange() {
    const rangeStart = Number(this.repeatRangeFrom.val());
    this.set("repeatType", "range");

    this.set("repeatCount", Number(this.repeatRangeTimes.val()));
    this.set("repeatFrom", rangeStart);
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

    let player,
      playerDom = document.getElementById("player");

    if (playerDom) player = playerDom.player;
    if (player) {
      return player.updatePause(this.get("pauseBwAyah"));
    }
  }

  updatePlayerRepeat() {
    let verseToRepeat = 0;
    let first, last;

    if ("single" == this.settings.repeatType) {
      verseToRepeat = this.settings.repeatAyah;
      first = verseToRepeat;
      last = first + 5;
    } else {
      verseToRepeat = this.settings.repeatFrom;
      first = verseToRepeat;
      last = this.settings.repeatTo;
    }

    if (verseToRepeat > 0) {
      document.body.loader.show();

      this.jumpTo(verseToRepeat).then(() => {
        document.body.loader.hide();

        let player,
          playerDom = document.getElementById("player");

        if (playerDom) player = playerDom.player;
        if (player) {
          return player.updateRepeatConfig(this.settings, { first, last });
        }
      });
    }
  }
}
