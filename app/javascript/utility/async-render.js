class RenderAsync {
  loadAsyncContent(containerId) {
    var element = document.querySelector(containerId);
    var data = element.dataset;

    var path = data.path;
    var method = data.method || "GET";
    var interval = parseFloat(data.interval || 0);

    var successEvent = data.successEvent;
    var failedEvent = data.errorEvent;
    var retryEvent = data.retryEvent;

    var retryCount = parseInt(data.retryCount || 0);
    var errorMessage = data.errorMessage || "";
    var delayOnError = parseInt(data.delayOnError | 0);
    var lazy = data.lazyLoad;
    var threshold, root, rootMargin;
    var lazyLoadObserver;

    if (!!lazy) {
      lazy = JSON.parse(lazy);
      lazy = true == lazy ? {} : lazy;

      threshold = lazy["threshold"] || [0.25, 0.5, 0.75, 1.0]; //trigger load when element is 25% visible
      root = lazy["root"];
      rootMargin = lazy["margin"] || "0px";

      // Here is great pen for playing with threshold for interaction observer
      // https://codepen.io/naveedahmada036/details/bGGPGEg
      if (!!root) {
        root = document.querySelector(root);
      } else {
        root = null; //document.body;
      }
    }

    var lazyLoaded = function(element) {
      element.dataset.lazyLoaded = true;

      if (lazyLoadObserver) lazyLoadObserver.unobserve(element);

      lazyLoadObserver = null;
    };

    var isLazyLoaded = function(element) {
      return "true" === element.dataset.lazyLoaded;
    };

    var fireEvent = function(name) {
      if (name && name.length > 0) {
        var event;
        if (typeof Event === "function") event = new Event(name);
        else {
          event = document.createEvent("Event");
          event.initEvent(name, true, true);
        }

        document.dispatchEvent(event);
      }
    };

    var onSuccess = function(response) {
      if (!!lazy) lazyLoaded(element);

      element.classList.remove("render-async");

      //TODO: remove jquery dependency
      if (interval) {
        $(element)
          .empty()
          .append(response);
      } else {
        $(element).replaceWith(response);
      }
      fireEvent(successEvent);
    };

    var onError = function(currentRetryCount) {
      if (currentRetryCount > retryCount) {
        setTimeout(delayOnError, function() {
          retry(currentRetryCount);
        });
      } else {
        element.innerHTML = errorMessage;
      }
      fireEvent(failedEvent);
    };

    var handelResponse = function(response, currentRetryCount) {
      if (response.ok) {
        response.text().then(onSuccess);
      } else {
        onError(currentRetryCount);
      }
    };

    var _listener = function(currentRetryCount) {
      var headers = { "X-Requested-With": "XMLHttpRequest" };
      var csrfTokenElement = document.querySelector('meta[name="csrf-token"]');
      if (csrfTokenElement) headers["X-CSRF-Token"] = csrfTokenElement.content;

      var requestOptions = {
        method: method,
        headers: headers
      };

      if ("POST" == method) requestOptions.body = JSON.stringify(data);

      fetch(path, requestOptions).then(res =>
        handelResponse(res, currentRetryCount)
      );
    };

    if (interval > 0) {
      retryCount = 0; // does interval and retry even make sense?
      setInterval(_listener, interval);
    }

    var _lazyListener = function(errCount) {
      lazyLoadObserver = new IntersectionObserver(
        function(entries) {
          var entry = entries[0];

          if (entry.intersectionRatio > 0) {
            if (!isLazyLoaded(element)) {
              _listener(errCount);
            }
          }
        },
        {
          root: root,
          rootMargin: rootMargin,
          threshold: threshold
        }
      );

      lazyLoadObserver.observe(element);
    };

    if (retryCount > 0) {
      var retry = function(currentRetryCount) {
        if (currentRetryCount >= retryCount) return false;

        fireEvent(retryEvent);

        _listener(currentRetryCount + 1);
        return true;
      };
    }

    !!lazy ? _lazyListener(1) : _listener(1);
  }
}

export default RenderAsync;
