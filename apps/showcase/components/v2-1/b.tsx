"use client";

import { Moon, PenLine, Sun } from "lucide-react";
import { Button, Command, CommandPalette, type CommandItem } from "sherick-ui";

const commands: CommandItem[] = [
  { value: "settings", label: "Open settings", group: "Navigation" },
  { value: "workspace", label: "Go to workspace", group: "Navigation" },
  {
    value: "dark",
    label: "Switch to dark theme",
    group: "Appearance",
    icon: <Moon />,
    shortcut: "⌘D",
    keywords: ["night", "dim"],
  },
  {
    value: "light",
    label: "Switch to light theme",
    group: "Appearance",
    icon: <Sun />,
    shortcut: "⌘L",
    keywords: ["day", "bright"],
  },
  { value: "note", label: "Create a quick note", group: "Appearance", icon: <PenLine /> },
  { value: "delete", label: "Delete workspace", group: "Appearance", disabled: true },
];

const Specimen = ({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-3">
    <h4 className="text-sm font-medium text-sherick-ink">{caption}</h4>
    {children}
  </div>
);

export default function CommandSpecimen() {
  return (
    <div className="grid min-w-0 gap-6">
      <Specimen caption="Command">
        <Command
          items={commands}
          label="Search commands"
          placeholder="Search commands"
          onAction={() => undefined}
        />
      </Specimen>

      <Specimen caption="Command palette">
        <CommandPalette
          title="Run a command"
          description="Search the commands, then press Enter."
          label="Search palette commands"
          items={commands}
          trigger={<Button appearance="tonal" variant="secondary" className="self-start">Open command palette</Button>}
        />
      </Specimen>
    </div>
  );
}
