import copyToClipboard from 'copy-to-clipboard';

class App.Chapters extends App.Base
  show: =>
    @player = new Utility.Player()
    @setting ||= new Utility.Settings()
    @bindFootnotes()
    @infinitePagination()
    @bindWordAudio()
    @bindWordTooltip($('.word'))
    @bindMedia()
    @bindVerseActions()

    $(document).on "turbolinks:before-cache", ->
      $("#verses").infinitePages('destroy')

  bindVerseActions: =>
    $(document).on "click", '.copy', @copyAyahToClipboard

  copyAyahToClipboard: (e) ->
    element = $(e.target)
    copyToClipboard(element.closest(".verse").find(".text").text())

    title = element.data('original-title')
    done = element.attr('done')

    element.attr('title', done).tooltip('_fixTitle').tooltip('show')
    element.on 'hidden.bs.tooltip', ->
      element.attr('title', title).tooltip('_fixTitle')

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

  bindWordTooltip: (dom)=>
    that = @
    dom.tooltip({
      trigger: 'hover',
      placement: 'top'
      html: true,
      template: "<div class='tooltip' role='tooltip'><div class='arrow'></div><div class='tooltip-inner #{window.locale}'></div></div>"
      title: ->
        tooltip = that.setting.getTooltipType();
        $(@).attr(tooltip)
    });

  bindWordAudio: ->
    $(document).on "dblclick", ".word", (e) =>
      e.preventDefault()
      audio = $(e.target).data('audio') || $(e.target).closest('.word').data('audio')
      if audio?
        @player.playWord(audio)

  infinitePagination: =>
    that = @
    $("#verses").infinitePages
      debug: true
      buffer: 1000 # load new page when within 200px of nav link
      navSelector: "#verses-pagination"
      nextSelector: "#verses-pagination a[rel=next]:first"
      loading: ->
        $("#verses-pagination a[rel=next]:first").html("<i class='fa-spin6 fa-2x animate-spin brand'></i>")

      success: (container, data) ->
        # called after successful ajax call
        $("#pagination-wrap").remove()
        newItems = $(data)
        $("#verses").append newItems
        that.bindWordTooltip(newItems.find('.word'))
        $('[data-toggle="tooltip"]').tooltip()

      error: (container, error) ->
        console.log("err", error)
        $("#feed_pagination").find(".pagination").before error
