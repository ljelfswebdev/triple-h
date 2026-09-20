import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(target) : [target];
  });
}

const files = sourceFiles("src").filter((file) => /\.[jt]sx?$/.test(file));

test("all rendered dropdowns use the shared React Select component", () => {
  const nativeSelects = files.flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    return source.includes("<select") ? [file] : [];
  });
  assert.deepEqual(nativeSelects, []);
});

test("all empty text controls render useful placeholder text", () => {
  const missing = [];
  const ignoredTypes = new Set([
    "button",
    "checkbox",
    "color",
    "file",
    "hidden",
    "radio",
    "submit",
  ]);

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/<(input|textarea)\b[\s\S]*?\/>/g)) {
      const tag = match[0];
      const type = tag.match(/type=["{]([^"}]+)/)?.[1] || "text";
      if (
        ignoredTypes.has(type) ||
        /className="(?:form-honeypot|site-form__honeypot)"/.test(tag) ||
        /placeholder(?:Text)?=/.test(tag)
      ) {
        continue;
      }
      const line = source.slice(0, match.index).split("\n").length;
      missing.push(`${file}:${line}`);
    }
  }

  assert.deepEqual(missing, []);
});

test("effects never use a Promise-returning loader as their cleanup callback", () => {
  const unsafeEffects = files.flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    return /useEffect\(\s*[A-Za-z_$][\w$]*\s*,/.test(source) ? [file] : [];
  });

  assert.deepEqual(unsafeEffects, []);
});
