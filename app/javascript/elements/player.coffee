window.Utility ||= {}

class Utility.Player
  AUDIO_CDN = "https://audio.qurancdn.com/verses/wbw"
  files: []
  player: false

  constructor: ->

  open: =>

  close: =>

  playWord: (wordLocation) =>
     location = wordLocation.split(':').map (num) -> new Array(4-num.length).join("0") + num

     console.log("playing word audio", "#{AUDIO_CDN}/#{location.join('_')}.mp3");

     sound = new Howl(
       src: ["#{AUDIO_CDN}/#{location.join('_')}.mp3"]
       autoplay: true
     )

     sound.play()

