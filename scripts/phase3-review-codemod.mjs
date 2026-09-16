import { readFile, writeFile } from "node:fs/promises";

const path = "apps/showcase/app/page.tsx";
let source = await readFile(path, "utf8");

const replaceOnce = (from, to, label) => {
  if (source.includes(to)) return;
  if (!source.includes(from)) throw new Error(`Phase 3 review codemod could not find ${label}`);
  source = source.replace(from, to);
};

replaceOnce(
  '<main className={cn("min-h-screen", material.canvas)}>',
  '<main className={cn("min-h-screen text-left", material.canvas)}>',
  "showcase root alignment"
);

replaceOnce(
  '<div className={cn("flex min-h-20 items-center justify-center px-4 text-sm", shape.control, className)}>{label}</div>',
  '<div\n        data-testid={label ? `tile-${label.toLowerCase().replace(/\\s+/g, "-")}` : undefined}\n        className={cn("flex min-h-20 items-center justify-center px-4 text-sm", shape.control, className)}\n      >\n        {label}\n      </div>',
  "stable Tile test target"
);

await writeFile(path, source);
console.log("Applied Phase 3 review fixture cleanup.");
