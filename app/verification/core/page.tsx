"use client";

import {
  Button,
  Dialog,
  Input,
  Select,
  Switch,
  Tabs,
} from "sherick-ui";

const noop = () => undefined;

export default function VerificationCorePage() {
  return (
    <main
      data-testid="verification-core"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Sherick UI verification</h1>
          <p className="text-sherick-ink-muted">
            Stable browser fixture for package and visual architecture checks.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <Button appearance="filled">Primary</Button>
          <Button variant="secondary">Tonal</Button>
          <Button appearance="text" variant="secondary">Quiet</Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Project name" defaultValue="Sherick UI" />
          <Select
            options={[
              { label: "Design system", value: "design" },
              { label: "Dashboard", value: "dashboard" },
            ]}
            defaultValue="design"
          />
        </div>

        <div className="flex items-center gap-5">
          <Switch checked onChange={noop} aria-label="Enabled" />
          <span className="text-sm text-sherick-ink-muted">Enabled state</span>
        </div>

        <Tabs
          tabs={[
            { id: "overview", label: "Overview", content: "Overview panel" },
            { id: "behavior", label: "Behavior", content: "Behavior panel" },
            { id: "themes", label: "Themes", content: "Themes panel" },
          ]}
        />

        <Dialog open={false} onClose={noop}>
          <Dialog.Header>Closed dialog</Dialog.Header>
          <Dialog.Content>This must remain absent after hydration.</Dialog.Content>
        </Dialog>
      </section>
    </main>
  );
}
