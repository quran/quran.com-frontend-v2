// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="word">
// </div>

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    const windowConfig = {
      width: 550,
      height: 600,
      location: "no",
      toolbar: "no",
      status: "no",
      directories: "no",
      menubar: "no",
      scrollbars: "yes",
      resizable: "no",
      centerscreen: "yes",
      chrome: "yes",
      left:
        window.outerWidth / 2 +
        (window.screenX || window.screenLeft || 0) -
        550 / 2,
      top:
        window.outerHeight / 2 +
        (window.screenY || window.screenTop || 0) -
        400 / 2
    };

    this.shareWindowConfig = Object.keys(windowConfig)
      .map(key => `${key}=${windowConfig[key]}`)
      .join(", ");

    let el = $(this.element);
    this.shareButtons = el.find("#share-buttons");
    this.url = el.data("url");
    this.text = el.data("text");
    this.title = el.data("title");

    this.addButton("facebook", "Facebook", {
      href: `https://www.facebook.com/sharer/sharer.php?u=${this.url}`
    });
    this.addButton("twitter", "Twitter", {
      href: `https://twitter.com/share?url=${this.url}&hashtags=quran&via=app_quran`
    });
    this.addButton("messenger", "Messenger", {
      href: `https://www.facebook.com/dialog/send?link=${this.url}`
    });
    this.addButton("whatsapp", "Whatsapp", {
      "data-share": `'https://${
        this.isMobileOrTablet() ? "api" : "web"
      }.whatsapp.com/send?text=${this.url} ${this.title} ${this.text}'`,
      href: `https://${
        this.isMobileOrTablet() ? "api" : "web"
      }.whatsapp.com/send?text="${this.title +
        " " +
        this.url +
        " " +
        this.text}"`
    });
    this.addButton("pinterest", "Pinterest", {
      href: `https://pinterest.com/pin/create/button/?url=${
        this.url
      }&description=${this.title + " " + this.text}`
    });
    this.addButton("telegram", "Telegram", {
      href: `https://telegram.me/share/?url=${this.url}&text=${this.text}`
    });
    this.addButton("reddit", "Reddit", {
      href: `https://www.reddit.com/submit?url=${this.url}&title=${this.title}`
    });
    this.addButton("get-pocket", "Pocket", {
      href: `https://getpocket.com/save?url=${this.url}&title=${this.title}`
    });
    this.addButton("envelope", "Email", {
      href: `mailto:&subject=${this.title}&body=${this.url + " " + this.text}`
    });
    this.addButton("line", "Line", {
      "data-share": `https://social-plugins.line.me/lineit/share?url=${this.url}&text=${this.text}`,
      href: `https://social-plugins.line.me/lineit/share?url=${this.url}&text=${this.text}`
    });

    el.find(".share-icon a").on("click", e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.share(e.target);
    });

    this.el = el;
  }

  isMobileOrTablet() {
    return /(android|iphone|ipad|mobile)/i.test(navigator.userAgent);
  }

  addButton(icon, name, options) {
    const linkOptions = Object.keys(options)
      .map(key => `${key}=${options[key]}`)
      .join(", ");

    this.shareButtons.append(
      `<span class='share-icon ${icon} mr-6 mb-4'><a target='_blank' rel='noopener' title='Share on ${name}' class='fa align-items-center d-flex justify-content-center fa-${icon}' ${linkOptions}></a><span class='text-muted fs-sm'>${name}</span></span>`
    );
  }

  share(target) {
    let link = $(target);

    window.open(link.data("share") || target.href, "", this.shareWindowConfig);

    GoogleAnalytic.trackEvent("Share", "Verse", this.el.data("versekKey"), 1);
  }

  disconnect() {}
}
