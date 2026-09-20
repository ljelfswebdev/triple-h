import assert from "node:assert/strict";
import test from "node:test";
import { testimonialPlainText, testimonialPreview } from "../src/lib/testimonials.js";

test("only testimonials longer than 180 visible characters are truncated", () => {
  assert.deepEqual(testimonialPreview("Great service!"), {
    text: "Great service!",
    truncated: false,
  });
  assert.deepEqual(testimonialPreview(`<p>${"a".repeat(180)}</p>`), {
    text: "a".repeat(180),
    truncated: false,
  });
  assert.deepEqual(testimonialPreview(`<p>${"a".repeat(181)}</p>`), {
    text: `${"a".repeat(180)}…`,
    truncated: true,
  });
});

test("rich text excerpts preserve paragraph spacing, entities and Unicode characters", () => {
  assert.equal(
    testimonialPlainText(
      "<p>Helpful &amp; friendly.</p><p>We&#39;ll return!<br>Thanks&nbsp;again.</p>",
    ),
    "Helpful & friendly. We'll return! Thanks again.",
  );
  assert.equal(testimonialPlainText("&lt;excellent&gt; &#x1F600;"), "<excellent> 😀");
  assert.deepEqual(testimonialPreview("😀".repeat(181)), {
    text: `${"😀".repeat(180)}…`,
    truncated: true,
  });
  assert.deepEqual(testimonialPreview(`<p>${"&amp;".repeat(180)}</p>`), {
    text: "&".repeat(180),
    truncated: false,
  });
});

test("missing and empty rich text does not create testimonial content", () => {
  for (const value of [undefined, null, "", "<p><br></p>", "<p>&nbsp;</p>"]) {
    assert.deepEqual(testimonialPreview(value), { text: "", truncated: false });
  }
});
