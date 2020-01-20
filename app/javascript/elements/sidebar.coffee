window.Utility ||= {}

class Utility.Sidebar
  constructor: ->
    $('.fa-menu').on 'click', @open
    $('.close-menu').on 'click', @open

  open: =>
    $('.right-sidebar').toggleClass('open');
    $('body').toggleClass('active');

  close: =>
    $('.right-navbar').removeClass('open');
    $('body').removeClass('active');
