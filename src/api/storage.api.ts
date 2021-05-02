const isDev = process.env.NODE_ENV === "development";
export async function getValue<T>(key: string): Promise<T | undefined> {
  if (isDev) {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  }
  // @ts-ignore
  const storage = chrome.storage;
  if (storage) {
    return new Promise((resolve, reject) => {
      storage.sync.get([key], (value: any, e: any) => {
        resolve(value[key]);
      });
    });
  }
}
export async function setValue<T>(key: string, value: T) {
  if (isDev) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  // @ts-ignore
  const storage = chrome.storage;
  if (storage) {
    await new Promise((resolve, reject) => {
      storage.sync.set({ [key]: value }, () => {
        resolve(undefined);
      });
    });
  }
}
