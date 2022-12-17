import { test, expect } from "vitest";
import { FiberyType } from "../types";
import { getTypeName } from "./get-type-name";

const schema = {
  "fibery/types": [
    {
      "fibery/id": "1",
      "fibery/name": "fibery/entity",
    } as FiberyType,
    {
      "fibery/id": "2",
      "fibery/name": "fibery/author",
    } as FiberyType,
    {
      "fibery/id": "3",
      "fibery/name": "fibery/book",
    } as FiberyType,
  ],
};
test("#getTypename extracts name from fibery schema based on typeId", () => {
  expect(
    getTypeName({
      schema,
      typeId: "2",
    })
  ).toBe("author");
});

test("#getTypename returns lastUsedTypeName if typeId is not found in schema", () => {
  expect(
    getTypeName({
      schema,
      typeId: "INVALID",
      lastUsedTypeName: "book",
    })
  ).toBe("book");
});
test("#getTypename returns generic Entity if typeId is not found in schema and lastUsedTypeName is not provided", () => {
  expect(
    getTypeName({
      schema,
      typeId: "INVALID",
    })
  ).toBe("Entity");
});
