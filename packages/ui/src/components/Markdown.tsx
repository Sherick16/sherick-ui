import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { cn } from "@/libs/utils";
import { edge, shape, text, tone } from "./ui.common";
import CodeBlock from "./CodeBlock";

/* Markdown sets its own type scale but takes every color, shape and rule from the
   primitives, so dropping it into a new surface needs no visual decisions. */
const components: Components = {
  h1: ({ className, ...props }) => <h1 className={cn("mb-4 mt-8 text-3xl font-semibold tracking-[-0.03em] first:mt-0", text.high, className)} {...props} />,
  h2: ({ className, ...props }) => <h2 className={cn("mb-3 mt-7 text-2xl font-semibold tracking-[-0.025em] first:mt-0", text.high, className)} {...props} />,
  h3: ({ className, ...props }) => <h3 className={cn("mb-2 mt-6 text-xl font-medium first:mt-0", text.high, className)} {...props} />,
  p: ({ className, ...props }) => <p className={cn("my-3 leading-7", text.high, className)} {...props} />,
  a: ({ className, ...props }) => <a className={cn("font-medium underline decoration-sherick-primary/[0.35] underline-offset-4 hover:decoration-sherick-primary", tone.text.primary, className)} {...props} />,
  ul: ({ className, ...props }) => <ul className={cn("my-4 list-disc space-y-2 pl-6", text.high, className)} {...props} />,
  ol: ({ className, ...props }) => <ol className={cn("my-4 list-decimal space-y-2 pl-6", text.high, className)} {...props} />,
  li: ({ className, ...props }) => <li className={cn("pl-1 leading-7 marker:text-sherick-primary", className)} {...props} />,
  blockquote: ({ className, ...props }) => <blockquote className={cn("my-5 px-4 py-2", shape.control, "rounded-l-none border-l-2 border-sherick-primary/[0.45]", tone.soft.primary, text.medium, className)} {...props} />,
  hr: ({ className, ...props }) => <hr className={cn("my-7 h-0 border-0 border-t", edge.rule, className)} {...props} />,
  strong: ({ className, ...props }) => <strong className={cn("font-semibold", text.high, className)} {...props} />,
  /* A fenced block reaches `code` wrapped in `pre`, which would nest a second `pre`
     inside the code surface and inherit the browser's monospace block styling. The
     block wrapper is dropped so `CodeBlock` owns the whole treatment. */
  pre: ({ children }) => <>{children}</>,
  /* Without `inline` (removed in react-markdown 9), a block is a fenced one: it carries
     a `language-*` class or, when the fence is bare, the trailing newline markdown
     always leaves on the last line. Anything else is an inline chip. */
  code: ({ className, children, ...props }) => {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    const code = String(children ?? "");
    return language !== undefined || code.endsWith("\n") ? (
      <CodeBlock language={language ?? "text"}>{code}</CodeBlock>
    ) : (
      <CodeBlock inline className={className} {...props}>{children}</CodeBlock>
    );
  },
};

export interface MarkdownProps {
  children: string;
}

const Markdown = ({ children }: MarkdownProps) => {
  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
