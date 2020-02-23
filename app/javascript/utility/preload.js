const preloadResource = (path, resourceType) => {
  let preloadLink = document.createElement("link");
  preloadLink.href = path;
  preloadLink.rel = "preload";
  preloadLink.as = resourceType;
  document.head.appendChild(preloadLink);
};

export default preloadResource;
