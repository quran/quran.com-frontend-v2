(function($, window) {
  class InfinitePages {
    static initClass() {
      // Default settings
      this.prototype.defaults = {
        debug: true, // set to true to log messages to the console
        navSelector: "a[rel=next]",
        buffer: 1000, // 1000px buffer by default
        debounce: 250, // 250ms debounce by default
        loading: null, // optional callback when next-page request begins
        success: null, // optional callback when next-page request finishes
        error: null, // optional callback when next-page request fails
        context: window, // context to define the scrolling container
        state: {
          paused: false,
          loading: false
        }
      };
    }

    constructor(container, options) {
      this.options = $.extend({}, this.defaults, options);
      this.$container = $(container);
      this.$context = $(this.options.context);
      this.init();
    }

    init() {
      // Debounce scroll event to improve performance
      let scrollTimeout = null;
      const scrollHandler = () => this.check();
      const { debounce } = this.options;

      // Use namespace to let us unbind event handler
      this.$context.on("slimscrolling", function() {
        if (scrollTimeout && self.active) {
          clearTimeout(scrollTimeout);
          scrollTimeout = null;
        }
        return (scrollTimeout = setTimeout(scrollHandler, debounce));
      });

      return this.$context.on(
        "scroll.infinitePages, slimscrolling",
        function() {
          if (scrollTimeout && self.active) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
          }
          return (scrollTimeout = setTimeout(scrollHandler, debounce));
        }
      );
    }

    // Internal helper for logging messages
    _log(msg) {
      if (this.options.debug) {
        return typeof console !== "undefined" && console !== null
          ? console.log(msg)
          : undefined;
      }
    }

    // Check the distance of the nav selector from the bottom of the window and fire
    // load event if close enough
    check() {
      const nav = this.$container.find(this.options.navSelector);
      if (nav.length === 0) {
        return this._log("No more pages to load");
      } else {
        const windowBottom = this.$context.scrollTop() + this.$context.height();
        const distance = nav.offset().top - windowBottom;

        if (this.options.state.paused) {
          return this._log("Paused");
        } else if (this.options.state.loading) {
          return this._log("Waiting...");
        } else if (distance > this.options.buffer) {
          return this._log(`${distance - this.options.buffer}px remaining...`);
        } else {
          return this.next(); // load the next page
        }
      }
    }

    // Load the next page
    next() {
      if (this.options.state.done) {
        return this._log("Loaded all pages");
      } else {
        this._loading();

        const url = this.$container.find(this.options.navSelector).attr("href");
        return (this.jqXHR = $.get(url, data => {})
          .done(content => this._success(content))
          .fail(err => this._error(err)));
      }
    }

    _loading() {
      this.options.state.loading = true;
      this._log("Loading next page...");
      if (typeof this.options.loading === "function") {
        return this.$container
          .find(this.options.navSelector)
          .each(this.options.loading);
      }
    }

    _success(content) {
      this.options.state.loading = false;
      this.jqXHR = null;
      this._log("New page loaded!");
      if (typeof this.options.success === "function") {
        this.options.success(content);
      }
    }

    _error() {
      this.options.state.loading = false;
      this._log("Error loading new page :(");
      if (typeof this.options.error === "function") {
        return this.$container
          .find(this.options.navSelector)
          .each(this.options.error);
      }
    }

    // Pause firing of events on scroll
    pause() {
      this.options.state.paused = true;
      return this._log("Scroll checks paused");
    }

    // Resume firing of events on scroll
    resume() {
      this.options.state.paused = false;
      this._log("Scroll checks resumed");
      return this.check();
    }

    stop() {
      this.$context.off("scroll.infinitePages");
      return this._log("Scroll checks stopped");
    }

    // Abort loading of the page
    abort() {
      if (this.jqXHR) {
        this.jqXHR.abort();
        this.jqXHR = null;
        return this._log("Page load aborted!");
      } else {
        return this._log("There was no request to abort");
      }
    }
  }
  InfinitePages.initClass();

  // Define the plugin
  return $.fn.extend({
    infinitePages(option, ...args) {
      return this.each(function() {
        const $this = $(this);
        let data = $this.data("infinitepages");

        if (!data) {
          $this.data("infinitepages", (data = new InfinitePages(this, option)));
        }
        if (typeof option === "string") {
          if (option === "destroy") {
            return data.stop(args);
          } else if (option === "reinit") {
            return data.init(args);
          } else {
            return data[option].apply(data, args);
          }
        }
      });
    }
  });
})($, window);
