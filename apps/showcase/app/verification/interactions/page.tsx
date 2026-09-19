"use client";

import { useState } from "react";
import {
  AlertDialog,
  Button,
  Checkbox,
  Combobox,
  Dialog,
  Field,
  Input,
  Menu,
  NumberField,
  Popover,
  RadioGroup,
  Search,
  Select,
  Slider,
  Switch,
  Tabs,
  Tooltip,
} from "sherick-ui";
import { BaseDirectionProvider } from "sherick-ui/dev";

const projectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
];

const regionOptions = [
  { value: "eu", label: "Europe" },
  { value: "us", label: "United States" },
  { value: "apac", label: "Asia Pacific", disabled: true },
];

const languageOptions = [
  { label: "TypeScript", value: "ts" },
  { label: "Rust", value: "rust" },
  { label: "COBOL", value: "cobol", disabled: true },
];

const teamOptions = [
  { label: "Platform", value: "platform" },
  { label: "Design", value: "design" },
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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverReason, setPopoverReason] = useState("");
  const [popoverOwner, setPopoverOwner] = useState("");
  const [menuAction, setMenuAction] = useState("");
  const [comboboxValue, setComboboxValue] = useState<string | null>("design");
  const [comboboxFormResult, setComboboxFormResult] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertOutcome, setAlertOutcome] = useState("");

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
          <Field label="Seats" description="Between 1 and 10." error="Choose between 1 and 10 seats." required>
            <NumberField min={1} max={10} defaultValue={3} required />
          </Field>
        </div>

        <Field
          label="Priority"
          description="A field can validate on its own, without a message prop."
          validate={(fieldValue) => (Number(fieldValue) > 5 ? "Choose five or fewer" : null)}
          validationMode="onChange"
        >
          <NumberField defaultValue={2} min={1} max={10} />
        </Field>

        <Field label="Locked by its field" disabled>
          <Checkbox name="locked" value="yes" />
        </Field>

        <table className="w-64 border-collapse text-sm">
          <tbody>
            {["First row", "Second row", "Third row"].map((rowLabel) => (
              <tr key={rowLabel} className="h-12">
                <td className="pr-3">
                  <Checkbox aria-label={rowLabel} name={rowLabel} value="yes" />
                </td>
                <td>{rowLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Checkbox indeterminate aria-label="Partial selection" />

        <p className="text-sm">
          I agree to the <Checkbox aria-label="Inline terms" defaultChecked /> deployment terms.
        </p>

        <RadioGroup label="Region" value={region} onValueChange={setRegion} options={regionOptions} />
        <p data-testid="region-value">{region}</p>

        <div data-testid="budget-slider">
          <Slider
            label="Budget"
            value={budget}
            onValueChange={setBudget}
            min={0}
            max={100}
            step={10}
          />
        </div>
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

        <div className="flex flex-wrap items-center gap-4">
          {/* Base's open-change callback keeps its own signature, event details included. */}
          <Popover
            open={popoverOpen}
            onOpenChange={(open, eventDetails) => {
              setPopoverOpen(open);
              setPopoverReason(eventDetails.reason);
            }}
          >
            <Popover.Trigger
              render={
                <Button appearance="tonal" variant="secondary">
                  Open popover
                </Button>
              }
            />
            <Popover.Content>
              <div className="w-64 space-y-4">
                <Input
                  label="Popover owner"
                  value={popoverOwner}
                  onChange={(event) => setPopoverOwner(event.target.value)}
                />
                <Button appearance="filled" onClick={() => setPopoverOpen(false)}>
                  Apply
                </Button>
              </div>
            </Popover.Content>
          </Popover>
          <span data-testid="popover-state">{popoverOpen ? "open" : "closed"}</span>
          <span data-testid="popover-reason">{popoverReason}</span>
          <span data-testid="popover-owner">{popoverOwner}</span>
        </div>

        {/* Anchored above its trigger, so the entrance geometry has a resolved side that is not
            the default one. */}
        <div className="flex flex-wrap items-center gap-4">
          <Popover>
            <Popover.Trigger
              render={
                <Button appearance="tonal" variant="secondary">
                  Open top popover
                </Button>
              }
            />
            <Popover.Content side="top">
              <p className="text-sm">Anchored above the control that opened it.</p>
            </Popover.Content>
          </Popover>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Menu>
            <Menu.Trigger
              render={
                <Button appearance="tonal" variant="secondary">
                  Open menu
                </Button>
              }
            />
            <Menu.Content>
              <Menu.Item onClick={() => setMenuAction("rename")}>Rename</Menu.Item>
              <Menu.Item disabled>Duplicate</Menu.Item>
              <Menu.Item onClick={() => setMenuAction("archive")}>
                Archive every deployment in this workspace
              </Menu.Item>
              <Menu.Item disabled>Transfer ownership</Menu.Item>
              <Menu.Separator />
              <Menu.Item variant="danger" onClick={() => setMenuAction("delete")}>
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
          <span data-testid="menu-action">{menuAction}</span>
        </div>

        <Field label="Combobox project" description="Search or pick from the list.">
          <Combobox
            options={projectOptions}
            value={comboboxValue}
            onValueChange={setComboboxValue}
          />
        </Field>
        <p data-testid="combobox-value">{comboboxValue ?? ""}</p>

        <Field label="Combobox language" description="Some options cannot be chosen." error="Pick a language." required>
          <Combobox options={languageOptions} required />
        </Field>

        <Field label="Disabled combobox">
          <Combobox options={projectOptions} defaultValue="design" disabled />
        </Field>

        <Field label="Locked combobox" disabled>
          <Combobox options={projectOptions} defaultValue="design" />
        </Field>

        {/* Read-only is not disabled: the value cannot change, but the list still opens and
            browses — only clearing is unavailable. */}
        <Field label="Read-only combobox">
          <Combobox options={projectOptions} defaultValue="design" readOnly />
        </Field>

        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setComboboxFormResult(
              [...data.entries()]
                .map(([key, value]) => `${key}=${String(value)}`)
                .sort()
                .join("&")
            );
          }}
        >
          <Field label="Combobox team" description="Submitted through the control's own hidden input.">
            <Combobox name="team" options={teamOptions} defaultValue="platform" />
          </Field>
          <Button type="submit">Submit combobox</Button>
        </form>
        <p data-testid="combobox-form-result">{comboboxFormResult}</p>

        {/* Base's combobox root drops props it does not destructure, so `id` has to reach the
            input for a native `<label htmlFor>` to name the control. */}
        <div className="flex flex-col gap-2">
          <label htmlFor="combobox-by-id" className="text-sm font-medium">
            Combobox by id
          </label>
          <Combobox id="combobox-by-id" options={projectOptions} />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Menu>
            <Menu.Trigger
              render={
                <button type="button" data-testid="menu-plain-trigger" className="rounded-full px-4 py-2 text-sm">
                  Plain menu trigger
                </button>
              }
            />
            <Menu.Content>
              <Menu.Item onClick={() => setMenuAction("plain")}>Plain action</Menu.Item>
            </Menu.Content>
          </Menu>
        </div>

        {/* A consumer-rendered trigger: the surface hands the element its own props and injects
            no motion into it. */}
        <div className="flex flex-wrap items-center gap-4">
          <Popover>
            <Popover.Trigger
              render={
                <button type="button" data-testid="popover-plain-trigger" className="rounded-full px-4 py-2 text-sm">
                  Plain popover trigger
                </button>
              }
            />
            <Popover.Content>
              <p className="text-sm">The trigger moves however the caller says it moves.</p>
            </Popover.Content>
          </Popover>
        </div>

        {/* A logical side is resolved against the writing direction, and the primitive has to be
            told that direction: it never reads the `dir` attribute itself. These four specimens
            declare the direction to Base and rely on the document's `dir` for the CSS, which is
            the pair a real right-to-left application sets; the browser suite drives both. */}
        {(["ltr", "rtl"] as const).map((direction) => (
          <BaseDirectionProvider key={direction} direction={direction}>
            <div data-testid={`logical-sides-${direction}`} className="flex flex-wrap items-center gap-4">
              {(["inline-start", "inline-end"] as const).map((side) => (
                <Popover key={side}>
                  <Popover.Trigger
                    render={
                      <button
                        type="button"
                        data-testid={`logical-${direction}-${side}`}
                        className="rounded-full px-4 py-2 text-sm"
                      >
                        {direction} {side}
                      </button>
                    }
                  />
                  <Popover.Content side={side}>
                    <p className="text-sm">Anchored to a logical edge.</p>
                  </Popover.Content>
                </Popover>
              ))}
            </div>
          </BaseDirectionProvider>
        ))}

        <div className="flex flex-wrap items-center gap-4">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Tooltip key={side} content={`Hint ${side}`} position={side}>
              <button type="button" data-testid={`tooltip-${side}`} className="rounded-full px-4 py-2 text-sm">
                Tip {side}
              </button>
            </Tooltip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button appearance="filled" variant="danger" onClick={() => setAlertOpen(true)}>
            Delete workspace
          </Button>
          <span data-testid="alert-state">{alertOpen ? "open" : "closed"}</span>
          <span data-testid="alert-outcome">{alertOutcome}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button appearance="filled" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          {/* A control that cannot be used carries no interactive state at all. */}
          <Button disabled>Disabled action</Button>
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
              <Field label="Dialog combobox">
                <Combobox options={projectOptions} defaultValue="design" />
              </Field>
              <Tooltip content="Helpful context">
                <Button appearance="text">Help</Button>
              </Tooltip>
            </div>
          </Dialog.Content>
        </Dialog>

        <AlertDialog
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title="Delete workspace?"
          description="Every project in this workspace is removed. This action cannot be undone."
          cancelLabel="Keep workspace"
          confirmLabel="Delete workspace"
          onConfirm={() => setAlertOutcome("confirmed")}
          onCancel={() => setAlertOutcome("cancelled")}
        />
      </section>
    </main>
  );
}
