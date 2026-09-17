"use client";

import { useState } from "react";
import { Button, Dialog, Input, Search, Select, Table, Tabs, Textarea } from "sherick-ui";

const projectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
];

const tableRows = [
  ["Primary", "128"],
  ["Secondary", "64"],
];

export default function VerificationResponsivePage() {
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main
      data-testid="verification-responsive"
      className="min-h-screen bg-sherick-canvas p-6 text-sherick-ink"
    >
      <section className="flex flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Responsive fixture</h1>
          <p className="text-sherick-ink-muted">
            Controls must fit a deliberately narrow container and never widen the page.
          </p>
        </header>

        <div
          data-testid="narrow-container"
          style={{ width: 240 }}
          className="flex flex-col gap-5"
        >
          <Input label="Narrow project name" defaultValue="Sherick UI" />

          <Textarea label="Narrow notes" defaultValue="A short note." />

          <Search
            aria-label="Narrow search"
            value={query}
            onValueChange={setQuery}
            onSearch={() => undefined}
            debounceMs={0}
          />

          <Select
            aria-label="Narrow project type"
            options={projectOptions}
            defaultValue="design"
          />

          <div className="overflow-x-auto">
            <Tabs
              ariaLabel="Narrow sections"
              tabs={[
                { id: "overview", label: "Overview", content: "Overview panel" },
                { id: "behavior", label: "Behavior", content: "Behavior panel" },
                { id: "themes", label: "Themes", content: "Themes panel" },
              ]}
            />
          </div>

          <Table
            headers={["Step", "Value"]}
            rows={tableRows}
          />

          <div className="flex flex-col items-start gap-2">
            <Button appearance="filled" onClick={() => setDialogOpen(true)}>
              Open narrow dialog
            </Button>
            <span data-testid="narrow-dialog-state" className="text-xs">
              {dialogOpen ? "open" : "closed"}
            </span>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Header>Narrow dialog</Dialog.Header>
          <Dialog.Description>
            The overlay fills the viewport without widening the page.
          </Dialog.Description>
          <Dialog.Content>
            <Select
              aria-label="Narrow dialog project type"
              options={projectOptions}
              defaultValue="design"
            />
          </Dialog.Content>
          <Dialog.Footer>
            <Button appearance="filled">Confirm</Button>
          </Dialog.Footer>
        </Dialog>
      </section>
    </main>
  );
}
