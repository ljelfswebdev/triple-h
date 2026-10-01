import assert from "node:assert/strict";
import test from "node:test";
import { navigationDefaults, navigationDefaultsByKey } from "../src/lib/navigation-data.js";

test("all public menus have distinct keys and usable seeded links", () => {
  assert.deepEqual(
    navigationDefaults.map(({ key }) => key),
    ["main", "footer-services", "footer-explore"],
  );
  assert.equal(navigationDefaultsByKey.main.items.length, 6);
  assert.equal(navigationDefaultsByKey["footer-services"].items.length, 6);
  assert.equal(navigationDefaultsByKey["footer-explore"].items.length, 4);
  assert.equal(
    navigationDefaultsByKey["footer-explore"].items.some((item) => item.url.startsWith("/portal")),
    false,
  );

  for (const navigation of navigationDefaults) {
    assert.ok(navigation.label);
    assert.ok(navigation.description);
    for (const item of navigation.items) {
      assert.ok(item.label);
      assert.match(item.url, /^\//);
      assert.equal(item.type, "custom");
    }
  }
});
