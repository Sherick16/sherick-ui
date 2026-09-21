"use client";

import { CodeBlock, Markdown } from "sherick-ui/content";

const snippet = `// A comment that has to stay readable on the code well.
export function greet(name: string) {
  return \`Hello, \${name}\`;
}`;

const document = `## Rendered rich content

Body copy with a [link](#) and \`inline code\`.

- Invite members from the workspace settings
- Pin a deployment to keep it live

> Changes are reviewed before they reach production.

\`\`\`bash
# a shell comment
echo "hello"
\`\`\`
`;

export default function VerificationRichContentPage() {
  return (
    <main
      data-testid="verification-rich-content"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Rich content verification</h1>
          <p className="text-sherick-ink-muted">
            The published content subpath, read in the browser the way a consumer reads it.
          </p>
        </header>

        <CodeBlock language="ts">{snippet}</CodeBlock>
        <Markdown>{document}</Markdown>
      </section>
    </main>
  );
}
