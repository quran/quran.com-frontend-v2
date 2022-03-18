// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("turbolinks").start();
require('select2/dist/js/select2.full');

import JQuery from "jquery";
window.$ = window.JQuery = JQuery;

import "custom-bootstrap";
import "../utility/trubolink-patch";

// need google analytic is service worker, expose this globaly
import GoogleAnalytic from "../utility/analytic";
global.GoogleAnalytic = GoogleAnalytic;

require("service-worker-companion");

import "controllers";

document.addEventListener("turbolinks:request-start", function(event) {
  var xhr = event.data.xhr;

  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
});

/*
$('.label-nav').click(function(e) {
  if ($(e.target).parents('.dropdown').length == 1) return;
  $(this).toggleClass('label--open');
  $(this).toggleClass('label__opened');
  $('.label-nav')
    .not(this)
    .removeClass('label--open , label__opened');
});

$('.label-nav .icon-x').click(function() {
  $(this)
    .parents('.label-nav')
    .removeClass('label--open');
});
*/

require("../stylesheets/application.scss");
