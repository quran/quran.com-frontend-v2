// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("turbolinks").start();
require("custom-bootstrap");
require("rails_script");
require("partial_replacement");
require("infinite_scrolling");
require("bootstrap_slider");
require("howler");
require("service-worker-companion");
require("select2/dist/js/select2.full");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", { scope: "./" })
    .then(registration => {
      console.log("Quran.com SW Registered:", registration);
    })
    .catch(error => {
      console.error("Quran.com SW Registration failed: ", error);
    });
}

import "controllers";
