"use client";

import { useState } from "react";
import {
  Alert,
  AlertDialog,
  Badge,
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  Dialog,
  Field,
  Menu,
  NumberField,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tabs,
  ToggleGroup,
  Tooltip,
} from "sherick-ui";

const options = [
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
];

export default function ThemeTorturePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <main className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink" data-testid="theme-torture">
      <style>{`:root {
        --sui-primary: 0.90 0.20 100;
        --sui-primary-strong: 0.86 0.22 100;
        --sui-on-primary: 0.12 0.02 100;
        --sui-danger: 0.48 0.18 255;
        --sui-on-danger: 0.98 0.01 255;
        --sui-warning: 0.72 0.24 330;
        --sui-on-warning: 0.10 0.02 330;
        --sui-success: 0.62 0.14 175;
        --sui-on-success: 0.98 0.01 175;
        --sui-focus: 0.72 0.22 55;
      }`}</style>

      <section className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Theme torture fixture</h1>
          <p className="text-sherick-ink-muted">Semantic roles are intentionally visually incompatible.</p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Button appearance="filled" variant="primary">Primary</Button>
          <Button appearance="filled" variant="danger">Danger</Button>
          <Button appearance="filled" variant="warning">Warning</Button>
          <Button appearance="filled" variant="success">Success</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant="danger">Danger badge</Badge>
          <Badge variant="warning">Warning badge</Badge>
          <Badge variant="success">Success badge</Badge>
        </div>

        <Alert variant="danger">Danger alert</Alert>
        <Alert variant="warning">Warning alert</Alert>
        <Alert variant="success">Success alert</Alert>

        <Switch checked onCheckedChange={() => undefined} variant="success" aria-label="Success switch" />

        <Checkbox defaultChecked aria-label="Torture checkbox" />
        <Checkbox aria-label="Torture unchecked checkbox" />

        <RadioGroup
          aria-label="Torture radio"
          defaultValue="alpha"
          options={[
            { value: "alpha", label: "Alpha" },
            { value: "beta", label: "Beta" },
          ]}
        />

        <Field label="Torture slider">
          <Slider defaultValue={45} />
        </Field>

        <Field label="Torture number" error="Out of range.">
          <NumberField defaultValue={2} min={1} max={10} />
        </Field>

        <Tabs
          defaultValue="one"
          tabs={[
            { id: "one", label: "Selected", content: "Selected panel" },
            { id: "two", label: "Other", content: "Other panel" },
          ]}
        />

        {/* A pressed toggle and a progress fill both carry their meaning in tone alone, which is
            what forced colors removes. */}
        <div className="flex flex-wrap items-center gap-4" data-testid="torture-toggle-family">
          <ChipGroup aria-label="Torture filters" defaultValue={["alpha"]}>
            <Chip value="alpha">Alpha</Chip>
            <Chip value="beta">Beta</Chip>
          </ChipGroup>
          <ToggleGroup aria-label="Torture view" defaultValue={["list"]}>
            <ToggleGroup.Item value="list">List</ToggleGroup.Item>
            <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
          </ToggleGroup>
        </div>

        <div className="w-64">
          <Progress value={40} label="Torture progress" locale="en-US" />
        </div>

        <Select aria-label="Torture select" options={options} defaultValue="alpha" variant="warning" />

        <Tooltip content="Torture tooltip">
          <Button appearance="text">Tooltip trigger</Button>
        </Tooltip>

        <Button appearance="filled" onClick={() => setDialogOpen(true)}>Open torture dialog</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Header>Torture dialog</Dialog.Header>
          <Dialog.Description>Custom theme tokens must survive the portal.</Dialog.Description>
          <Dialog.Content>
            <Button appearance="filled" variant="danger">Dialog danger</Button>
          </Dialog.Content>
        </Dialog>

        <Menu>
          <Menu.Trigger render={<Button appearance="tonal" variant="secondary">Open torture menu</Button>} />
          <Menu.Content>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Item variant="danger">Delete deployment</Menu.Item>
          </Menu.Content>
        </Menu>

        <Popover>
          <Popover.Trigger render={<Button appearance="tonal" variant="secondary">Open torture popover</Button>} />
          <Popover.Content>
            <p className="text-sm">Torture popover content</p>
          </Popover.Content>
        </Popover>


        <Button appearance="filled" variant="danger" onClick={() => setAlertOpen(true)}>
          Open torture alert
        </Button>
        <AlertDialog
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title="Torture alert"
          description="Semantic roles must survive the portal."
          confirmLabel="Torture confirm"
        />
      </section>
    </main>
  );
}
