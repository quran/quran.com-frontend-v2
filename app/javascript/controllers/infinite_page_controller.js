import { Controller } from "stimulus";
import InfinitePages from "../utility/InfinitePages";

export default class extends Controller {
  connect() {
    let el = $(this.element);
    var containerId = el.attr("id");
    var context = el.data("context");

    if (context) context = $(context);
    else context = window;

    const itemsContainer = $(el.data("items-container") || `#${containerId}`);
    const plugin = new InfinitePages(itemsContainer, {
      debug: false,
      buffer: 1000, // load new page when within 200px of nav link
      navSelector: `#${containerId}_pagination a[rel=next]:first`,
      context: context,
      loading() {},
      success(data) {
        // called after successful ajax call
        $(`#${containerId}_pagination`).remove();
        const newItems = $(data);
        itemsContainer.append(newItems);
        itemsContainer.trigger("items:added");
      },
      error(error) {
        return itemsContainer.find(".pagination").before(error);
      }
    });

    // if element is hidden, pause the scroller
    if (itemsContainer.is(":hidden")) {
      plugin.pause();
    }

    itemsContainer.on("visibility:visible", () => {
      plugin.resume();
    });

    itemsContainer.on("visibility:hidden", () => {
      plugin.pause();
    });

    this.element.infinitePage = plugin;
    this.plugin = plugin;
  }

  disconnect() {
    if (this.plugin) this.plugin.stop();
  }
}
