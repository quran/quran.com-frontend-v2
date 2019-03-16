class App.Chapters extends App.Base
  show: =>
    @player = new Utility.Player()
    @bindFootnotes()
    @infinitePagination()
    @bindWordAudio()
    @bindWordTooltip()
    @bindMedia()

    $(document).on "turbolinks:before-cache", ->
      $("#verses").infinitePages('destroy')

  index: =>

  bindMedia: ->
    $('#modal').on 'hidden.bs.modal', ->
      $('#modal .modal-body').empty()

    $(document).on "click", '.media', ->
      if media = $(@).data('media')
        $("#modal").find(".modal-body").html("
          <div class='embed-responsive embed-responsive-16by9'>
           <iframe class='embed-responsive-item' width='720' height='405' src='https://www.youtube.com/embed/#{media}' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>
          </div>"
        )
        $("#modal").modal("show")

  bindFootnotes: ->
    $(document).on "click", ".translation sup", ->
      id = $(@).attr("foot_note")
      $.get("/foot_note/#{id}")

  bindWordTooltip: =>
    $(document).on "mouseover", '.verse', @loadVerseTooltip
    $(document).on "click", '.word', @loadWordTooltip

  loadVerseTooltip: (e) =>
    $(e.target).find('.word').tooltip({
      delay: 10,
      title: @getTooltip,
      html: true
    });

  loadWordTooltip: (e) =>
    $(e.target).tooltip({
      delay: 10,
      title: @getTooltip,
      html: true
    });

  getTooltip: ->
    word = $(@)
    # TODO: Transliteration
    return word.data('translation') if  word.data('translation')?
    $.get "/verses/#{word.data('verse')}/tooltip", {}, (response) ->
      words = Object.keys(response)
      words.forEach (key) ->
        translation = response[key].translation
        transliteration = response[key].transliteration
        $("#w-#{key}").data('translation', if translation then translation.text else 'Verse')
        $("#w-#{key}").data('transliteration', if transliteration then transliteration.text else 'Verse')
    '...'

  bindWordAudio: ->
    $(document).on "click", ".word", (e) =>
      e.preventDefault()
      if $(e.target).data('audio')?
        @player.playWord($(e.target).data('audio'))

  infinitePagination: ->
    $("#verses").infinitePages
      debug: true
      buffer: 1000 # load new page when within 200px of nav link
      navSelector: "#verses-pagination"
      nextSelector: "#verses-pagination a[rel=next]:first"
      loading: ->
        console.log("loading more")

      success: (container, data) ->
        # called after successful ajax call
        $("#pagination-wrap").remove()
        newItems = $(data)
        $("#verses").append newItems

      error: (container, error) ->
        console.log("err", error)
        $("#feed_pagination").find(".pagination").before error
