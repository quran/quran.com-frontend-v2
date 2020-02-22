class CookieStore {
  getItem(key) {
    let values = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
    return values ? values.pop() : null;
  }

  setItem(key, val) {
    let date = new Date();
    let days = 300;
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    let expires = "; expires=" + date.toGMTString();
    document.cookie = key + "=" + String(val) + expires + "; path=/";
  }
}

class LocalStore {
  get(key) {
    return this.getStore().getItem(this.transformKey(key));
  }

  set(key, val) {
    return this.getStore().setItem(this.transformKey(key), val);
  }

  transformKey(key) {
    return `quran-${key}`;
  }

  getStore() {
    if ("object" == typeof localStorage) {
      return localStorage;
    } else {
      return new CookieStore();
    }
  }
}

export default LocalStore;
