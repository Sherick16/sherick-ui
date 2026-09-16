"use client";

import { Button, Dialog } from "@/components/UI";

const noop = () => undefined;

export default function VerificationDialogPage() {
  return (
    <main
      data-testid="verification-dialog"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Dialog hydration fixture</h1>
        <p className="text-sherick-ink-muted">
          The dialog is intentionally open during the initial server render.
        </p>
      </div>

      <Dialog open onClose={noop}>
        <Dialog.Header>Published package dialog</Dialog.Header>
        <Dialog.Content>
          This surface verifies initially-open SSR, hydration, focus management and the floating material.
        </Dialog.Content>
        <Dialog.Footer>
          <Button appearance="filled">Confirm</Button>
        </Dialog.Footer>
      </Dialog>
    </main>
  );
}
