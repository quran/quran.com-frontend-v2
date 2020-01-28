class GoogleAnalytic {
  static trackEvent(name, category, label, val) {
    return new Promise(resolve => {
      if (gtag) {
        gtag("event", name, {
          event_category: category || name,
          event_label: label,
          value: val || 1,
          event_callback: function() {
            if (resolve) resolve();
          }
        });
      }
    });
  }
}

export default GoogleAnalytic;
