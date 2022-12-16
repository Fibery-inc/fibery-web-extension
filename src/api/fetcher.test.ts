// @vitest-environment happy-dom

import { useMe } from "./fetcher";
import { test } from "vitest";
import { renderHook } from "@testing-library/react";

test("#useMe", () => {
  renderHook(() => useMe());
});
