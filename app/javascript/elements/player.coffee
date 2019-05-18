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
  @autoScroll = true
  @repeat = {}
  @repeatIteration = 1

  constructor: ->
    # define vars
    @audioData = {}
    @chapter = $("#verses").data("chapter-id")
    @recitation = '7' # TODO: get recitation id from settings
    @autoScroll = true
    @repeat =
      enabled: false
      type: 'single'
      value: '2'
    @repeatIteration = 1
    @updateVerses().then( =>
      # set first track to play
      @track = {}
      @track.verse = @firstVerse
      # preload howl for first track
      @preloadTrack = {}
      @preloadTrack.verse = @firstVerse
      @preloadTrack.howl = @createHowl(@firstVerse, false)
      # bind events
      @bindPlayerEvents()
      # set repeat range
      @repeat.from = $("#repeat-popover-range-from").val()
      @repeat.to = $("#repeat-popover-range-to").val()
    )
    # init slider
    @progressBar = $('#player .bar').slider
      min: 0
      max: 100
      step: .1
      value: 0
      enabled: false
    # init repeat popover
    $("#player .repeat-btn").popover(
      title: $("#player .repeat-popover-title")
      content: $("#player .repeat-popover-content")
      html: true
      placement: 'top'
    )

  updateVerses: =>
    verses = $("#verses .verse")
    firstVerse = verses.first().data("verse-number")
    lastVerse = verses.last().data("verse-number")
    @fetchAudioData( firstVerse, lastVerse ).then( =>
      # update first & last
      @firstVerse = firstVerse
      @lastVerse = lastVerse
      # bind verse button events
      @bindVerseEvents()
      # update repeat range select options
      @updateRepeatRange()
    )

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
    if @autoScroll
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
        # what to play next ?
        nextTrackVerse = @getNextTrackVerse()
        if @repeat.enabled # if repeat is enabled
          console.log("repeat is enabled")
          if @repeat.type == 'single' # if repeat is single
            # if repeat is loop or iteration is not finished
            if @repeat.value == 'loop' || @repeatIteration < 1* @repeat.value
              # play the same track
              console.log("play the same track")
              @play()
              @repeatIteration++
            else
              # play next track if found
              console.log("play the next track")
              if nextTrackVerse != null
                @play(nextTrackVerse)
              @repeatIteration = 1
          else if @repeat.type == 'range' # if repeat is range
            if @track.verse == 1* @repeat.to # if iteration reached to
              console.log('iteration reached "to"')
              # if repeat is loop or iteration is not finished
              console.log @repeat.value, @repeatIteration
              if @repeat.value == 'loop' || @repeatIteration < 1* @repeat.value
                # play from
                console.log('play range "from"')
                @play( 1* @repeat.from )
                @repeatIteration++
              else
                # play next track if found
                console.log("play the next track")
                if nextTrackVerse != null
                  @play(nextTrackVerse)
                @repeatIteration = 1
            else # if iteration didn't reach to
              console.log('iteration didn\'t reach "to"')
              # play next track if found
              if nextTrackVerse != null
                @play(nextTrackVerse)
        else # if repeat is not enabled
          console.log("repeat is not enabled")
          # play next track if found
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

  bindPlayerEvents: =>
    # turbolinks navigation
    $(document).one 'turbolinks:visit', @unload
    # player controls
    $('#player .play-btn').on 'click', @handlePlayBtnClick
    $('#player .pause-btn').on 'click', @handlePauseBtnClick
    $('#player .previous-btn').on 'click', @handlePreviousBtnClick
    $('#player .next-btn').on 'click', @handleNextBtnClick
    $('#player .auto-scroll-btn').on 'click', @handleScrollBtnClick
    # select a verse from drop down
    $('#player .dropdown-verse .dropdown-menu .dropdown-item').on 'click', @handleDropdownVerseClick
    # slider
    @progressBar.slider 'on', 'change', @handleProgressBarChange
    # repeat popover
    # hide on click outside
    hidePopover = (e) =>
      if $(e.target).closest(".popover").length == 0
        $("#player .repeat-btn").popover('hide')
    $("#player .repeat-btn").on('shown.bs.popover', =>
      $(document).on 'click', hidePopover
    )
    $("#player .repeat-btn").on('hide.bs.popover', =>
      $(document).off 'click', hidePopover
    )
    # switch disable/enable 
    _this = @
    $("#repeat-popover-switch").change( ->
      checked = $(this).is(":checked")
      $(".repeat-popover-content-disable-overlay").toggle(!checked)
      $(".repeat-btn").toggleClass("active", checked)
      _this.repeat.enabled = $("#repeat-popover-switch").is(":checked")
      _this.repeatIteration = 1
      console.log _this.repeat
    )
    $("#repeat-popover-pills-single-tab").on('show.bs.tab', ->
      _this.repeat.type = 'single'
      _this.repeat.value = $('#repeat-popover-single-repeat').val()
      _this.repeatIteration = 1
      console.log _this.repeat
    )
    $("#repeat-popover-pills-range-tab").on('show.bs.tab', ->
      _this.repeat.type = 'range'
      _this.repeat.value = $('#repeat-popover-range-repeat').val()
      _this.repeatIteration = 1
      console.log _this.repeat
    )
    $(".repeat-popover-repeat-value").change( ->
      _this.repeat.value = $(this).val()
      _this.repeatIteration = 1
      console.log _this.repeat
    )
    $("#repeat-popover-range-from").change( ->
      _this.repeat.from = $(this).val()
      repeatFrom = parseInt(_this.repeat.from, 10)
      # hide some to options
      $("#repeat-popover-range-to option").each( ->
        if parseInt($(this).val(), 10) > repeatFrom
          $(this).show().prop( "disabled", false )
        else
          $(this).hide().prop( "disabled", true )
      )
      if $("#repeat-popover-range-to option:selected").is(':disabled')
        $("#repeat-popover-range-to")
          .val($("#repeat-popover-range-to option:enabled").first().val())
          .change()
      _this.repeatIteration = 1
      console.log _this.repeat
    )
    $("#repeat-popover-range-to").change( ->
      _this.repeat.to = $(this).val()
      _this.repeatIteration = 1
      console.log _this.repeat
    )

  bindVerseEvents: =>
    # play verse buttons, remove previous event first to prevent adding multiple handlers
    $('.verse .play-verse').off 'click'
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

  handleScrollBtnClick: (ev) =>
    # set the settings and button
    @autoScroll = !@autoScroll
    $('#player .auto-scroll-btn').toggleClass("active")
    # scroll if turned on
    if @autoScroll
      @scrollToCurrentVerse()

  handleDropdownVerseClick: (e) =>
    # TODO: check if the verse is not displayed

  handlePlayVerseBtnClick: (ev) =>
    verse = $(ev.target).closest(".verse").data("verse-number")
    @play(verse)

  updateRepeatRange: () =>
    # save selected option
    rangeFrom = $("#repeat-popover-range-from").val()
    rangeTo = $("#repeat-popover-range-from").val()
    # clear previous options
    $("#repeat-popover-range-from").empty()
    $("#repeat-popover-range-to").empty()
    # add first verse for from only
    $("#repeat-popover-range-from").append('<option value="' + @firstVerse + '">' + @firstVerse + '</option>')
    # new range
    options = ''
    for verse in [@firstVerse + 1...@lastVerse + 1] by 1
      options += '<option value="' + verse + '">' + verse + '</option>'
    # add it
    $("#repeat-popover-range-from").append(options)
    $("#repeat-popover-range-to").append(options)
    # select the previously selected
    $("#repeat-popover-range-from").val(rangeTo).change()
    $("#repeat-popover-range-from").val(rangeFrom).change()

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