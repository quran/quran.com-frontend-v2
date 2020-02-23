import { Howl, Howler } from 'howler'
window.Utility ||= {}

class Utility.Player
  AUDIO_CDN = "z"
  HTML5 = true # TODO: should set to false to use web audio instead, but this requires CORS
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
    @populatePlayerVerses()
    # define vars
    @audioData = {}
    @chapter = $("#verses").data("chapter-id")
    @recitation = setting.get('recitation')
    @autoScroll = true
    @repeat =
      enabled: false
      type: 'single'
      value: 2

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
      @repeat.from = Number($("#repeat-popover-range-from").val())
      @repeat.to = Number($("#repeat-popover-range-to").val())
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

    @bindVerseEvents()

  loadVerses: (start) =>
    # If this ayah is already loaded, scroll to it
    if $("#verses .verse[data-verse-number=#{start}]").length > 0
      @scrollToVerse(start)
      return Promise.resolve( [] )

    # if not, then load the ayah
    loadAndUpdateVerses = ->
      # callback
      chapter = $("#verses").data("chapter-id")
      request = $.get "/#{chapter}/load_verses", verse:  start, (data) =>
        dom = $("<div>").html data

        # TODO: fix duplicate verses issue here.
        previous = $(dom.find('.verse')[0]).data('verseNumber')

        while $("#verses .verse[data-verse-number=#{previous}]").length == 0 && previous > 0
          previous = previous - 1

        if previous > 0
          targetDom = $("#verses .verse[data-verse-number=#{previous}]")
          targetDom.after(data)
        else
          nextVerse = $(dom.find('.verse')[dom.find('.verse').length - 1]).data('verseNumber')
          while $("#verses .verse[data-verse-number=#{nextVerse}]").length == 0
            nextVerse = nextVerse + 1

          targetDom = $("#verses .verse[data-verse-number=#{nextVerse}]")
          targetDom.before(data)

        # Bind tooltip
        $this.bindWordTooltip(data)

      Promise.resolve( request )

    that = @
    loadAndUpdateVerses().then =>
      @scrollToVerse(start)
      verses = $("#verses .verse")
      that.firstVerse = verses.first().data("verse-number")
      that.lastVerse = verses.last().data("verse-number")
      that.fetchAudioData(start, start+10)

  updateVerses: =>
    verses = $("#verses .verse")
    @firstVerse = verses.first().data("verse-number")
    @lastVerse = verses.last().data("verse-number")

    @fetchAudioData( @firstVerse, @lastVerse )

  populatePlayerVerses: =>
    total = $("#verses").data("total-verses") + 1
    verses = []
    dropDownVerses = []
    chapter = $("#verses").data("chapter-id")
    i18nLabel = $("#player-verse-dropdown").data('i18n-label')

    for verse in [1...total]  by 1
      verses.push("<option value='#{verse}'>#{verse}</option>");
      dropDownVerses.push(
        "<div class='dropdown-item'  data-verse='#{verse}'>
           <a href='/#{chapter}/#{verse}'>#{i18nLabel} #{verse}</a>
        </div>"
      )
    verses = verses.join('')

    $("#repeat-popover-single").html verses
    $("#repeat-popover-range-from").html verses
    $("#repeat-popover-range-to").html verses
    $("#player-verse-dropdown").html dropDownVerses.join('')

  setRecitation: (id) =>
    @recitation = id

    # clear current data
    @audioData = {}
    # store if playing or not
    wasPlaying = @track.howl && @track.howl.playing()
    # clear preloaded track
    @preloadTrack = {}
    # stop current track and unload all tracks
    if @track.howl
      @track.howl.stop()
    Howler.unload()
    # set new recitation
    @updateVerses().then( =>
      if wasPlaying
        @play(@track.verse)
      else
        @preloadTrack.verse = @track.verse
        @preloadTrack.howl = @createHowl(@track.verse, false)
    )

  play: (verse) =>
    # stop previous track
    if @track.howl && @track.howl.playing()
      @track.howl.stop()

    verse = verse or @track.verse

    # enable progress bar if disabled
    @progressBar.slider('enable')
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
    thisVerse = $("#verses .verse[data-verse-number=#{verse}]")
    new Howl(
      src: [@audioData[verse].audio]
      html5: HTML5
      autoplay: autoplay
      onplayerror: =>
        @track.howl.pause()
        @updatePlayCtrls()
      onplay: =>
        @setInterval()
        @setAlignHighlight()
        thisVerse.find(".play .fa").removeClass('fa-play1').addClass('fa-pause1')
        @updatePlayCtrls()

        # preload next @track is using web audio
        if Howler.usingWebAudio
          nextTrackVerse = @getNextTrackVerse()
          if nextTrackVerse != null && nextTrackVerse != @preloadTrack.verse
            @preloadTrack.verse = nextTrackVerse
            @preloadTrack.howl = @createHowl(nextTrackVerse, false)
      onpause: =>
        @removeInterval()
        @removeAlignTimers()
        thisVerse.find(".play .fa").removeClass('fa-pause1').addClass('fa-play1')
        @updatePlayCtrls()

      onstop: =>
        @removeInterval()
        @removeAlignTimers()
        @updatePlayCtrls()
        thisVerse.find(".play .fa").removeClass('fa-pause1').addClass('fa-play1')

      onseek: =>
        if @track.howl.playing()
          # due to howl bug, run @setAlignHighlight() after 100ms, this reduced occurance of bug
          # note: this won't affect align accuracy
          setTimeout( =>
           @setAlignHighlight()
          , 100)
        else
          @setAlignHighlight( true )
      onend: =>
        @removeInterval()
        @removeVerseHighlight()
        @removeSegmentHighlight()
        @progressBar.slider('setValue', 0)
        @updatePlayCtrls()
        thisVerse.find(".play .fa").removeClass('fa-pause1').addClass('fa-play1')
        $("#player .timer").text("00:00")

        # what to play next ?
        nextTrackVerse = @getNextTrackVerse()
        if @repeat.enabled # if repeat is enabled
          if @repeat.type == 'single' # if repeat is single
            # if repeat is loop or iteration is not finished
            if @repeat.value == 'loop' || @repeatIteration < 1* @repeat.value
              # play the same track
              @play()
              @repeatIteration++
            else
              # play next track if found
              if nextTrackVerse != null
                @play(nextTrackVerse)
              @repeatIteration = 1
          else if @repeat.type == 'range' # if repeat is range
            if @track.verse == 1* @repeat.to # if iteration reached to
              # if repeat is loop or iteration is not finished
              if @repeat.value == 'loop' || @repeatIteration < 1* @repeat.value
                # play from
                @play(@repeat.from)
                @repeatIteration++
              else
                # play next track if found
                if nextTrackVerse != null
                  @play(nextTrackVerse)
                @repeatIteration = 1
            else # if iteration didn't reach to
              # play next track if found
              if nextTrackVerse != null
                @play(nextTrackVerse)
        else # if repeat is not enabled
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

    #TODO: We can detect page number without loop. For ayah 1-10 page is 1, for 11-20 page is 2
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
        for k, v of data
          # append audio cdn url
          if !/(http)?s?:?\/\//.test(v.audio)
            v.audio = AUDIO_CDN + v.audio

          @audioData[k] = v
      )

    # callback
    Promise.all( requests )

  bindPlayerEvents: =>
    # unload the player when user navigate
    $(document).one 'turbolinks:visit', @unload

    # player controls
    $('#player .play-btn').on 'click', @handlePlayBtnClick
    $('#player .pause-btn').on 'click', @handlePauseBtnClick
    $('#player .previous-btn').on 'click', @handlePreviousBtnClick
    $('#player .next-btn').on 'click', @handleNextBtnClick
    $('#player .auto-scroll-btn').on 'click', @handleScrollBtnClick

    # select a verse from drop down
    $('#player .dropdown-verse .dropdown-item').on 'click', @handleDropdownVerseClick

    # slider
    @progressBar.slider 'on', 'change', @handleProgressBarChange

    # repeat popover
    # hide on click outside
    hidePopover = (e) =>
      if $(e.target).closest(".popover").length == 0
        $("#player .repeat-btn").popover('hide')

    $("#player .repeat-btn").on('shown.bs.popover', => $(document).on 'click', hidePopover)
    $("#player .repeat-btn").on('hide.bs.popover', =>
      $(document).off 'click', hidePopover
    )

    # switch disable/enable
    _this = @
    $("#repeat-popover-switch").change( ->
      checked = $(this).is(":checked")
      $(".repeat-popover-content .overlay").toggle(!checked)
      $(".repeat-btn").toggleClass("active", checked)
      _this.repeat.enabled = $("#repeat-popover-switch").is(":checked")
      _this.repeatIteration = 1
    )

    $("#repeat-popover-pills-single-tab").on('show.bs.tab', ->
      _this.repeat.type = 'single'
      _this.repeat.value = Number($('#repeat-popover-single-repeat').val())
      _this.repeatIteration = 1
    )

    $("#repeat-popover-pills-range-tab").on('show.bs.tab', ->
      _this.repeat.type = 'range'
      _this.repeat.value = Number($('#repeat-popover-range-repeat').val())
      _this.repeatIteration = 1
    )

    $(".repeat-popover-repeat-value").change( ->
      _this.repeat.value = Number($(this).val())
      _this.repeatIteration = 1
    )

    $("#repeat-popover-single").change( ->
      # handle selecting single verse for repeat
      _this.repeatIteration = Number($("#repeat-popover-single-repeat").val())
      _this.repeat.value = Number($(this).val())

      _this.loadVerses($(this).val()).then =>
        _this.play(_this.repeat.value)
    )

    $("#repeat-popover-range-from").change( ->
      _this.repeat.from = Number($(this).val())
      _this.repeatIteration = Number($("#repeat-popover-range-repeat").val())
      _this.loadVerses(_this.repeat.from).then => _this.play(_this.repeat.from)

      # hide some to options
      $("#repeat-popover-range-to option").each( ->
        if Number($(this).val()) > _this.repeat.from
          $(this).show().prop( "disabled", false )
        else
          $(this).hide().prop( "disabled", true )
      )

      if $("#repeat-popover-range-to option:selected").is(':disabled')
        $("#repeat-popover-range-to")
          .val($("#repeat-popover-range-to option:enabled").first().val())
          .change()
    )

    $("#repeat-popover-range-to").change( ->
      _this.repeat.to = Number($(this).val())
    )

  bindVerseEvents: =>
    $(document).on 'click', '.verse .play-verse', @handlePlayVerseBtnClick
    $(document).on 'click', '.verse .word', @handlePlayWordClick

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
    if(previous = @getPreviousTrackVerse())?
      @play(previous)

  handleNextBtnClick: =>
    if(next=@getNextTrackVerse())?
      @play(next)

  handleScrollBtnClick: (ev) =>
    # set the settings and button
    @autoScroll = !@autoScroll
    $('#player .auto-scroll-btn').toggleClass("active")

    # scroll if turned on
    if @autoScroll
      @scrollToCurrentVerse()

  handleDropdownVerseClick: (event) =>
    event.preventDefault()
    verse = Number($(event.target).closest('.dropdown-item').data('verse'))

    @loadVerses(verse).then =>
      @play(verse)

    $("#player .dropdown-verse .dropdown-item.active").removeClass("active")
    $("#player .dropdown-verse .dropdown-item[data-verse=#{verse}]").addClass("active")

  handlePlayVerseBtnClick: (ev) =>
    verse = $(ev.target).closest(".verse").data("verse-number")

    if @track.howl && @track.howl.playing() && @track.verse == verse
      @track.howl.stop()
    else
      @play(verse)

  handlePlayWordClick: (ev) =>
    if @track.howl && @track.howl.playing()
      return;
    new Howl(
      src: [AUDIO_CDN + $(ev.target).closest(".word").data("audio")]
      html5: HTML5
      autoplay: true
    )

  setMenuSelectedVerse: =>
    i18nLabel = $("#player-verse-dropdown").data('i18n-label')
    $("#player .dropdown-verse .dropdown-toggle").text("#{i18nLabel} #{@track.verse}")
    $("#player .dropdown-verse .dropdown-item.active").removeClass("active")
    $("#player .dropdown-verse .dropdown-item[data-verse=#{@track.verse}]").addClass("active")

  highlightCurrentVerse: =>
    @removeVerseHighlight()
    $("#verses .verse[data-verse-number=#{@track.verse}]").addClass("verse-highlight")

  removeVerseHighlight: =>
    $(".verse-highlight").removeClass("verse-highlight")

  scrollToVerse: (verse) ->
    verseElement = $("#verses .verse[data-verse-number=#{verse}]")
    verseTopOffset = verseElement.offset().top
    verseHeight = verseElement.outerHeight()
    currentScroll = $(window).scrollTop()
    windowHeight = window.innerHeight
    headerHeight = $("header").outerHeight() + $(".surah-actions").outerHeight()
    playerHeight = $("#player").outerHeight()
    # scroll if there isn't a space to appear completely
    bottomOffsetCheck = verseTopOffset + verseHeight > currentScroll + windowHeight - playerHeight
    topOffsetCheck = verseTopOffset < currentScroll + headerHeight

    if bottomOffsetCheck || topOffsetCheck
      $('html, body').stop(true, true).animate(
        scrollTop: verseTopOffset - headerHeight
      , 500)

  scrollToCurrentVerse: =>
    @scrollToVerse @track.verse

  setAlignHighlight: (currentOnly) =>
    @removeAlignTimers()
    segments = @audioData[@track.verse].segments
    seek = @track.howl.seek()z

    if typeof seek != 'number' # TODO: try to fix that bug
      @removeSegmentHighlight()
      console.error "howl bug: howl.seek() returned object instead of number"

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
    words = $("#verses .verse[data-verse-number=#{@track.verse}] .word")

    for word in [start...end] by 1
      words
        .eq( word - 1 )
        .addClass("word-highlight")

  removeSegmentHighlight: =>
    $(".word-highlight").removeClass("word-highlight")
