class App.Chapters extends App.Base

  show: =>
    @player = new Utility.Player()
    @bindFootnotes()
    @infinitePagination()
    @bindWordAudio()

  index: =>

  bindFootnotes: ->
    $(document).on "click", ".translation sup", ->
      id = $(@).attr("foot_note")
      $.get("/foot_note/#{id}")

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
        # loader = $('<div id="infscr-loading">' + window.quotes.get() + '</div>')
        # $("#feed_pagination").find(".pagination").before loader
        # loader.show()
        # $("#feed_pagination").find(".pagination").hide()
        console.log("loading more")

      success: (container, data) ->
        # called after successful ajax call
        $("#verses-pagination").remove()
        newItems = $(data)
        newItems.find('[data-toggle="tooltip"]').tooltip()
        $("#verses").append newItems

      error: (container, error) ->
        console.log("err", error)
        $("#feed_pagination").find(".pagination").before error
