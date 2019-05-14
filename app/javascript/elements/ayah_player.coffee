window.Utility ||= {}

class Utility.AyahPlayer
  player = null
  duration = null
  # https://audio.qurancdn.com/verses/Alafasy/mp3/001003.mp3

  load: (fileUrl) ->
    @player = new Howl(
      src: [fileUrl]
      autoplay: false
      preload: true
      onseek: -> @onSeek
      onplay: -> @onPlay
      onend: -> @onEnd
      onload: @onLoad
    )

  play: =>
    @player.play()

  onLoad: =>
    @duration = @player.duration()

  onSeek: =>
    requestAnimationFrame(@bind)

  onPlay: ->
    requestAnimationFrame(self.step.bind(self));

  formatTime: (secs) ->
    minutes = Math.floor(secs / 60) || 0;
    seconds = (secs - minutes * 60) || 0;
    minutes + ':' + (seconds < 1 ? '0' : '') + seconds;

  step: =>
    seek = player.seek() || 0;
    time = @formatTime(Math.round(seek));
    progress = (((seek / @duration) * 100) || 0) + '%';

    console.log("time ", time, " progress ", progress)

    if @player.playing()
      requestAnimationFrame(@step);

