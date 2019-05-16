import { Howl, Howler } from 'howler'
window.Utility ||= {}

class Utility.Player
  AUDIO_CDN = "https://audio.qurancdn.com/"
  @chapter = null
  @firstVerse = null
  @lastVerse = null
  @audioData = {}
  @recitation = null
  @track = {}
  @preloadTrack = {}
  @progressBar = null
  @interval = null
  @alignTimers = []

  constructor: ->
    # define vars
    @audioData = {}
    @chapter = $("#verses").data("chapter-id")
    @recitation = '7' # TODO: get recitation id from settings
    @updateVerses().then( =>
      # set first track to play
      @track = {}
      @track.verse = @firstVerse
      # preload howl for first track
      @preloadTrack = {}
      @preloadTrack.verse = @firstVerse
      @preloadTrack.howl = @createHowl(@firstVerse, false)
      # bind events
      @bindEvents()
    )
    # init slider
    @progressBar = $('#player .bar').slider
      min: 0
      max: 100
      step: .1
      value: 0
      enabled: false

  updateVerses: =>
    verses = $("#verses .verse")
    @firstVerse = verses.first().data("verse-number")
    @lastVerse = verses.last().data("verse-number")
    @fetchAudioData( @firstVerse, @lastVerse )

  setRecitation: (id) =>
    # clear current data
    @audioData = {}
    # store if playing or not
    wasPlaying = @track.howl && @track.howl.playing()
    # stop current track and unload all tracks
    if @track.howl
      @track.howl.stop()
    Howler.unload()
    # set new recitation
    @recitation = id
    @updateVerses( =>
      if wasPlaying
        @play(@track.verse)
      else
        @preloadTrack.verse = @track.verse
        @preloadTrack.howl = @createHowl(@track.verse, false)
    )

  play: (verse) =>
    verse = verse or @track.verse
    # enable progress bar if disabled
    if !@progressBar.slider('isEnabled')
      @progressBar.slider('enable')
    # stop previous track
    if @track.howl
      @track.howl.stop()
    # reset
    @progressBar.slider('setValue', 0)
    @removeSegmentHighlight()
    @track = {}
    @track.verse = verse
    # play
    if @preloadTrack.verse == verse
        @track.howl = @preloadTrack.howl
        @track.howl.play()
      else
        @track.howl = @createHowl(verse, true)
    # set selected verse in the dropdown menu
    @setMenuSelectedVerse()
    # highlight current ayah
    @highlightCurrentVerse()
    # scroll to current ayah if setting is on
    if true # TODO: check if scroll setting is on
      @scrollToCurrentVerse()

  unload: =>
    # stop current track
    if @track.howl
      @track.howl.stop()
    # unload all tracks
    Howler.unload()

  createHowl: (verse, autoplay) =>
    new Howl(
      src: [@audioData[verse].audio]
      html5: true # TODO: should set to false
      autoplay: autoplay
      onplayerror: =>
        console.log "onplayerror"
        @track.howl.pause()
        @updatePlayCtrls()
      onplay: =>
        console.log "onplay"
        @updatePlayCtrls()
        @setInterval()
        @setAlignHighlight()
        # preload next @track is using web audio
        if Howler.usingWebAudio
          nextTrackVerse = @getNextTrackVerse()
          if nextTrackVerse != null && nextTrackVerse != @preloadTrack.verse
            @preloadTrack.verse = nextTrackVerse
            @preloadTrack.howl = @createHowl(nextTrackVerse, false)
      onpause: =>
        console.log "onpause"
        @updatePlayCtrls()
        @removeInterval()
        @removeAlignTimers()
      onstop: =>
        console.log "onstop"
        @removeInterval()
        @removeAlignTimers()
      onseek: =>
        console.log "onseek"
        if @track.howl.playing()
          # due to howl bug, run @setAlignHighlight() after 100ms, this reduced occurance of bug
          # note: this won't affect align accuracy
          setTimeout( =>
           @setAlignHighlight()
          , 100)
        else
          @setAlignHighlight( true )
      onend: =>
        console.log "onend"
        @removeInterval()
        @removeVerseHighlight()
        @removeSegmentHighlight()
        @progressBar.slider('setValue', 0)
        @updatePlayCtrls()
        $("#player .timer").text("00:00")
        # play next track if found
        nextTrackVerse = @getNextTrackVerse()
        if nextTrackVerse != null
          @play(nextTrackVerse)
    )

  getNextTrackVerse: =>
    if @track.verse < @lastVerse then @track.verse + 1 else null

  getPreviousTrackVerse: =>
    if @track.verse > @firstVerse then @track.verse - 1 else null

  updatePlayCtrls: =>
    if @track.howl && @track.howl.playing()
      @setPlayCtrls("pause")
    else
      @setPlayCtrls("play")

  setPlayCtrls: (type) =>
    $("#player .play-ctrls")
      .removeClass("play pause loading")
      .addClass(type)

  setInterval: =>
    clearInterval(@interval)
    @interval = setInterval( =>
      currentTime = @track.howl.seek()
      progressPercentage = Math.floor( (currentTime / @track.howl.duration()) * 1000 ) / 10
      @progressBar.slider('setValue', progressPercentage)
      $("#player .timer").text( @formatTime(currentTime) )
    , 500)

  removeInterval: =>
    clearInterval(@interval)

  formatTime: (timeInSeconds) =>
    minutes = Math.floor(timeInSeconds / 60)
    seconds = Math.floor( timeInSeconds - (minutes * 60) )
    currentTimeText = @pad(minutes, 2) + ":" + @pad(seconds, 2)

  pad: (n, width) =>
    n = n + ''
    if n.length >= width then n else new Array(width - (n.length) + 1).join('0') + n

  fetchAudioData: ( firstVerse, lastVerse ) =>
    requests = []
    firstPage = Math.floor( (firstVerse - 1) / 10 )
    lastPage = Math.floor( (lastVerse - 1) / 10 )
    for page in [firstPage...lastPage + 1] by 1
      # continue if data exist
      if @audioData.hasOwnProperty( page * 10 + 1 )
        continue
      # get page
      audioRequestQuery =
        chapter: @chapter
        recitation: @recitation
        page: page
      requests.push $.getJSON("/audio", audioRequestQuery, (data) =>
        for k,v of data
          # append audio cdn url
          if !/(http)?s?:?\/\//.test(v.audio)
            v.audio = AUDIO_CDN + v.audio
          @audioData[k] = v
      )
    # callback
    Promise.all( requests )

  bindEvents: =>
    # turbolinks navigation
    $(document).one 'turbolinks:visit', @unload
    # slider
    @progressBar.slider 'on', 'change', @handleProgressBarChange
    # player controls
    $('#player .play-btn').on 'click', @handlePlayBtnClick
    $('#player .pause-btn').on 'click', @handlePauseBtnClick
    $('#player .previous-btn').on 'click', @handlePreviousBtnClick
    $('#player .next-btn').on 'click', @handleNextBtnClick
    # select a verse from drop down
    $('#player .dropdown-verse .dropdown-menu .dropdown-item').on 'click', @handleDropdownVerseClick
    # play verse
    $('.verse .play-verse').on 'click', @handlePlayVerseBtnClick

  handlePlayBtnClick: =>
    if @track.howl
      if !@track.howl.playing()
        @track.howl.play()
    else
      @play()

  handlePauseBtnClick: =>
    if @track.howl && @track.howl.playing()
      @track.howl.pause()

  handleProgressBarChange: (value) =>
    time = @track.howl.duration() / 100 * value.newValue
    @track.howl.seek(time)

  handlePreviousBtnClick: =>
    previousTrackVerse = @getPreviousTrackVerse()
    if previousTrackVerse != null
      @play(previousTrackVerse)

  handleNextBtnClick: =>
    nextTrackVerse = @getNextTrackVerse()
    if nextTrackVerse != null
      @play(nextTrackVerse)

  handleDropdownVerseClick: (e) =>
    # TODO: check if the verse is not displayed

  handlePlayVerseBtnClick: (ev) =>
    verse = $(ev.target).closest(".verse").data("verse-number")
    @play(verse)

  setMenuSelectedVerse: =>
    $("#player .dropdown-verse .dropdown-toggle").text("Verse " + @track.verse)
    $("#player .dropdown-verse .dropdown-menu .dropdown-item.active").removeClass("active")
    $("#player .dropdown-verse .dropdown-menu .dropdown-item[data-verse=" + @track.verse + "]").addClass("active")

  highlightCurrentVerse: =>
    @removeVerseHighlight()
    $("#verses .verse[data-verse-number=" + @track.verse + "]").addClass("verse-highlight")

  removeVerseHighlight: =>
    $("#verses .verse").removeClass("verse-highlight")

  scrollToCurrentVerse: =>
    verseElement = $("#verses .verse[data-verse-number=" + @track.verse + "]")
    verseTopOffset = verseElement.offset().top
    verseHeight = verseElement.outerHeight()
    currentScroll = $(window).scrollTop()
    windowHeight = window.innerHeight
    headerHeight = $("header").outerHeight()
    playerHeight = $("#player").outerHeight()
    # scroll if there isn't a space to appear completely
    bottomOffsetCheck = verseTopOffset + verseHeight > currentScroll + windowHeight - playerHeight
    topOffsetCheck = verseTopOffset < currentScroll + headerHeight
    if bottomOffsetCheck || topOffsetCheck
      $('html, body').stop(true, true).animate(
        scrollTop: verseTopOffset - headerHeight
      , 500)

  setAlignHighlight: (currentOnly) =>
    @removeAlignTimers()
    segments = @audioData[@track.verse].segments
    seek = @track.howl.seek()
    if typeof seek != 'number' # TODO: try to fix that bug
      @removeSegmentHighlight()
      throw "howl bug: howl.seek() returned object instead of number"
    currentTime = seek * 1000
    @alignTimers = []
    $.each( segments, (index, segment) =>
      startTime = parseInt(segment[2], 10)
      endTime = parseInt(segment[3], 10)
      # continue if the segment is passed
      if currentTime > endTime
        return true
      if currentTime > startTime
        @highlightSegment(segment[0], segment[1])
        if currentOnly? && currentOnly
          return false;
      else
        highlightAfter = startTime - currentTime
        @alignTimers.push setTimeout( =>
          @highlightSegment(segment[0], segment[1])
        , highlightAfter)
    )

  removeAlignTimers: =>
    if @alignTimers? && @alignTimers.length > 0
      clearTimeout alignTimer for alignTimer in @alignTimers
      @alignTimers = []

  highlightSegment: (startIndex, endIndex) =>
    @removeSegmentHighlight()
    start = parseInt(startIndex, 10) + 1
    end = parseInt(endIndex, 10) + 1
    for word in [start...end] by 1
      $("#verses .verse[data-verse-number=" + @track.verse + "] .word").eq( word - 1 )
        .addClass("word-highlight")

  removeSegmentHighlight: =>
    $("#verses .verse .word").removeClass("word-highlight")