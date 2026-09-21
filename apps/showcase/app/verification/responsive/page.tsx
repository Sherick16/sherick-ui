"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  Combobox,
  Dialog,
  Field,
  Input,
  Menu,
  NumberField,
  Popover,
  Progress,
  RadioGroup,
  Search,
  SegmentedControl,
  Select,
  Slider,
  Table,
  Tabs,
  Textarea,
} from "sherick-ui";

const projectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "A project type whose name is longer than the field it is chosen in", value: "long" },
];

/* A label long enough to exceed the sheet as well as the 240px anchor. */
const longOptions = [
  { label: "A project name long enough that it cannot fit the popup without a constraint", value: "long" },
  { label: "Short", value: "short" },
];

const regionOptions = [
  { value: "eu", label: "Europe" },
  { value: "us", label: "United States" },
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

          <Field label="Narrow notifications">
            <Checkbox defaultChecked />
          </Field>

          <RadioGroup aria-label="Narrow region" options={regionOptions} defaultValue="eu" />

          <Slider aria-label="Narrow budget" defaultValue={40} />

          <NumberField aria-label="Narrow seats" defaultValue={3} min={1} max={10} />

          <Field label="Narrow combobox">
            <Combobox options={projectOptions} defaultValue="design" />
          </Field>

          {/* A tab row owns its own horizontal overflow, so it is placed here the way an
              application places it: no wrapper, and still no page-level scroll at 320px. */}
          <Tabs
            ariaLabel="Narrow sections"
            tabs={[
              { id: "overview", label: "Overview", content: "Overview panel" },
              { id: "behavior", label: "Behavior", content: "Behavior panel" },
              { id: "themes", label: "Themes", content: "Themes panel" },
            ]}
          />

          <ChipGroup aria-label="Narrow filters" defaultValue={["design"]}>
            <Chip value="design">Design</Chip>
            <Chip value="code">Code</Chip>
          </ChipGroup>

          {/* A segmented control never wraps, so the wrapper scrolls it rather than the page. */}
          <div className="overflow-x-auto">
            <SegmentedControl
              aria-label="Narrow range"
              defaultValue="week"
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ]}
            />
          </div>

          <Progress value={40} label="Narrow progress" locale="en-US" />

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
            <div className="space-y-5">
              <Select
                aria-label="Narrow dialog project type"
                options={projectOptions}
                defaultValue="design"
              />
              <Field label="Narrow dialog combobox">
                <Combobox options={projectOptions} defaultValue="design" />
              </Field>
            </div>
          </Dialog.Content>
          <Dialog.Footer>
            <Button appearance="filled">Confirm</Button>
          </Dialog.Footer>
        </Dialog>

        <div data-testid="edge-surfaces" className="flex flex-col items-start gap-4">
          <Menu>
            <Menu.Trigger
              render={
                <Button appearance="tonal" variant="secondary">
                  Edge menu
                </Button>
              }
            />
            <Menu.Content>
              <Menu.Item>A menu label long enough that it cannot fit the popup without a constraint</Menu.Item>
              <Menu.Item>Short</Menu.Item>
            </Menu.Content>
          </Menu>
          <Popover>
            <Popover.Trigger
              render={
                <Button appearance="tonal" variant="secondary">
                  Edge popover
                </Button>
              }
            />
            <Popover.Content>
              <p className="text-sm">Anchored to the edges of a narrow viewport.</p>
            </Popover.Content>
          </Popover>
          <Field label="Long option combobox">
            <Combobox options={longOptions} defaultValue="long" />
          </Field>
        </div>
      </section>
    </main>
  );
}
