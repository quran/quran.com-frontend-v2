class Utility.WordPlayer
  constructor: (url) ->
    @play(url)

  play: (url) =>
    new Howl(
      src: [url]
      preload: true
      autoplay: true
    )


