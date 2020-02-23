document.addEventListener("turbolinks:click", event => {
  const anchorElement = event.target;
  const isSamePageAnchor =
    anchorElement.hash &&
    anchorElement.origin === window.location.origin &&
    anchorElement.pathname === window.location.pathname;

  if (!isSamePageAnchor) return;

  event.preventDefault();

  Turbolinks.controller.pushHistoryWithLocationAndRestorationIdentifier(
    event.data.url,
    Turbolinks.uuid()
  );
});
