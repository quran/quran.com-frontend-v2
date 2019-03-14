window.Utility ||= {}

class Utility.Header
  constructor: ->
    $(window).scroll @scrolled

  scrolled: (e) =>
    if $(e.target).scrollTop()>=50
      $('header').addClass('active');
    else
      $('header').removeClass('active');
