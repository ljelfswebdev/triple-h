import assert from "node:assert/strict";
import test from "node:test";
import {
  RequestError,
  assertTrustedMutation,
  clientAddress,
  errorResponse,
  opaqueKey,
  readLimitedJson,
} from "../src/lib/request-security.js";

function jsonRequest(body, headers = {}) {
  return new Request("https://cms.example.test/api/resource", {
    method: "POST",
    headers: { "content-type": "application/json", host: "cms.example.test", ...headers },
    body,
  });
}

test("readLimitedJson accepts objects and rejects invalid, oversized, and scalar bodies", async () => {
  assert.deepEqual(await readLimitedJson(jsonRequest('{"name":"Ada"}'), 64), { name: "Ada" });
  await assert.rejects(readLimitedJson(jsonRequest("not-json"), 64), (error) => {
    assert.equal(error.status, 400);
    return true;
  });
  await assert.rejects(readLimitedJson(jsonRequest("[]"), 64), /JSON object/);
  await assert.rejects(
    readLimitedJson(jsonRequest('{"value":"too large"}', { "content-length": "999" }), 20),
    (error) => error instanceof RequestError && error.status === 413,
  );
  await assert.rejects(readLimitedJson(jsonRequest('{"value":"too large"}'), 10), /too large/);
});

test("trusted mutation checks allow same-origin and reject forged cross-site requests", () => {
  assert.doesNotThrow(() =>
    assertTrustedMutation(
      jsonRequest("{}", { origin: "https://cms.example.test", "sec-fetch-site": "same-origin" }),
    ),
  );
  assert.throws(
    () => assertTrustedMutation(jsonRequest("{}", { "sec-fetch-site": "cross-site" })),
    (error) => error.status === 403,
  );
  assert.throws(
    () => assertTrustedMutation(jsonRequest("{}", { origin: "https://evil.example" })),
    /Cross-origin/,
  );
});

test("request helpers normalise client addresses, hide internal errors, and hash stable keys", async () => {
  const request = jsonRequest("{}", { "x-forwarded-for": " 192.0.2.1, 10.0.0.1" });
  assert.equal(clientAddress(request), "192.0.2.1");
  assert.equal(opaqueKey("login", "user@example.com"), opaqueKey("login", "user@example.com"));
  assert.notEqual(opaqueKey("login", "a"), opaqueKey("login", "b"));

  const known = errorResponse(new RequestError("Bad input", 422));
  assert.equal(known.status, 422);
  assert.deepEqual(await known.json(), { error: "Bad input" });
  const unknown = errorResponse(new Error("database password leaked"), "Request failed safely");
  assert.equal(unknown.status, 500);
  assert.deepEqual(await unknown.json(), { error: "Request failed safely" });
});
