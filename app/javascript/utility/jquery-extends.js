jQuery.fn.extend({
  scrollToMe: function(speed = 400) {
    var x = this.offset().top - 100;
    $("html,body").animate({ scrollTop: x }, speed);
    return this;
  },
  highlightMe: function(scroll, time = 2000) {
    if (this.length > 0) {
      let x = this.offset().top - 100;
      let currentBg = this.css("background-color");
      this.css("background-color", "#f1c40f");

      if (scroll) $("html,body").animate({ scrollTop: x }, 400);

      $(this)
        .stop()
        .animate({ backgroundColor: "#f1c40f" }, time, "linear", function() {
          $(this).css("background-color", currentBg);
        });
    }
  },
  swapWith: function(to) {
    return this.each(function() {
      var copy_to = $(to).clone();
      var copy_from = $(this).clone();
      $(to).replaceWith(copy_from);
      $(this).replaceWith(copy_to);
    });
  },
  scrollParent: function(includeHidden) {
    var position = this.css("position"),
      excludeStaticParent = position === "absolute",
      overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
      scrollParent = this.parents()
        .filter(function() {
          var parent = $(this);
          if (excludeStaticParent && parent.css("position") === "static") {
            return false;
          }
          return overflowRegex.test(
            parent.css("overflow") +
              parent.css("overflow-y") +
              parent.css("overflow-x")
          );
        })
        .eq(0);

    return position === "fixed" || !scrollParent.length
      ? $(this[0].ownerDocument || document)
      : scrollParent;
  },

  uniqueId: (function() {
    var uuid = 0;

    return function() {
      return this.each(function() {
        if (!this.id) {
          this.id = "ui-id-" + ++uuid;
        }
      });
    };
  })(),

  removeUniqueId: function() {
    return this.each(function() {
      if (/^ui-id-\d+$/.test(this.id)) {
        $(this).removeAttr("id");
      }
    });
  }
});
