import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

const library = await import("../dist/index.esm.js");
const esm = await readFile(new URL("../dist/index.esm.js", import.meta.url), "utf8");
const declarations = await readFile(new URL("../dist/index.d.ts", import.meta.url), "utf8");

for (const exportName of [
  "ActionButton",
  "Avatar",
  "Dropdown",
  "Input",
  "Modal",
  "Search",
  "Switch",
  "TabGroup",
  "Tooltip",
]) {
  assert.ok(library[exportName], `missing public export: ${exportName}`);
}

assert.ok(!esm.includes("next/image"), "bundle must not depend on next/image");
assert.ok(!esm.includes("next/link"), "bundle must not depend on next/link");
assert.ok(!esm.includes("@/"), "bundle must not contain unresolved source aliases");
assert.ok(declarations.includes("ActionButtonProps"), "declarations should expose public component props");

const buttonMarkup = renderToStaticMarkup(
  React.createElement(library.ActionButton, { loading: true }, "Save")
);
assert.match(buttonMarkup, /disabled=""/);
assert.match(buttonMarkup, /aria-busy="true"/);

const inputMarkup = renderToStaticMarkup(
  React.createElement(library.Input, { label: "Email", required: true, name: "email" })
);
assert.match(inputMarkup, /<label for=/);
assert.match(inputMarkup, /required=""/);
assert.match(inputMarkup, /name="email"/);

const avatarMarkup = renderToStaticMarkup(
  React.createElement(library.Avatar, { src: "/avatar.png", alt: "Example avatar" })
);
assert.match(avatarMarkup, /<img/);
assert.match(avatarMarkup, /alt="Example avatar"/);

console.log("Package smoke verification passed.");
