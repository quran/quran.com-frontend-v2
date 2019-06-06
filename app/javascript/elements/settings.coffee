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
    $(document).on 'hide.bs.dropdown', '#reciter-dropdown', @updateReciter

    $(document).on 'click', '.dropdown-menu.keep-open .dropdown-item', (e)->
      target = $(e.target)

      unless target.hasClass('dropdown-item')
        target = target.parent('.dropdown-item')

      if target.closest('.dropdown-menu').hasClass('single')
        target.closest('.dropdown-menu').find('.dropdown-item').removeClass('active')

      target.toggleClass('active')
      e.stopPropagation()
      e.preventDefault()

    setting = try
      JSON.parse(localStorage.getItem("settings") || "{}")
    catch
      {}

    @settings = Object.assign(@defaultSetting(), setting)
    @updatePage()

  toggleReadingMode: (e)->
    e.preventDefault()
    $("body").toggleClass('reading-mode')
    $("#toggle-readingmode").toggleClass('text-primary')

  updateReciter: ->
    activeRecitation = $("#reciter-dropdown-menu .dropdown-item.active")
    player.setRecitation activeRecitation.data('recitation')

  reloadTranslations: ->
    activeTranslations = $("#translation-dropdown-menu .dropdown-item.active")
    translationIds = []
    activeTranslations.each (i, t) -> translationIds.push $(t).data('translation')
    $.get "#{$('#verses-pagination').data('url')}", {translations: translationIds.join(',')}, (response) ->
      $("#verses").html response
      $this.bindWordTooltip($('.word'))

  get: (key) ->
    @settings[key]

  toggleNightMode: (e) =>
    e.preventDefault()
    isNightMode = $("body").hasClass('night')
    $("body").toggleClass('night')
    $('#toggle-nightmode').toggleClass('text-primary')
    @settings.nightMode =  !isNightMode
    @saveSettings()

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
    @resetPage()
    @saveSettings()

  resetPage: =>
    $(".translation").css('font-size', '20px')
    $(".word").css('font-size', '50px')

  updatePage: =>
    if @get('nightMode')
      $('body').addClass('night')
    else
      $('body').removeClass('night')

  saveSettings: =>
    localStorage.setItem("settings", JSON.stringify(@settings))

  defaultSetting: =>
    {
      font: 'qcf_v2',
      tooltip: 'translation',
      recitation:  7,
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

