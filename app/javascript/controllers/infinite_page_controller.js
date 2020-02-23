import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    let el = $(this.element);
    var containerId = el.attr("id");
    var context = el.data("context");

    if (context) context = $(context);
    else context = window;

    $(`#${containerId}`).infinitePages({
      debug: false,
      buffer: 1000, // load new page when within 200px of nav link
      nextSelector: `#${containerId}_pagination a[rel=next]:first`,
      context: context,
      loading() {},
      success(data) {
        // called after successful ajax call
        $(`#${containerId}_pagination`).remove();
        const newItems = $(data);
        $(`#${containerId}`).append(newItems);
        $(`#${containerId}`).trigger("items:added");
      },
      error(error) {
        return $(`#${containerId}`)
          .find(".pagination")
          .before(error);
      }
    });
  }

  disconnect() {
    let plugin = $(this.element).data().infinitepages;
    if (plugin) plugin.stop();
  }
}
