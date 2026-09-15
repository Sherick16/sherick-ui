import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { cn } from "@/libs/utils";
import CodeBlock from "./CodeBlock";

const Markdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ className, ...props }: any) => <h1 className={cn("mb-4 mt-8 text-3xl font-semibold tracking-[-0.03em] text-sherick-ink first:mt-0", className)} {...props} />,
        h2: ({ className, ...props }: any) => <h2 className={cn("mb-3 mt-7 text-2xl font-semibold tracking-[-0.025em] text-sherick-ink first:mt-0", className)} {...props} />,
        h3: ({ className, ...props }: any) => <h3 className={cn("mb-2 mt-6 text-xl font-medium text-sherick-ink first:mt-0", className)} {...props} />,
        p: ({ className, ...props }: any) => <p className={cn("my-3 leading-7 text-sherick-ink/[0.86]", className)} {...props} />,
        a: ({ className, ...props }: any) => <a className={cn("font-medium text-sherick-primary underline decoration-sherick-primary/[0.35] underline-offset-4 hover:decoration-sherick-primary", className)} {...props} />,
        ul: ({ className, ...props }: any) => <ul className={cn("my-4 list-disc space-y-2 pl-6 text-sherick-ink/[0.84]", className)} {...props} />,
        ol: ({ className, ...props }: any) => <ol className={cn("my-4 list-decimal space-y-2 pl-6 text-sherick-ink/[0.84]", className)} {...props} />,
        li: ({ className, ...props }: any) => <li className={cn("pl-1 leading-7 marker:text-sherick-primary", className)} {...props} />,
        blockquote: ({ className, ...props }: any) => <blockquote className={cn("my-5 rounded-r-2xl border-l-2 border-sherick-primary/[0.45] bg-sherick-primary/[0.07] px-4 py-2 text-sherick-ink-muted", className)} {...props} />,
        hr: ({ className, ...props }: any) => <hr className={cn("my-7 border-0 border-t border-sherick-ink/[0.06]", className)} {...props} />,
        strong: ({ className, ...props }: any) => <strong className={cn("font-semibold text-sherick-ink", className)} {...props} />,
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return (
            <CodeBlock inline={inline} className={className} language={match ? match[1] : "jsx"}>
              {children}
            </CodeBlock>
          );
        },
      }}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
