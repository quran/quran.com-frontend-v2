window.Utility ||= {}

class Utility.Player
  AUDIO_CDN = "https://audio.qurancdn.com/"
  files: []
  player: false

  constructor: ->
    $("#player .bar").slider()

  open: =>

  close: =>

  playWord: (path) =>
     sound = new Howl(
       src: ["#{AUDIO_CDN}/#{path}"]
       autoplay: true
     )

     sound.play()

