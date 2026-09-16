import { PrismTheme } from "prism-react-renderer";

const theme: PrismTheme = {
  plain: {
    color: "var(--sui-code-text, #e2e8f0)",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "var(--sui-code-comment, #64748b)",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ["string", "attr-value"],
      style: {
        color: "var(--sui-code-string, #a5d6ff)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "var(--sui-code-text, #e2e8f0)",
      },
    },
    {
      types: [
        "entity",
        "url",
        "symbol",
        "number",
        "boolean",
        "variable",
        "constant",
        "property",
        "regex",
        "inserted",
      ],
      style: {
        color: "var(--sui-code-number, #f97316)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "var(--sui-code-keyword, #c084fc)",
      },
    },
    {
      types: ["function", "deleted"],
      style: {
        color: "var(--sui-code-function, #ff7b72)",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "var(--sui-code-keyword, #c084fc)",
      },
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "var(--sui-code-tag, #7dd3fc)",
      },
    },
  ],
};

export default theme;
