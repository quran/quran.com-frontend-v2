let replace = function(html, options) {
  if (options == null) {
    options = {};
  }

  let nodeId, i, len, changes;
  let newHtml = $("<div>").html(html);

  /*
     Change the content of dom

     render "partial", change: ["dom", "ids", "to", "change"] OR SingleID
     */

  if (options.change != null) {
    changes = options.change;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeId = changes[i];
      let node = $("#" + nodeId);
      let newNode = newHtml.find("#" + nodeId);

      node.html(newNode.html()).addClass(newNode.attr("class"));
    }
  }

  if (options.updateAll != null) {
    changes = options.updateAll;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeClass = changes[i];
      let node = $("." + nodeClass);
      let newNode = newHtml.find("." + nodeClass);

      node.html(newNode.html()).addClass(newNode.attr("class"));
    }
  }

  /*remove node*/
  if (options.delete != null) {
    changes = options.delete;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeId = changes[i];
      $("#" + nodeId)
        .addClass("highlight")
        .remove();
    }
  }

  /*
     Append dom to existing dom
    */
  if (options.append != null) {
    changes = options.append;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeId = changes[i];
      $("#" + nodeId).append(newHtml.find("#" + nodeId).html());
    }
  }

  if (options.prepend != null) {
    changes = options.prepend;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeId = changes[i];
      $("#" + nodeId).prepend(newHtml.find("#" + nodeId).html());
    }
  }

  if (options.replace != null) {
    changes = options.replace;
    for (i = 0, len = changes.length; i < len; i++) {
      nodeId = changes[i];
      $("#" + nodeId).replaceWith(newHtml.find("#" + nodeId).html());
    }
  }

  return $(document).trigger("partial:changed");
};

window.PartialReplacement = {
  replace: replace
};
