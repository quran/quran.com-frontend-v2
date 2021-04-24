import AudioController from "./audio_controller";

export default class extends AudioController {
  connect() {
    super.connect();
    this.playWordQueue = [];
    this.resumeOnWordPlayEnd = false;
    this.element.wordPlayer = this;
  }

  play(audioPath) {
    let player, playerDom = document.getElementById("player");

    if (playerDom) player = playerDom.player;

    this.resumeOnWordPlayEnd = this.resumeOnWordPlayEnd || player.isPlaying();

    return this.loadHowler().then(() => {
      let howl = new Howl({
        src: [this.buildAudioUrl(audioPath)],
        html5: false,
        autoplay: false,
        onload: () => {
          player.isPlaying() && player.playCurrent();
        },
        onplayerror: () => {
          this.playWordQueue = [];

          this.resumeOnWordPlayEnd && player.playCurrent();
          this.resumeOnWordPlayEnd = false;
        },
        onend: () => {
          this.playWordQueue.shift();

          if (this.playWordQueue[0]) {
            this.playWordQueue[0].play();
          } else {
            this.resumeOnWordPlayEnd && player.playCurrent();
            this.resumeOnWordPlayEnd = false;
          }
        }
      });

      this.playWordQueue.push(howl);

      if (this.playWordQueue.length == 1) {
        // don't play this word if system is playing another word.
        // we'll play next word using howler's onend callback
        howl.play();
      }
    });
  }
}
