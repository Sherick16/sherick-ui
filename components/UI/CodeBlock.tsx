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
import { cn } from "@/libs/utils";
import { focusRing, motionState } from "./ui.common";
import theme from "./prism-theme";

export interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  language?: string;
}

const CodeBlock = ({ inline = false, className, language = "text", children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      <code className={cn("rounded-md bg-sherick-surface-high px-1.5 py-0.5 font-mono text-[0.9em] text-sherick-primary", className)}>
        {children}
      </code>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-sherick-surface/[0.78] shadow-inner">
      <div className="flex min-h-11 items-center justify-between gap-4 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-sherick-ink-muted">
          {language}
        </span>
        <button
          type="button"
          onClick={() => void onCopy()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-sherick-ink-muted hover:bg-sherick-ink/[0.055] hover:text-sherick-ink",
            motionState,
            focusRing
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
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
              "overflow-x-auto border-t border-sherick-ink/[0.045] px-4 py-4 text-sm leading-6",
              "bg-sherick-canvas/[0.28]",
              highlightClassName
            )}
            style={style}
          >
            <code className="inline-block min-w-full">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="mr-4 inline-block w-4 select-none text-right text-sherick-ink-muted/[0.55]">
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
