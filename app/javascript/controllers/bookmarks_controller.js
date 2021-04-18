// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction

import { Controller } from "stimulus";
import LocalStore from "../utility/local-store";

export default class extends Controller {
  static store = new LocalStore(true);

  connect() {
    const bookmarks = Object.entries(this.loadBookmarks());

    for (const [key, url] of bookmarks) {
      this.addBookmark(key, url);
    }

    if (bookmarks.length > 0) {
      this.element.classList.remove("hidden");
    }
  }

  loadBookmarks() {
    try {
      return JSON.parse(this.constructor.store.get("bookmarks") || "{}");
    } catch (e) {
      return {};
    }
  }

  addBookmark(key, url) {
    $("#bookmark-list").append(
      `<a class="btn btn--lightgreen btn--large" data-controller="track" data-name="bookmarks" data-category="${key}" href="${url}"><span class="en">${key}</span></a>`
    );
  }
}
