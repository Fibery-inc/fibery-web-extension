import { getValue } from "./storage.api";
import { beforeEach, describe, expect, test } from "vitest";

const mockStorage: { [key: string]: string } = {
  token: "some-token",
  cookie: "some-cookie",
};
test("#getValue returns undefined without proper storage", () => {
  expect(getValue("token")).resolves.toBeUndefined();
});

const storageTypes = ["browser", "chrome"];

storageTypes.map((storageType) => {
  describe(`with ${storageType} storage`, () => {
    beforeEach(() => {
      // clear global types
      storageTypes.forEach((type) => {
        delete (global as any)[type];
      });
      (global as any)[storageType] = {
        storage: {
          sync: {
            get: (key: [string], cb: (value: any) => void) => {
              const value = mockStorage[key[0]];
              cb({ [key[0]]: value });
            },
          },
        },
      };
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
  });
});
