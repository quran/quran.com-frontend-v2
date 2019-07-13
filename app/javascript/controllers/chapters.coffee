import copyToClipboard from 'copy-to-clipboard';

class App.Chapters extends App.Base
  show: =>
    window.setting ||= new Utility.Settings()
    window.player = new Utility.Player()

    @bindFootnotes()
    @infinitePagination()
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

  bindWordTooltip: (dom) =>
    dom.tooltip({
      trigger: 'hover',
      placement: 'top'
      html: true,
      template: "<div class='tooltip' role='tooltip'><div class='arrow'></div><div class='tooltip-inner'></div></div>"
      title: ->
        local = $(@).data('local')
        tooltip = setting.getTooltipType();
        text = $(@).data(tooltip)
        "<div class='#{local}'>#{text}</div>"
    });

  appendPage: (items) =>
    $("#pagination-wrap").remove()

    newItems = $("<div>", {html: items})
    if newItems.find("[id^=page-num-]").length > 0
      # READING MODE
      $("#verses").prepend(newItems.find("style"))
      newItems.find("[id^=page-num-]").each (i, dom) ->
        if $("##{dom.id}").length > 0
          # IF document already has this page, then append it
          # TODO: append to lines later on, to keep the format same as mushaf
          $("##{dom.id}").find('.row-border').before($(dom).find('.line'))
        else
          # otherwise simply append to verses
          $("#verses").append($(dom))

      $("#verses").append newItems.find("#pagination-wrap")
    else
      $("#verses").append newItems

    @bindWordTooltip(newItems.find('.word'))
    player.updateVerses()


  infinitePagination: =>
    that = @
    $("#verses").infinitePages
      debug: false
      buffer: 1000 # load new page when within 200px of nav link
      navSelector: "#verses-pagination"
      nextSelector: "#verses-pagination a[rel=next]:first"
      loading: ->
        $("#verses-pagination a[rel=next]:first").html("<i class='fa-spin6 fa-2x animate-spin brand'></i>")

      success: (container, data) ->
        # called after successful ajax call
        that.appendPage(data)

      error: (container, error) ->
        console.log("err", error)
        $("#verses-pagination").find(".pagination").before error
