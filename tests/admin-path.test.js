import assert from "node:assert/strict";
import test from "node:test";
import { getAdminPath } from "../src/lib/admin-path.js";

test("admin path uses a safe default and accepts a lowercase slug", () => {
  assert.equal(getAdminPath(undefined), "admin");
  assert.equal(getAdminPath("content-admin-2"), "content-admin-2");
});

test("admin path rejects malformed and route-colliding values", () => {
  for (const path of [
    "/admin",
    "admin/settings",
    "Admin",
    "admin_path",
    "api",
    "cms-internal",
    "contact",
    "_next",
  ]) {
    assert.throws(() => getAdminPath(path), /ADMIN_PATH/, path);
  }
});
