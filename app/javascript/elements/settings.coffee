window.Utility ||= {}

class Utility.Settings
  @settings = {}

  constructor: ->
    $(document).on 'click', '.font-size', @handleFontSize
    $(document).on "click", '.word-tooltip', @handleTooltip
    $(document).on 'click', '#reset-setting', @resetSetting

    setting = try
      JSON.parse(localStorage.getItem("settings") || "{}")
    catch
      {}

    @settings = Object.assign(setting, @defaultSetting())

  handleTooltip: (e) =>
    e.preventDefault()
    target = $(e.target)
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
    @settings = @defaultSetting()
    @updatePage()

  updatePage: =>
    $(".translation").css('font-size', '50px')
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

