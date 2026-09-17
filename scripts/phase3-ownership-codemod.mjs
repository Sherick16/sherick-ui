import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const requireFromUi = createRequire(new URL("../packages/ui/package.json", import.meta.url));
const ts = requireFromUi("typescript");
const componentsDir = "packages/ui/src/components";

const isCnCall = (expression) =>
  ts.isCallExpression(expression) &&
  ts.isIdentifier(expression.expression) &&
  expression.expression.text === "cn";

const wrapWithCn = (expression) =>
  ts.factory.createCallExpression(ts.factory.createIdentifier("cn"), undefined, [expression]);

const ensureCnImport = (source) => {
  const cnImport = /import\s*\{([\s\S]*?)\}\s*from\s*["']@\/libs\/utils["'];?/m;
  const match = source.match(cnImport);

  if (match) {
    if (/\bcn\b/.test(match[1])) return source;
    const replacement = match[0].replace("{", "{ cn,");
    return source.replace(match[0], replacement);
  }

  const importLine = 'import { cn } from "@/libs/utils";\n';
  const clientDirective = /^(["']use client["'];\s*\n)/;
  if (clientDirective.test(source)) {
    return source.replace(clientDirective, `$1\n${importLine}`);
  }
  return `${importLine}\n${source}`;
};

const transformFile = async (path) => {
  const source = await readFile(path, "utf8");
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  let changed = false;
  const transformer = (context) => {
    const visit = (node) => {
      if (
        ts.isJsxAttribute(node) &&
        node.name.text === "className" &&
        node.initializer
      ) {
        if (ts.isStringLiteral(node.initializer)) {
          changed = true;
          return ts.factory.updateJsxAttribute(
            node,
            node.name,
            ts.factory.createJsxExpression(
              undefined,
              wrapWithCn(ts.factory.createStringLiteral(node.initializer.text))
            )
          );
        }

        if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const expression = node.initializer.expression;

          if (isCnCall(expression)) return node;

          if (ts.isArrowFunction(expression)) {
            if (ts.isBlock(expression.body) || isCnCall(expression.body)) return node;
            changed = true;
            return ts.factory.updateJsxAttribute(
              node,
              node.name,
              ts.factory.createJsxExpression(
                undefined,
                ts.factory.updateArrowFunction(
                  expression,
                  expression.modifiers,
                  expression.typeParameters,
                  expression.parameters,
                  expression.type,
                  expression.equalsGreaterThanToken,
                  wrapWithCn(expression.body)
                )
              )
            );
          }

          if (ts.isFunctionExpression(expression)) return node;

          changed = true;
          return ts.factory.updateJsxAttribute(
            node,
            node.name,
            ts.factory.createJsxExpression(undefined, wrapWithCn(expression))
          );
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (root) => ts.visitNode(root, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  if (!changed) {
    result.dispose();
    return false;
  }
  result.dispose();

  // Apply the ownership edit textually so file formatting is preserved: only the
  // className initializer expression is rewritten, never the whole file.
  const edits = [];
  const collect = (node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.name.text === "className" &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      const expression = node.initializer.expression;
      if (ts.isIdentifier(expression) && expression.text === "className") return;
      if (isCnCall(expression)) return;
      if (ts.isArrowFunction(expression)) return;
      if (ts.isFunctionExpression(expression)) return;
      edits.push(node.initializer);
    }
    ts.forEachChild(node, collect);
  };
  collect(sourceFile);
  if (edits.length === 0) return false;
  let output = source;
  for (let index = edits.length - 1; index >= 0; index -= 1) {
    const initializer = edits[index];
    const expression = initializer.expression;
    const text = source.slice(expression.getStart(sourceFile), expression.getEnd());
    output = `${output.slice(0, initializer.getStart(sourceFile))}{cn(${text})}${output.slice(initializer.getEnd())}`;
  }
  output = ensureCnImport(output);
  await writeFile(path, output);
  return true;
};

let changedFiles = 0;
for (const entry of await readdir(componentsDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
  if (await transformFile(join(componentsDir, entry.name))) changedFiles += 1;
}

console.log(`Applied explicit Sherick style ownership to ${changedFiles} component files.`);
