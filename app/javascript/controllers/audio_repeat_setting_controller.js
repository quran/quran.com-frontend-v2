import SettingController from "./setting_controller";
import {getQuranReader} from "../utility/controller-helpers";
import {getAyahKey} from "../utility/quran_utils";

export default class extends SettingController {
  connect() {
    super.connect();
    const el=$(this.element);

    el.find('.simple-select').select2({
      dropdownAutoWidth: true,
      width: '100%',
      dropdownCssClass: 'select-stylee',
      placeholder: 'selected option',
      //minimumResultsForSearch: -1 // hide search box
    });

    this.pageMode = this.element.dataset.pageMode == 'true'

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
        $(".audio-control").removeClass("hidden fade");
      } else {
        $(".audio-control").addClass("hidden fade");
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

    let singleTab = document.querySelector("#repeat-single");
    singleTab.addEventListener("shown.bs.tab", () => this.updateRepeatSingle());
    singleTab.addEventListener("change", () => this.toggle());
  }

  toggle() {
    document.querySelector(".single-ayah").classList.toggle("hidden");
    document.querySelector(".range-ayah").classList.toggle("hidden");
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
    rangeTab.addEventListener("change", () => this.toggle());
  }

  updateRepeatSingle() {
    const verseToRepeat = this.repeatSingle.val();
    this.set("repeatType", "single");
    this.set("repeatCount", Number(this.repeatSingleTimes.val()));
    this.set("repeatAyah", verseToRepeat);

    this.updatePlayerRepeat();
  }

  jumpTo(verse) {
    if(this.pageMode == false){
      return getQuranReader().loadVerses(null,verse);
    }else{
      return getQuranReader().setCurrentVerse(verse, verse)
    }
  }

  updateRepeatRange() {
    const rangeStart = this.repeatRangeFrom.val();
    this.set("repeatType", "range");

    this.set("repeatCount", Number(this.repeatRangeTimes.val()));
    this.set("repeatFrom", rangeStart);
    this.set("repeatTo", this.repeatRangeTo.val());

    this.updatePlayerRepeat();
  }

  bindPause() {
    const pauseSelect = $("#pause-bw-ayah-seconds");

    $("[name='pause-bw-ayah']").on("change", () => {
      this.updatePause(pauseSelect.val());
    });

    pauseSelect.on("change", () => {
      this.updatePause(pauseSelect.val());
    });
  }

  updatePause(seconds) {
    const enabled = $("#pause-ayah").is(":checked");

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

    if ("single" == this.get("repeatType")) {
      verseToRepeat = this.get("repeatAyah");
      first = verseToRepeat;
      last = verseToRepeat;
    } else {
      verseToRepeat = this.get("repeatFrom");
      first = verseToRepeat;
      last = this.get("repeatTo");
    }
    
    if (!!verseToRepeat) {
      document.body.loader.show();
      this.jumpTo(verseToRepeat).then(() => {
        document.body.loader.hide();

        let player,
          playerDom = document.getElementById("player");

        if (playerDom) player = playerDom.player;
        if (player) {
          player.updateRepeat(
            {
              repeatEnabled: this.get("repeatEnabled"),
              repeatCount: this.get("repeatCount"),
              repeatType: this.get("repeatType"),
              repeatAyah: this.get("repeatAyah"),
              repeatFrom: this.get("repeatFrom"),
              repeatTo: this.get("repeatTo")
            },
            {first, last}
          );
          player.createHowlAndPlay();
        }
      });
    }
  }

  
}
