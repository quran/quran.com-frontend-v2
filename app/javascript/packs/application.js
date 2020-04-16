// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("turbolinks").start();
require("node-waves/dist/waves");
require("jquery-ujs/index");
require("partial_replacement");
require("bootstrap_slider");
require("howler");
require("slim-scroller");
require("../utility/link-events");
require("../utility/async-render");
require("../utility/jquery-extends");
require("../utility/infinite-scrolling-page");

import "custom-bootstrap";
import "../utility/trubolink-patch";

import GoogleAnalytic from "../utility/analytic";
global.GoogleAnalytic = GoogleAnalytic;

require("service-worker-companion");
require("select2/dist/js/select2.full");

import "controllers";

$(document).on("turbolinks:load", function() {
  $("body").tooltip({
    selector: ".has-tooltip"
  });

  $("body").popover({
    selector: '[data-toggle="popover"]'
  });

  Waves.attach(".btn:not(.js-waves-off):not(.btn-switch), .js-waves-on", [
    "waves-themed"
  ]);
  Waves.init();

  $(document).on("click", "[data-dismiss=dropdown]", e => {
    e.preventDefault();
    let target = $(e.target).closest(".dropdown-menu");

    setTimeout(function() {
      target.dropdown("toggle");
    }, 250);
  });
});

document.addEventListener("turbolinks:request-start", function(event) {
  var xhr = event.data.xhr;
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
});

$(document).on("click", ".dropdown-menu", function(e) {
  // don't close dropdown on click, within
  e.stopPropagation();
});

require("../stylesheets/application.scss");

// page fonts
require.context("../fonts/quran_fonts", true);
require.context("../images", true);
