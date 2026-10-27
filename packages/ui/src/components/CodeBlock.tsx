"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Highlight } from "prism-react-renderer";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-css.js";
import "prismjs/components/prism-diff.js";
import "prismjs/components/prism-docker.js";
import "prismjs/components/prism-git.js";
import "prismjs/components/prism-go.js";
import "prismjs/components/prism-graphql.js";
import "prismjs/components/prism-java.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-kotlin.js";
import "prismjs/components/prism-markdown.js";
import "prismjs/components/prism-markup.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-sql.js";
import "prismjs/components/prism-yaml.js";
import { cn, type TimerHandle } from "@/libs/utils";
import Button from "./Button";
import ScrollRegion from "./scroll-region";
import {
  codeWell,
  edge,
  iconSlot,
  iconStroke,
  material,
  recessedTop,
  shape,
  state,
  text,
  tone,
  type,
} from "./ui.common";
import { motionArrive } from "./ui.motion";
import theme from "./prism-theme";

// React owns the markup. Prism's automatic document scan otherwise rewrites it
// before hydration (and also highlights unrelated consumer code blocks).
Prism.manual = true;

export interface InlineCodeProps {
  className?: string;
  children?: ReactNode;
}

/* Code inside a sentence: a chip of the matte step in the monospace stack. It is a plain `code` element
   with no copy action, because a phrase is read where it sits and is not lifted out of the text. */
export const InlineCode = ({ className, children }: InlineCodeProps) => (
  <code className={cn("px-1.5 py-0.5 font-sherick-mono text-[0.9em]", material.matteHigh, shape.row, text.high, className)}>
    {children}
  </code>
);

export interface CodeBlockProps {
  /** @deprecated Render `InlineCode` for code inside a sentence. This is kept for one minor and maps to it. */
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  language?: string;
  /** The copy action's label. */
  copyLabel?: string;
  /** The copy action's label once the code is on the clipboard. */
  copiedLabel?: string;
}

type CopyState = "idle" | "copied" | "failed";

const failedLabel = "Copy failed";

const CodeBlock = ({
  inline = false,
  className,
  language = "text",
  copyLabel = "Copy",
  copiedLabel = "Copied",
  children,
}: CodeBlockProps) => {
  const [copy, setCopy] = useState<CopyState>("idle");
  const resetTimer = useRef<TimerHandle | null>(null);
  const code = String(children ?? "").trim();

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const onCopy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("The clipboard is not available here.");
      await navigator.clipboard.writeText(code);
      setCopy("copied");
    } catch {
      /* A refused or missing clipboard is a state the reader can see, not an unhandled rejection. */
      setCopy("failed");
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopy("idle"), 2000);
  };

  if (inline) return <InlineCode className={cn(className)}>{children}</InlineCode>;

  /* The copy mark: two glyphs in one grid cell, so one is always there and the swap is a cross-fade rather
     than a change of box. */
  const copyMark = (
    <span className={cn(iconSlot.compact, "grid")}>
      <HugeiconsIcon
        icon={Copy01Icon}
        aria-hidden="true"
        className={cn(iconStroke.glyph, "col-start-1 row-start-1", motionArrive, copy === "copied" ? "opacity-0" : "opacity-100")}
      />
      <HugeiconsIcon
        icon={Tick02Icon}
        aria-hidden="true"
        className={cn(iconStroke.glyph, "col-start-1 row-start-1", motionArrive, copy === "copied" ? "opacity-100" : "opacity-0")}
      />
    </span>
  );

  /* Every label sits in the same grid cell, and only the current one is visible. The cell is as wide as the
     widest label, so the action keeps one width whatever it says. */
  const labels: Array<[CopyState, string]> = [
    ["idle", copyLabel],
    ["copied", copiedLabel],
    ["failed", failedLabel],
  ];

  /* What a screen reader hears. It is an empty live region until a copy settles, so each result is news. */
  const announcement = copy === "copied" ? copiedLabel : copy === "failed" ? failedLabel : "";

  return (
    /* A wide well shows only its shaded upper wall: the full recessed pair is calibrated for narrow
       tracks, and drawn around a wide panel it reads as an outline. */
    <div className={cn("mt-4 overflow-hidden", shape.prominent, material.matteFlat, recessedTop, className)}>
      <div className={cn("flex min-h-11 items-center justify-between gap-4 px-4 py-2")}>
        <span className={cn("font-sherick-mono", type.caption, text.medium)}>
          {language}
        </span>
        {/* The copy action is a text action at the block's end edge, so its end padding hangs past the header
            and its label sits on the edge (§17). The vertical margin keeps the header at its own height. */}
        <Button
          appearance="text"
          size="sm"
          variant="secondary"
          icon={copyMark}
          onClick={() => void onCopy()}
          className={cn("-me-4 -my-2", state.quietInk)}
        >
          <span className={cn("grid")}>
            {labels.map(([name, label]) => (
              <span
                key={name}
                className={cn("col-start-1 row-start-1", copy !== name && "invisible", name === "failed" && tone.text.danger)}
              >
                {label}
              </span>
            ))}
          </span>
        </Button>
        <span role="status" aria-live="polite" className={cn("sr-only")}>
          {announcement}
        </span>
      </div>

      <Highlight
        code={code}
        language={language === "tsx" ? "jsx" : language}
        theme={theme}
        prism={Prism as typeof Prism}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => {
          /* The gutter is as wide as the largest line number, in the font's own unit, so three-digit numbers
             never reach the code beside them. */
          const digits = String(tokens.length).length;

          return (
            /* A code well is the one surface in the library that is **not** a writing-direction
               surface: source code is read left to right whatever the document says, so the well
               declares its own direction and its gutter is physical *inside* it. Everything else
               asymmetric in this library is logical (§17). The theme's own background is removed here,
               because it would paint over the well's fill and leave the well transparent. */
            <ScrollRegion
              as="pre"
              dir="ltr"
              label={language === "text" ? "Code" : `${language} code`}
              className={cn(
                "border-t px-4 py-4 m-0 font-sherick-mono text-sm leading-6",
                edge.rule,
                codeWell,
                highlightClassName
              )}
              style={{ ...style, backgroundColor: undefined }}
            >
              <code className={cn("inline-block min-w-full")}>
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line });
                  return (
                    <span key={i} {...lineProps} className={cn("block", lineProps.className)}>
                      {/* Line numbers are text, so they take a text role: the dimmest tone in the
                          library is furniture, not a readable step. They are decoration to a reader of
                          the code, so they are hidden from assistive technology. */}
                      <span
                        aria-hidden="true"
                        className={cn("mr-4 inline-block select-none text-right", text.medium)}
                        style={{ width: `${digits}ch` }}
                      >
                        {i + 1}
                      </span>
                      {line.map((token, key) => {
                        const tokenProps = getTokenProps({ token });
                        return <span key={key} {...tokenProps} className={cn(tokenProps.className)} />;
                      })}
                    </span>
                  );
                })}
              </code>
            </ScrollRegion>
          );
        }}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
