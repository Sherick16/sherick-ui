"use client";

import { Button } from "@base-ui/react/button";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
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
import {
  edge,
  elevation,
  focusRing,
  material,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionTactile } from "./ui.motion";
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
    return (
      <code className={cn("px-1.5 py-0.5 font-mono text-[0.9em]", material.matteHigh, shape.pill, tone.text.primary, className)}>
        {children}
      </code>
    );
  }

  return (
    <div className={cn("mt-4 overflow-hidden", shape.prominent, material.matte, elevation.recessed)}>
      <div className={cn("flex min-h-11 items-center justify-between gap-4 px-4 py-2")}>
        <span className={cn("font-mono text-[11px] uppercase tracking-[0.08em]", text.medium)}>
          {language}
        </span>
        <Button
          type="button"
          onClick={() => void onCopy()}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs",
            shape.control,
            motionTactile,
            focusRing,
            text.medium,
            "hover:text-sherick-ink",
            stateLayer.quiet,
            state.enabled
          )}
        >
          {copied ? <Check className={cn("size-3.5")} aria-hidden="true" /> : <Copy className={cn("size-3.5")} aria-hidden="true" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>

      <Highlight
        code={code}
        language={language === "tsx" ? "jsx" : language}
        theme={theme}
        prism={Prism as typeof Prism}
      >
        {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
          /* A code well is the one surface in the library that is **not** a writing-direction
             surface: source code is read left to right whatever the document says, so the well
             declares its own direction and its gutter is physical *inside* it. Everything else
             asymmetric in this library is logical (§17). */
          <pre
            dir="ltr"
            className={cn(
              "overflow-x-auto border-t px-4 py-4 text-sm leading-6",
              edge.rule,
              "bg-sherick-canvas/[0.28]",
              highlightClassName
            )}
            style={style}
          >
            <code className={cn("inline-block min-w-full")}>
              {tokens.map((line, i) => (
                <span key={i} {...getLineProps({ line })} className={cn("block", getLineProps({ line }).className)}>
                  {/* Line numbers are text, so they take a text role: the dimmest tone in the
                      library is furniture, not a readable step. */}
                  <span className={cn("mr-4 inline-block w-4 select-none text-right", text.medium)}>
                    {i + 1}
                  </span>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token });
                    return <span key={key} {...tokenProps} className={cn(tokenProps.className)} />;
                  })}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
};

export default CodeBlock;
