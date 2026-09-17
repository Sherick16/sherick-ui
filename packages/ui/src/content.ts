/*
 Rich content behind its own entry point, so a consumer that imports `Button` never *bundles*
 Prism, react-markdown, remark/rehype or KaTeX.

 This is a bundle boundary, not an install boundary: the rich stack stays in `dependencies`,
 so installing the package installs it regardless. The subpath is ESM-only because those
 dependencies publish no CommonJS build; see `docs/RELEASE.md`.
*/
export { default as CodeBlock } from "./components/CodeBlock";
export { default as Markdown } from "./components/Markdown";

export type { CodeBlockProps } from "./components/CodeBlock";
export type { MarkdownProps } from "./components/Markdown";
