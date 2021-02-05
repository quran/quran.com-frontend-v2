import {Controller} from "stimulus";

export default class extends Controller {
  
  connect() {
    this.config = {times: 2, seconds: 5};
    this.element[
      (str => {
        return str
          .split('--')
          .slice(-1)[0]
          .split(/[-_]/)
          .map(w => w.replace(/./, m => m.toUpperCase()))
          .join('')
          .replace(/^\w/, c => c.toLowerCase());
      })(this.identifier)
    ] = this;
    
    this.playerConfig = {};
    this.currentVerse = null;
    this.lastVerse = null;
    this.initListners();
  }
  
  handlePlayButton(event){
    let target = event.target;
    let player = this.getPlayer();
    if (player) {
      (target.classList == "icon-pause") ? player.handlePauseBtnClick() : player.handlePlayBtnClick();
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
        this.lastVerse = +player.lastVerse;
        this.currentVerse = +player.currentVerse;
      }
      const firstSegment = +document.querySelector('.word.selected').dataset.position;
      let nonArabicWordCount = 1; // we need atleast 1 in order to use it as index
      const verseNumber = document.querySelector('.word.selected').dataset.key.split(":")[1];
      document.querySelector(`[data-verse-number='${verseNumber}']`).querySelectorAll('.arabic.w').forEach(node => {
        if(!!node.dataset.audio == false && node.dataset.position <= firstSegment)
          nonArabicWordCount += 1;
      });
      let segments = [...document.querySelectorAll('.word.selected')].map(x => (+x.dataset.position)-(nonArabicWordCount));
      segments = [...Array(segments.length).keys() ].map( i => i+segments[0]); // making segments array a sequential array
      player.updatePause(this.config.seconds);
      player.updateRepeatConfig({
        repeatEnabled: true,
        repeatCount: this.config.times,
        repeatType: 'single',
        repeatAyah: verseNumber,
      }, {}, segments);
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
      player.stopHowler();
      return player.defaultConfig(this.currentVerse, this.lastVerse);
    }
  }
  
  initListners(){
    $(document).on('el:selected', function(e, items) {
      $('.play-segment').addClass('active');
      $('.play-selected-wrapper').removeClass('active');
    });
    //document.addEventListener("el:selected", (e,items) => {
    //  document.querySelector('#segment-player').classList.add("active");
    //  document.querySelector('#play-selected-wrapper').classList.add("active");
    //});
    $(document).on('el:deselected', function() {
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