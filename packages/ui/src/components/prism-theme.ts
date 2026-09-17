import { PrismTheme } from "prism-react-renderer";

const theme: PrismTheme = {
  plain: {
    color: "var(--sui-code-text)",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "var(--sui-code-comment)",
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
        color: "var(--sui-code-string)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "var(--sui-code-text)",
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
        color: "var(--sui-code-number)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector"],
      style: {
        color: "var(--sui-code-keyword)",
      },
    },
    {
      types: ["function", "deleted"],
      style: {
        color: "var(--sui-code-function)",
      },
    },
    {
      types: ["function-variable"],
      style: {
        color: "var(--sui-code-keyword)",
      },
    },
    {
      types: ["tag", "selector", "keyword"],
      style: {
        color: "var(--sui-code-tag)",
      },
    },
  ],
};

export default theme;
