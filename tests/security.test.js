import assert from "node:assert/strict";
import test from "node:test";
import { safeUrl, sanitizeCmsValue, sanitizeHtml } from "../src/lib/security.js";

test("safeUrl accepts intended links and rejects executable or ambiguous schemes", () => {
  for (const url of [
    "/contact?from=footer#form",
    "#main",
    "?page=2",
    "https://example.com/path",
    "http://example.com",
    "mailto:hello@example.com",
    "tel:+441212345678",
  ]) {
    assert.equal(safeUrl(url), url);
  }

  for (const url of [
    "javascript:alert(1)",
    "java&#x73;cript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//evil.example/path",
    "\\\\evil.example\\path",
    "not a URL",
  ]) {
    assert.equal(safeUrl(url), "", url);
  }
  assert.equal(safeUrl("mailto:hello@example.com", { allowContact: false }), "");
});

test("sanitizeHtml removes active content and keeps a small semantic allow-list", () => {
  const dirty = [
    '<p class="lead" onclick="steal()">Hello <strong style="color:red">world</strong></p>',
    '<script>alert("xss")</script>',
    '<svg><a href="javascript:alert(1)">bad</a></svg>',
    '<a href="javascript:alert(1)" onmouseover="steal()">unsafe link</a>',
    '<a href="https://example.com" target="_blank" style="color:red">safe link</a>',
  ].join("");

  const clean = sanitizeHtml(dirty);
  assert.equal(clean.includes("script"), false);
  assert.equal(clean.includes("svg"), false);
  assert.equal(clean.includes("javascript:"), false);
  assert.equal(clean.includes("onclick"), false);
  assert.equal(clean.includes("style="), false);
  assert.match(clean, /<p>Hello <strong>world<\/strong><\/p>/);
  assert.match(
    clean,
    /<a href="https:\/\/example\.com" target="_blank" rel="noopener noreferrer">safe link<\/a>/,
  );
});

test("sanitizeCmsValue recursively constrains rich text and URL-shaped fields", () => {
  const result = sanitizeCmsValue({
    content: { body: '<p>Welcome</p><img src=x onerror="steal()">' },
    cta: { href: "javascript:steal()", label: "Contact us" },
    image: { secureUrl: "mailto:not-an-image@example.com" },
    items: [{ url: "/safe" }, { url: "data:text/html,bad" }],
  });

  assert.deepEqual(result, {
    content: { body: "<p>Welcome</p>" },
    cta: { href: "", label: "Contact us" },
    image: { secureUrl: "" },
    items: [{ url: "/safe" }, { url: "" }],
  });
});

test("sanitizeHtml preserves editor tables and safe hex text colours", () => {
  const clean = sanitizeHtml(
    '<table><tbody><tr><th>Heading</th><td><span style="color:#ff914d;position:fixed">Value</span></td></tr></tbody></table>',
  );

  assert.equal(clean.includes("position"), false);
  assert.match(clean, /<table><tbody><tr><th>Heading<\/th><td>/);
  assert.match(clean, /<span style="color:#ff914d">Value<\/span>/);

  assert.match(
    sanitizeHtml('<span style="color:rgb(255, 145, 77)">Orange</span>'),
    /<span style="color:rgb\(255, 145, 77\)">Orange<\/span>/,
  );
});
