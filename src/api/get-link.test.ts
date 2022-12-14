import { getLink } from "./get-link";
import { test, expect, vi } from "vitest";
import type { Entity, FiberyType } from "../types";
vi.mock("./get-http-protocol", () => ({ getHttpProtocol: () => "https://" }));

test("#getLink can generate link", () => {
  expect(
    getLink({
      host: "fibery.io",
      entity: {
        "fibery/public-id": "the-first-test",
      } as Entity,
      type: {
        "fibery/name": "test",
      } as FiberyType,
    })
  ).toBe("https://fibery.io/test/the-first-test");
});
