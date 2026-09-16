import { Badge, Card, Divider } from "sherick-ui";

export default function VerificationServerPage() {
  return (
    <main className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink">
      <section className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Server component fixture</h1>
        <Card>
          <div className="flex items-center gap-3">
            <Badge>Server rendered</Badge>
            <span>Passive Sherick UI components imported from the public package barrel.</span>
          </div>
          <Divider className="my-5" />
          <p className="text-sherick-ink-muted">
            This route intentionally has no use client directive.
          </p>
        </Card>
      </section>
    </main>
  );
}
