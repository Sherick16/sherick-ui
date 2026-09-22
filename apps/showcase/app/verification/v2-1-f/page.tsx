"use client";

import V21TreeSpecimen from "../../../components/v2-1/f";

export default function VerificationTreePage() {
  return (
    <main
      data-testid="verification-v2-1-f"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">TreeView verification</h1>
          <p className="text-sherick-ink-muted">
            Unit F fixture for tree navigation, selection, expansion and focus contracts.
          </p>
        </header>

        <V21TreeSpecimen verification />
      </section>
    </main>
  );
}
