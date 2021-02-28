import {Controller} from "stimulus";
import ChapterController from "./chapter_controller";

export default class extends Controller {
  connect() {
    //super.connect();
    this.config = {times: 2, seconds: 5};
    this.element.segmentPlayer = this;

    this.playerConfig = {};
    this.currentVerse = null;
    this.lastVerse = null;
    this.bindListener();
  }

  handlePlayButton(event){
    let target = event.target;
    let player = this.getPlayer();
    if (player) {
      (target.classList == "icon-pause") ? player.pauseCurrent() : player.playCurrent();
    }
    if(target.classList == 'icon-pause'){
      target.classList = "icon-play1";
      target.nextElementSibling.innerText = "Play";
    }else{
      target.classList = "icon-pause";
      target.nextElementSibling.innerText = "Playing";
    }
  }

  play(){
    document.querySelector('body').classList.add("small-player");
    document.querySelector('#play-selected-wrapper').classList.remove("active");
    let player = this.getPlayer();
    if (player) {
      if(this.currentVerse == null){ //backup player's currentVerse/lastVerse
        this.lastVerse = player.lastVerse;
        this.currentVerse = player.currentVerse;
      }
      
      const verseNumber = document.querySelector('.word.selected').dataset.key.split(':').slice(0,2).join(':');
      const segments = [...document.querySelectorAll('.word.selected')].map(x => (+x.dataset.key.split(':').slice(-1)) - 1);

      player.updateVerses(verseNumber, verseNumber, true, segments);
      player.updatePause(this.config.seconds);
      player.updateRepeat({
        repeatEnabled: true,
        repeatCount: this.config.times,
        repeatType: 'single',
        repeatAyah: verseNumber,
      }, {'first': verseNumber, 'last': verseNumber}, segments);
      player.play(verseNumber);
    }
  }

  getPlayer(){
    let player,playerDom = document.getElementById("player");
    if (playerDom) player = playerDom.player;
    return player;
  }

  closePlayer(){
    document.querySelector('body').classList.remove("small-player");
    let player = this.getPlayer();
    if (player) {
      if (player.isPlaying()) player.currentHowl.stop()
      player.updateVerses(this.currentVerse, this.lastVerse);
      player.loadSettings();
    }
    document.getElementById("reader").segmentSelection.deselect();
  }

  bindListener(){
    $(document).on('segment:selected', function(e, items) {
      $('.play-segment').addClass('active');
      $('.play-selected-wrapper').removeClass('active');
    });

    $(document).on('segment:removed', function() {
      $('.play-segment, .play-selected-wrapper').removeClass('active');
    });

    $(document).on('el:selecting', function() {
      $('.play-segment, .play-selected-wrapper').removeClass('active');
    });

    document.querySelector('#play-selected--playbutton').addEventListener("click", e => this.play(e));
    document.querySelector('#play-bar-close').addEventListener("click", e => this.closePlayer(e));
    document.querySelector('#close-play-selected').addEventListener("click", () => this.closePlaySegment());
    document.querySelector('#segment-player').addEventListener("click", () => this.showPlaySegment());
    document.querySelectorAll(".counter__button").forEach(item => {
      item.addEventListener("click", e => this.handleCounterButtons(e));
    });
    document.querySelector("#playing-part").addEventListener("click", event => this.handlePlayButton(event));
  }

  showPlaySegment(){
    document.querySelector('#play-selected-wrapper').classList.add("active");
    document.querySelector('#segment-player').classList.add("active");
  }

  closePlaySegment(){
    document.querySelector('#play-selected-wrapper').classList.remove("active");
    document.querySelector('#segment-player').classList.remove("active");
  }

  handleCounterButtons(e){
    const data = e.target.dataset;
    const increment = +data.increment;
    let textNode = $(`.counter__text.${data.type}`);
    let value = (+textNode.data("value")) + increment;
    if(value > -1){
      this.config[data.type] = value;
      textNode.data("value", value).text(`${value} ${data.type}`);
      let player,
      playerDom = document.getElementById("player");
      if (playerDom) player = playerDom.player;
      if (player) {
        (data.type == "seconds") ? player.updatePause(value) : player.updateRepeatCount(value);
      }
    }
  }

  resetPlayButton(){
    document.querySelector("#playing-part").children[0].classList = "icon-play1";
    document.querySelector("#playing-part").children[1].innerText = "Play";
  }
}
