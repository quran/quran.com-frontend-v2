replace = (html, options = {}) ->
  newHtml = $('<div>').html html
  if options.change?
    for change in options.change
      $("##{change}").html newHtml.find("##{change}").html()

  if options.append?
    for change in options.append
      $("##{change}").append newHtml.find("##{change}").html()

  if options.prepend?
    for change in options.prepend
      $("##{change}").prepend newHtml.find("##{change}").html()

  if options.replace?
    $("#{change}").replaceWith newHtml.find("#{change}").html()

  $(document).trigger("partial:changed")

window.PartialReplacement = {
  replace
}
