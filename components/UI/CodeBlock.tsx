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
import { focusRing } from "./ui.common";
import theme from "./prism-theme";

export interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  language?: string;
}

const CodeBlock = ({
  inline = false,
  className,
  language = "text",
  children,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const code = String(children ?? "").trim();

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const onCopy = async () => {
    if (!navigator.clipboard) return;

    await navigator.clipboard.writeText(code);
    setCopied(true);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return <code className={cn("bg-stone-800 text-white p-1 rounded", className)}>{children}</code>;
  }

  return (
    <div className="group relative mt-4">
      <div className="absolute right-4 top-4 z-10">
        <button
          type="button"
          onClick={() => void onCopy()}
          className={cn(
            "flex items-center space-x-1 rounded-md px-2 py-1 text-xs",
            "bg-gray-700/50 text-gray-300 transition-colors",
            "hover:bg-gray-600/50 hover:text-gray-200",
            focusRing
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
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
              "overflow-x-auto rounded-3xl p-4 text-sm leading-6",
              "bg-gray-800/80 backdrop-blur-xl",
              "border border-gray-700/50",
              highlightClassName
            )}
            style={style}
          >
            <code className="inline-block min-w-full">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="mr-4 inline-block w-4 text-right text-gray-500 select-none">
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
