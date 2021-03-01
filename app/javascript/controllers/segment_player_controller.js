import {Controller} from "stimulus";

export default class extends Controller {
  connect() {
    this.config = {times: 2, seconds: 5};
    this.element.segmentPlayer = this;

    this.playerConfig = {};
    this.currentVerse = null;
    this.lastVerse = null;
    this.bindListener();
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
        repeatCount: (this.config.times - 1),
        repeatType: 'single',
        repeatAyah: verseNumber,
      }, {'first': verseNumber, 'last': verseNumber}, segments);
      //player.createHowl(verseNumber);
      player.play(verseNumber);
    }
  }

  getPlayer(){
    return document.getElementById("player").player;
  }

  closePlayer(){
    document.getElementById("reader").segmentSelection.deselect();
  }

  bindListener(){

    $(document).on('segment:selected', function(e, items) {
      $('.play-segment').addClass('active');
      $('.play-selected-wrapper').removeClass('active');
    });

    $(document).on('segment:removed', function() {
      $('.play-segment, .play-selected-wrapper').removeClass('active');
      document.querySelector("#playing-part").children[0].classList = "icon-loading";
      document.querySelector("#playing-part").children[1].innerText = "Loading";
      document.querySelector('body').classList.remove("small-player");
      let segmentPlayer = document.getElementById("segment-player").segmentPlayer;
      let player = segmentPlayer.getPlayer();
      if (player) {
        if (player.isPlaying()) player.currentHowl.stop();
        if(!!segmentPlayer.currentVerse){
          player.updateVerses(segmentPlayer.currentVerse, segmentPlayer.lastVerse);
          player.loadSettings();
        }
      }
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
    document.querySelector("#playing-part").addEventListener("click", event => this.handlePlayerButton(event));
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
    const min = +data.min;
    if(value >= min){
      this.config[data.type] = value;
      textNode.data("value", value).text(`${value} ${data.type}`);
      let player = document.getElementById("player").player;
      if (player) {
        (data.type == "seconds") ? player.updatePause(value) : player.updateRepeatCount(value-1);
      }
    }
  }

  resetPlayButton(){
    document.querySelector("#playing-part").children[0].classList = "icon-play1";
    document.querySelector("#playing-part").children[1].innerText = "Play";
  }

  handlePlayerButton(event){
    const target = event.target;
    if(target.dataset.disabled == "false"){
      let player = this.getPlayer();
      if(target.classList == "icon-pause"){
        this.setPlayerCtrls('play');
        player.pauseCurrent();
      }else{
        this.setPlayerCtrls('pause');
        player.playCurrent();
      }
    }
  }

  setPlayerCtrls(type){
    let btn = document.querySelector('#playing-part a');
    let state = document.querySelector('#playing-part p');
    btn.dataset.disabled = false
    if ("play" == type) {
      btn.classList = 'icon-play1';
      state.innerHTML = "Paused";
    } else if ("pause" == type) {
      btn.classList = 'icon-pause';
      state.innerHTML = "Playing";
    } else if("loading" == type) {
      // loading
      btn.classList = 'icon-loading';
      state.innerHTML = "Loading";
      btn.dataset.disabled = true;
    }else{
      btn.classList = 'icon-play1';
      state.innerHTML = "Waiting";
      btn.dataset.disabled = true;
    }
  }
}
