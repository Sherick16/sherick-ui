import { readFile, writeFile } from "node:fs/promises";

const path = "packages/ui/src/components/ui.common.ts";
let source = await readFile(path, "utf8");

const replaceOnce = (from, to, label) => {
  if (!source.includes(from)) throw new Error(`Phase 3 codemod could not find ${label}`);
  source = source.replace(from, to);
};

replaceOnce(
  `export const focusRingInset =\n  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";`,
  `export const focusRingInset =\n  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";\n\n/* Composite controls use the same focus language, driven by their owning input/button. */\nexport const focusRingWithin =\n  "focus-within:outline focus-within:outline-2 focus-within:outline-sherick-focus focus-within:outline-offset-[3px]";\n\nexport const groupFocusRing =\n  "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]";`,
  "canonical composite focus recipes"
);

source = source.replace(
  /\n  \/\* The same physical depth, named for the moment a control reaches it by being held[\s\S]*?\n  pressed: "shadow-sherick-pressed",/,
  ""
);

const fallbackReplacements = new Map([
  ["var(--sui-glass-blur,32px)", "var(--sui-glass-blur)"],
  ["var(--sui-glass-saturation,1.45)", "var(--sui-glass-saturation)"],
  ["var(--sui-glass-brightness,1.04)", "var(--sui-glass-brightness)"],
  ["var(--sui-glass-dense-blur,26px)", "var(--sui-glass-dense-blur)"],
  ["var(--sui-glass-dense-saturation,1.38)", "var(--sui-glass-dense-saturation)"],
  ["var(--sui-glass-dense-brightness,1.035)", "var(--sui-glass-dense-brightness)"],
  ["var(--sui-overlay-fill,0.9)", "var(--sui-overlay-fill)"],
  ["var(--sui-glass-hero-blur,14px)", "var(--sui-glass-hero-blur)"],
  ["var(--sui-glass-hero-saturation,1.06)", "var(--sui-glass-hero-saturation)"],
  ["var(--sui-glass-hero-brightness,1)", "var(--sui-glass-hero-brightness)"],
]);

for (const [from, to] of fallbackReplacements) {
  if (!source.includes(from)) throw new Error(`Phase 3 codemod could not find ${from}`);
  source = source.replaceAll(from, to);
}

source = source
  .replace("floating, recessed (published alias `pressed`) plus the tactile control step tactile matte", "floating, recessed plus the tactile control step tactile matte")
  .replace("   - recessed: the other half of that pair: a groove, a track or a well, which is\n               recessed by definition, and a raised control while it is held, which\n               lands at the same depth. `pressed` is the published alias for that depth;\n               prefer `recessed` whenever the surface is simply sunk rather than held.\n", "   - recessed: the other half of that pair: a groove, a track or a well, which is\n               recessed by definition, and a raised control while it is held, which\n               lands at the same depth.\n");

if (source.includes("shadow-sherick-pressed")) {
  throw new Error("Phase 3 codemod left the retired pressed shadow utility behind");
}

await writeFile(path, source);
console.log("Applied Phase 3 canonical recipe cleanup.");
