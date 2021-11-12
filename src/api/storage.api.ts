const isDev = process.env.NODE_ENV === "development";
function getStorage() {
  // @ts-ignore
  if (typeof browser !== "undefined") {
    // @ts-ignore
    return browser.storage;
  } // @ts-ignore
  else if (typeof chrome !== "undefined") {
    // @ts-ignore
    return chrome.storage;
    // @ts-ignore
  }
}

export async function getValue<T>(key: string): Promise<T | undefined> {
  if (isDev) {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  }
  // @ts-ignore
  const storage = getStorage();
  if (storage) {
    return new Promise((resolve, reject) => {
      try {
        storage.sync.get([key], (value: any, e: any) => {
          // TODO handle error
          resolve(value && value[key]);
        });
      } catch (e) {
        resolve(undefined);
      }
    });
  }
}
export async function setValue<T>(key: string, value: T) {
  if (isDev) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  // @ts-ignore
  const storage = getStorage();
  if (storage) {
    await new Promise((resolve, reject) => {
      try {
        storage.sync.set({ [key]: value }, () => {
          // TODO handle error
          resolve(undefined);
        });
      } catch (e) {
        resolve(undefined);
      }
    });
  }
}
