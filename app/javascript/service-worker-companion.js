window.addEventListener("beforeinstallprompt", function(e) {
  // beforeinstallprompt Event fired
  GoogleAnalytic.trackEvent(
    "Promote Native Install",
    "AddToHomeScreen",
    "Promoting",
    1
  );

  // e.userChoice will return a Promise.
  // For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
  e.userChoice.then(function(choiceResult) {
    if (choiceResult.outcome == "dismissed") {
      GoogleAnalytic.trackEvent("Cancelled", "AddToHomeScreen", "Cancelled", 1);
    } else {
      GoogleAnalytic.trackEvent("Granted", "AddToHomeScreen", "Granted", 1);
    }
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceworker.js", { scope: "./" })
    .then(registration => {
      console.log("Quran.com SW Registered:", registration);
    })
    .catch(error => {
      console.error("Quran.com SW Registration failed: ", error);
    });
}
