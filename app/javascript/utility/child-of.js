export default function isChildOf(container, node) {
  if (container.contains) {
    return container != node && container.contains(node)
  }

  //safari
  let parent = container;
  while (parent !== null) {
    if (parent === node) return true;
    parent = parent.parentNode;
  }

  return false;
}
