window.Utility ||= {}

class Utility.Settings
  @settings = {}

  constructor: ->
    $(document).on 'click', '.font-size', @handleFontSize
    $(document).on "click", '.word-tooltip', @handleTooltip
    $(document).on 'click', '#reset-setting', @resetSetting
    $(document).on 'click', '#toggle-nightmode', @toggleNightMode
    $(document).on 'click', '#toggle-readingmode', @toggleReadingMode
    $(document).on 'hide.bs.dropdown', '#translation-dropdown', @reloadTranslations

    $(document).on 'click', '.dropdown-menu.keep-open .dropdown-item', (e)->
      target = $(e.target)
      window.tt=target
      unless target.hasClass('dropdown-item')
        target = target.parent('.dropdown-item')

      target.toggleClass('active')
      e.stopPropagation()
      e.preventDefault()

    setting = try
      JSON.parse(localStorage.getItem("settings") || "{}")
    catch
      {}

    @settings = Object.assign(setting, @defaultSetting())

  toggleReadingMode: (e)->
    e.preventDefault()
    $("body").toggleClass('reading-mode')
    $("#toggle-readingmode").toggleClass('text-primary')

  reloadTranslations: ->
    activeTranslations = $("#translation-dropdown-menu .dropdown-item.active")
    translationIds = []
    activeTranslations.each (i, t) -> translationIds.push $(t).data('translation')
    $.get "#{$('#audio_files-pagination').data('url')}", {translations: translationIds.join(',')}, (response) ->
      $("#audio_files").html response
      $this.bindWordTooltip($('.word'))

  toggleNightMode: (e)->
    e.preventDefault()
    $("body").toggleClass('night')
    $('#toggle-nightmode').toggleClass('text-primary')
    alert 'a'

  handleTooltip: (e) =>
    e.preventDefault()
    target = $(e.target)
    target.parent('.dropdown-menu')
    target.toggleClass('active')
    @settings.tooltip = target.data('tooltip') || target.parent().data('tooltip')

  handleFontSize: (e) =>
    e.preventDefault()
    that = $(e.target)
    target = that.closest('li').data('target')
    targetDom = $(target)

    size = parseInt targetDom.css('font-size'), 10
    size = if that.hasClass('increase') then size + 1 else size - 1

    @changeFontSize(targetDom, size)

  getTooltipType: =>
    if @settings.tooltip == 'transliteration'
      'tr'
    else
      't'

  changeFontSize: (target, size) =>
    target.css('font-size', size )
    window.matchMedia("(max-width: 610px)")

  resetSetting: (e) =>
    e.preventDefault()
    $('body').removeClass('night')
    @settings = @defaultSetting()
    @updatePage()

  updatePage: =>
    $(".translation").css('font-size', '20px')
    $(".word").css('font-size', '50px')

  defaultSetting: =>
    {
      font: 'qcf_v1',
      tooltip: 'translation',
      recitation:  '',
      nightMode: false,
      readingMode: false,
      translations: [],
      arabicFontSize: {
        mobile: 30,
        desktop: 50
      },
      translationFontSize: {
        mobile: 17,
        desktop: 20
      }
    }

