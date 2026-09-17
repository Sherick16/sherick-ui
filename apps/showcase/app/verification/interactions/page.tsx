"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  Input,
  NumberField,
  RadioGroup,
  Search,
  Select,
  Slider,
  Switch,
  Tabs,
  Tooltip,
} from "sherick-ui";

const projectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
];

const regionOptions = [
  { value: "eu", label: "Europe" },
  { value: "us", label: "United States" },
  { value: "apac", label: "Asia Pacific", disabled: true },
];

export default function VerificationInteractionsPage() {
  const [query, setQuery] = useState("initial");
  const [lastSearch, setLastSearch] = useState("");
  const [tab, setTab] = useState("overview");
  const [enabled, setEnabled] = useState(false);
  const [project, setProject] = useState<string | null>("design");
  const [formResult, setFormResult] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [region, setRegion] = useState("eu");
  const [budget, setBudget] = useState(30);
  const [fieldsResult, setFieldsResult] = useState("");

  return (
    <main className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink">
      <section className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Interaction verification</h1>
          <p className="text-sherick-ink-muted">
            Consumer fixture for public API, form and nested-overlay contracts.
          </p>
        </header>

        <Input
          label="Project name"
          defaultValue="Sherick UI"
          description="Visible to everyone in the workspace."
          error
          errorMessage="Project names must be unique."
        />

        <div className="space-y-2">
          <Search
            aria-label="Loading search"
            value={query}
            onValueChange={setQuery}
            onSearch={setLastSearch}
            debounceMs={0}
            loading
          />
          <p data-testid="query-value">{query}</p>
          <p data-testid="last-search">{lastSearch}</p>
        </div>

        <Tabs
          value={tab}
          onValueChange={setTab}
          ariaLabel="Verification tabs"
          tabs={[
            { id: "overview", label: "Overview", content: "Overview panel" },
            { id: "disabled", label: "Disabled", content: "Disabled panel", disabled: true },
            { id: "details", label: "Details", content: "Details panel" },
          ]}
        />
        <p data-testid="tab-value">{tab}</p>

        <form
          className="flex flex-wrap items-center gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setFormResult(
              [...data.entries()]
                .map(([key, value]) => `${key}=${String(value)}`)
                .sort()
                .join("&")
            );
          }}
        >
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            name="enabled"
            value="yes"
            aria-label="Enabled"
          />
          <Select
            aria-label="Project type"
            name="project"
            options={projectOptions}
            value={project}
            onValueChange={setProject}
          />
          <Button type="submit">Submit form</Button>
        </form>
        <p data-testid="form-result">{formResult}</p>

        <Field
          label="Release channel"
          description="Visible to everyone in the workspace."
          error="Pick a release channel."
        >
          <Checkbox name="release" value="stable" defaultChecked />
        </Field>

        <div data-testid="seats-field">
          <Field label="Seats" description="Between 1 and 10." error="Choose between 1 and 10 seats.">
            <NumberField min={1} max={10} defaultValue={3} />
          </Field>
        </div>

        <Checkbox indeterminate aria-label="Partial selection" />

        <p className="text-sm">
          I agree to the <Checkbox aria-label="Inline terms" defaultChecked /> deployment terms.
        </p>

        <RadioGroup label="Region" value={region} onValueChange={setRegion} options={regionOptions} />
        <p data-testid="region-value">{region}</p>

        <Slider
          aria-label="Budget"
          value={budget}
          onValueChange={setBudget}
          min={0}
          max={100}
          step={10}
        />
        <p data-testid="budget-value">{budget}</p>

        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setFieldsResult(
              [...data.entries()]
                .map(([key, value]) => `${key}=${String(value)}`)
                .sort()
                .join("&")
            );
          }}
        >
          <Checkbox aria-label="Form notifications" name="notify" value="yes" defaultChecked />
          <RadioGroup aria-label="Form region" name="formRegion" defaultValue="eu" options={regionOptions} />
          <Slider aria-label="Form budget" name="formBudget" defaultValue={40} />
          <NumberField aria-label="Form seats" name="formSeats" defaultValue={2} min={1} max={10} />
          <Button type="submit">Submit fields</Button>
        </form>
        <p data-testid="fields-result">{fieldsResult}</p>

        <div className="flex items-center gap-4">
          <Button appearance="filled" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <span data-testid="dialog-state">{dialogOpen ? "open" : "closed"}</span>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Header>Nested composition</Dialog.Header>
          <Dialog.Description>
            Child overlays must dismiss before their parent dialog.
          </Dialog.Description>
          <Dialog.Content>
            <div className="space-y-5">
              <p>Escape should close the child popup before the dialog.</p>
              <Select
                aria-label="Dialog project type"
                options={projectOptions}
                defaultValue="design"
              />
              <Tooltip content="Helpful context">
                <Button appearance="text">Help</Button>
              </Tooltip>
            </div>
          </Dialog.Content>
        </Dialog>
      </section>
    </main>
  );
}
