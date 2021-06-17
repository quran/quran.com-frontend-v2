// update this version when need to expire the cached settings
const LOCAL_STORE_CACHE_VERSION = "quran-v1.3";
const PERSISTED_CACHE_KEY = "quran-store";

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
  constructor(usePersistedStore) {
    if (usePersistedStore) {
      this.storeKey = PERSISTED_CACHE_KEY;
    } else {
      this.storeKey = LOCAL_STORE_CACHE_VERSION;
    }
  }

  get(key) {
    return this.getStore().getItem(this.transformKey(key));
  }

  set(key, val) {
    return this.getStore().setItem(this.transformKey(key), val);
  }

  transformKey(key) {
    return `${this.storeKey}-${key}`;
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
