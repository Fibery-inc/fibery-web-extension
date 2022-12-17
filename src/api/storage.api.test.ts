import { getValue, setValue } from "./storage.api";
import { beforeEach, describe, expect, test } from "vitest";

const initialStorage = {
  token: "some-token",
  cookie: "some-cookie",
};
test("#getValue returns undefined without proper storage", () => {
  expect(getValue("token")).resolves.toBeUndefined();
});

const storageTypes = ["browser", "chrome"];

storageTypes.map((storageType) => {
  describe(`with ${storageType} storage`, () => {
    let mockStorage: { [key: string]: string };
    beforeEach(() => {
      // clear global types
      clearGlobals();
      mockStorage = { ...initialStorage };
      setupStorageGlobals(storageType, mockStorage);
    });

    test("#getValue returns existing value", async () => {
      const result = await getValue("token");
      expect(result).toEqual("some-token");
    });
    test("#getValue returns undefined if value is not found", async () => {
      const result = await getValue("other");
      expect(result).toBeUndefined();
    });
    test("#getValues returns undefined when storage throws an error", async () => {
      (global as any)[storageType].storage.sync.get = () => {
        throw new Error("Storage error");
      };
      const result = await getValue("token");
      expect(result).toBeUndefined();
    });
    test("#setValue sets value", async () => {
      await setValue("test-key", "test-value");
      expect(mockStorage["test-key"]).toEqual("test-value");
    });
    test("#setValue does not throw an error when storage throws an error", async () => {
      (global as any)[storageType].storage.sync.set = () => {
        throw new Error("Storage error");
      };
      const result = setValue("test-key", "test-value");

      expect(result).resolves.toBeUndefined();
      expect(mockStorage["test-key"]).toBeUndefined();
    });
  });
});

function setupStorageGlobals(
  storageType: string,
  mockStorage: { [x: string]: any }
) {
  (global as any)[storageType] = {
    storage: {
      sync: {
        get: (key: [string], cb: (value: any) => void) => {
          const value = mockStorage[key[0]];
          cb({ [key[0]]: value });
        },
        set: (value: any, cb: () => void) => {
          Object.assign(mockStorage, value);
          cb();
        },
      },
    },
  };
}

function clearGlobals() {
  storageTypes.forEach((type) => {
    delete (global as any)[type];
  });
}
