window.Utility ||= {}

class Utility.Player
  AUDIO_CDN = "https://audio.qurancdn.com"

  constructor: ->
    $("#player .bar").slider()
    @bindWordAudio()
    @bindAyahAudio()

  loadFile: (path, callback) =>
     new Howl(
       src: ["#{AUDIO_CDN}/#{path}"]
       preload: true
       onload: callback
     )

  bindWordAudio: ->
    $(document).on "dblclick", ".word", (e) =>
      e.preventDefault()
      audio = $(e.target).data('audio') || $(e.target).closest('.word').data('audio')
      if audio?
        new Utility.WordPlayer("#{AUDIO_CDN}/#{audio}")

  bindAyahAudio: ->
    $(document).on "dblclick", ".verse .play", (e) =>
      e.preventDefault()
      audio = $(e.target).data('audio') || $(e.target).closest('.word').data('audio')
      if audio?
        new Utility.WordPlayer("#{AUDIO_CDN}/#{audio}")
