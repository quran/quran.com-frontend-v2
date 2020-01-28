let root = document;

$(root).on("click", "[data-action]", function(e) {
  var actiontype = $(this).data("action");

  switch (true) {
    /**
     * toggle trigger
     * Usage 1 (body): <a href="#" data-action="toggle" data-class="add-this-class-to-body">...</a>
     * Usage 2 (target): <a href="#" data-action="toggle" data-class="add-this-class-to-target" data-target="target">...</a>
     **/
    case actiontype === "toggle":
      let target = $(this).attr("data-target") || e.target;
      let dataClass = $(this).attr("data-class");

      /* trigger class change */
      $(target).toggleClass(dataClass);

      /* this allows us to add active class for dropdown toggle components */
      if ($(this).hasClass("dropdown-item")) {
        $(this).toggleClass("active");
      }
      break;
    case actiontype == "pushState":
      history.pushState({}, "", $(this).attr("href"));
      break;
  }

  e.stopPropagation();
  e.preventDefault();
});
