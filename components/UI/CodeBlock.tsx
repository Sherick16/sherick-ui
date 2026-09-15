"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Highlight } from "prism-react-renderer";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-diff";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-git";
import "prismjs/components/prism-go";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import { cn, type TimerHandle } from "@/libs/utils";
import {
  edge,
  elevation,
  focusRing,
  material,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import theme from "./prism-theme";

export interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  language?: string;
}

const CodeBlock = ({ inline = false, className, language = "text", children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<TimerHandle | null>(null);
  const code = String(children ?? "").trim();

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const onCopy = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    /* Inline code is a chip, like a badge: same shape role, matte material. */
    return (
      <code className={cn("px-1.5 py-0.5 font-mono text-[0.9em]", material.matteHigh, shape.pill, tone.text.primary, className)}>
        {children}
      </code>
    );
  }

  return (
    <div className={cn("mt-4 overflow-hidden", shape.prominent, material.matte, edge.faint, elevation.control)}>
      <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-2">
        <span className={cn("font-mono text-[11px] uppercase tracking-[0.08em]", text.medium)}>
          {language}
        </span>
        <button
          type="button"
          onClick={() => void onCopy()}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
            shape.control,
            motion.press,
            focusRing,
            text.medium,
            "hover:text-sherick-ink",
            stateLayer.quiet,
            state.press,
            state.enabled
          )}
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <Highlight
        code={code}
        language={language === "tsx" ? "jsx" : language}
        theme={theme}
        prism={Prism as typeof Prism}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              "overflow-x-auto border-t px-4 py-4 text-sm leading-6",
              edge.rule,
              "bg-sherick-canvas/[0.28]",
              highlightClassName
            )}
            style={style}
          >
            <code className="inline-block min-w-full">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className={cn("mr-4 inline-block w-4 select-none text-right", text.low)}>
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
