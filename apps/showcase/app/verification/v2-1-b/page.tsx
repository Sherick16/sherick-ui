"use client";

import { useState } from "react";
import { Moon } from "lucide-react";
import { Button, DirectionProvider } from "sherick-ui";
import Command, { type CommandItem } from "../../../../../packages/ui/src/components/Command";
import CommandPalette from "../../../../../packages/ui/src/components/CommandPalette";

const commands: CommandItem[] = [
  { value: "settings", label: "Open settings", group: "Navigation" },
  { value: "workspace", label: "Go to workspace", group: "Navigation" },
  {
    value: "dark",
    label: "Switch to dark theme",
    group: "Appearance",
    icon: <Moon />,
    shortcut: "\u2318D",
    keywords: ["night", "dim"],
  },
  { value: "light", label: "Switch to light theme", group: "Appearance", keywords: ["day"] },
  {
    value: "long",
    label: "A command whose label is far longer than the sheet it is listed in",
    group: "Appearance",
  },
  { value: "delete", label: "Delete workspace", group: "Appearance", disabled: true },
  /* A list may hold ungrouped commands beside grouped ones. */
  { value: "note", label: "Create a quick note" },
];

const Band = ({ name, children }: { name: string; children: React.ReactNode }) => (
  <section data-band={name} className="flex min-w-0 flex-col gap-4">
    <h2 className="text-lg font-medium">{name}</h2>
    {children}
  </section>
);

export default function VerificationCommandPage() {
  const [action, setAction] = useState("none");
  const [actions, setActions] = useState(0);
  const [query, setQuery] = useState("initial");
  const [palette, setPalette] = useState("closed");
  const [controlledPaletteOpen, setControlledPaletteOpen] = useState(false);
  const [submitted, setSubmitted] = useState(0);

  const report = (value: string) => {
    setAction(value);
    setActions((count) => count + 1);
  };

  return (
    <main
      data-testid="verification-v2-1-b"
      className="min-h-screen space-y-10 bg-sherick-canvas p-6 text-sherick-ink sm:p-10"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Command verification</h1>
        <p className="text-sherick-ink-muted">
          Focused fixture for the v2.1 command family: filtering, groups, activation and palette modality.
        </p>
      </header>

      <Band name="Standalone">
        {/* Running a command must not submit the form it happens to sit in. */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted((count) => count + 1);
          }}
        >
          <Command
            items={commands}
            label="Search commands"
            placeholder="Search commands"
            onAction={report}
          />
        </form>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span data-testid="command-action">{action}</span>
          <span data-testid="command-actions">{actions}</span>
          <span data-testid="command-submitted">{submitted}</span>
        </div>
      </Band>

      <Band name="Disabled">
        <Command
          items={commands}
          label="Search disabled commands"
          placeholder="Search commands"
          disabled
        />
      </Band>

      <Band name="Controlled query">
        <Command
          items={commands}
          label="Controlled query"
          placeholder="Search commands"
          value={query}
          onValueChange={(next) => setQuery(next)}
        />
        <span data-testid="command-query">{query}</span>
      </Band>

      <Band name="Custom filter">
        <Command
          items={commands}
          label="Commands matched by their value"
          placeholder="Search commands"
          filter={(item, next) => item.value.startsWith(next)}
        />
      </Band>

      <Band name="No filter">
        <Command
          items={commands}
          label="Commands with no filter"
          placeholder="Search commands"
          filter={null}
        />
      </Band>

      <Band name="Palette">
        <CommandPalette
          title="Command palette"
          description="Search the commands, then press Enter."
          label="Search palette commands"
          items={commands}
          trigger={<Button appearance="filled">Open command palette</Button>}
          onOpenChange={(next) => setPalette(next ? "open" : "closed")}
          onAction={report}
        />
        <span data-testid="palette-state">{palette}</span>
      </Band>

      <Band name="Controlled palette">
        <CommandPalette
          title="Controlled command palette"
          label="Search controlled palette commands"
          items={commands}
          trigger={<Button appearance="text" variant="secondary">Open controlled palette</Button>}
          open={controlledPaletteOpen}
          onOpenChange={(next) => setControlledPaletteOpen(next)}
        />
        <span data-testid="controlled-palette-state">
          {controlledPaletteOpen ? "open" : "closed"}
        </span>
      </Band>

      <Band name="Narrow">
        <div data-testid="command-narrow" style={{ width: 240 }}>
          <Command
            items={commands}
            label="Commands in a narrow column"
            placeholder="Search commands"
            id="narrow-command-input"
            className="gap-4"
            inputClassName="text-sm"
            renderItem={(item) => <span data-custom-row={item.value}>{item.label}</span>}
          />
        </div>
      </Band>

      {/* A logical side is resolved against the writing direction, and Base has to be told that
          direction: it never reads the `dir` attribute itself. The pair a real right-to-left
          application sets is a `DirectionProvider` for behavior and the document's `dir` for CSS. */}
      <Band name="RTL">
        <DirectionProvider direction="rtl">
          <div data-testid="command-rtl" dir="rtl" className="max-w-md">
            <Command
              items={commands}
              label="Commands in a right-to-left page"
              placeholder="Search commands"
            />
          </div>
        </DirectionProvider>
      </Band>
    </main>
  );
}
