"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertDialog,
  Button,
  Checkbox,
  Combobox,
  Dialog,
  Field,
  IconButton,
  Menu,
  NavItem,
  NumberField,
  Popover,
  RadioGroup,
  Search,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tabs,
  Tooltip,
} from "sherick-ui";
import { Copy, Plus, Trash2 } from "lucide-react";

type Speed = "normal" | "slow" | "reduce";

const speeds: { value: Speed; label: string }[] = [
  { value: "normal", label: "Normal speed" },
  { value: "slow", label: "Slow motion (4×)" },
  { value: "reduce", label: "Reduced motion" },
];

const options = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Marketing site", value: "marketing", disabled: true },
];

const Specimen = ({ intent, note, children }: { intent: string; note: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <div className="space-y-1">
      <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-sherick-ink-muted">{intent}</h2>
      <p className="text-sm text-sherick-ink-muted">{note}</p>
    </div>
    <div className="flex flex-wrap items-center gap-4 rounded-[1.25rem] bg-sherick-surface/[0.55] p-5">{children}</div>
  </section>
);

/**
 * Development-only motion lab.
 *
 * One live specimen per intent, and the anchored family side by side, so an animation can be
 * watched at normal speed, in slow motion, or with motion reduced instead of reasoned about.
 * The speed controls are workbench controls, not an API: they override the canonical duration
 * variables on the document while this page is open, and nothing in the package reads them.
 */
export default function MotionLabPage() {
  const [speed, setSpeed] = useState<Speed>("normal");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [region, setRegion] = useState("eu");
  const [alertVisible, setAlertVisible] = useState(true);

  useEffect(() => {
    if (speed === "normal") delete document.documentElement.dataset.motionSpeed;
    else document.documentElement.dataset.motionSpeed = speed;

    return () => {
      delete document.documentElement.dataset.motionSpeed;
    };
  }, [speed]);

  return (
    <main data-testid="motion-lab" className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink">
      <section className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Motion lab</h1>
          <p className="text-sherick-ink-muted">
            One live specimen per intent, for watching a transition rather than reading about it.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Motion speed">
          {speeds.map((option) => (
            <Button
              key={option.value}
              data-testid={`motion-speed-${option.value}`}
              appearance={speed === option.value ? "filled" : "text"}
              variant="secondary"
              aria-pressed={speed === option.value}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* The family that has to read as one physical idea: the same presence, five triggers. */}
        <Specimen
          intent="anchored family"
          note="The surface grows out of the anchor edge the primitive resolved. Compare Select with Combobox, and Menu with Popover."
        >
          <div className="grid w-full gap-6 sm:grid-cols-2">
            <Field label="Select">
              <Select options={options} defaultValue="design" />
            </Field>
            <Field label="Combobox">
              <Combobox options={options} defaultValue="design" />
            </Field>
            <Field label="Menu">
              <Menu>
                <Menu.Trigger render={<Button appearance="tonal" variant="secondary">Open menu</Button>} />
                <Menu.Content>
                  <Menu.Item>Duplicate</Menu.Item>
                  <Menu.Item>Add to project</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item variant="danger">Delete</Menu.Item>
                </Menu.Content>
              </Menu>
            </Field>
            <Field label="Popover">
              <Popover>
                <Popover.Trigger
                  render={
                    <Button appearance="tonal" variant="secondary" data-testid="lab-popover-trigger">
                      Open popover
                    </Button>
                  }
                />
                <Popover.Content>
                  <p className="text-sm">Anchored content.</p>
                </Popover.Content>
              </Popover>
            </Field>
            <Field label="Tooltip">
              <Tooltip content="Above the control" position="top">
                <Button appearance="tonal" variant="secondary">Hover</Button>
              </Tooltip>
            </Field>
          </div>
        </Specimen>

        <Specimen intent="feedback" note="Non-spatial: tone, focus and highlight only.">
          <Button appearance="text">Hover or press</Button>
          <NavItem href="#feedback">A navigation row</NavItem>
        </Specimen>

        <Specimen
          intent="tactile"
          note="A full control answers a press with its own compression; a small control inside a larger target takes the compact step."
        >
          <Button appearance="filled">Filled</Button>
          <Button appearance="tonal">Tonal</Button>
          <Button appearance="text">Text</Button>
          <IconButton variant="secondary" icon={<Copy className="size-5" />} aria-label="Copy" />
          <IconButton appearance="ghost" variant="secondary" icon={<Plus className="size-5" />} aria-label="Add" />
          <IconButton
            appearance="acrylic"
            variant="secondary"
            icon={<Trash2 className="size-5" />}
            aria-label="Delete"
          />
          <div className="w-40">
            <NumberField aria-label="Stepper" defaultValue={4} min={1} max={10} />
          </div>
          <div className="w-56">
            <Search aria-label="Search" onSearch={() => undefined} placeholder="Search" />
          </div>
          {alertVisible ? (
            <Alert variant="danger" closeable onDismiss={() => setAlertVisible(false)}>
              Dismissible
            </Alert>
          ) : (
            <Button appearance="text" onClick={() => setAlertVisible(true)}>
              Restore alert
            </Button>
          )}
        </Specimen>

        <Specimen intent="arrive" note="A subordinate mark lands inside a boundary that never moves.">
          <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Motion lab checkbox" />
          <Checkbox indeterminate aria-label="Motion lab dash" />
          <RadioGroup
            aria-label="Motion lab region"
            value={region}
            onValueChange={setRegion}
            options={[
              { value: "eu", label: "Europe" },
              { value: "us", label: "United States" },
            ]}
          />
        </Specimen>

        <Specimen intent="orient" note="A persistent affordance turns in place — the only rotation in the library.">
          <p className="text-sm text-sherick-ink-muted">
            Both chevrons above turn; open the Select and the Combobox to compare them.
          </p>
        </Specimen>

        <Specimen intent="relocate" note="A persistent object travels between stable destinations.">
          <Switch aria-label="Motion lab switch" />
          <Tabs
            ariaLabel="Motion lab tabs"
            tabs={[
              { id: "one", label: "Overview", content: "Overview panel" },
              { id: "two", label: "Details", content: "Details panel" },
              { id: "three", label: "History", content: "History panel" },
            ]}
          />
        </Specimen>

        <Specimen intent="direct" note="The pointer owns the geometry; a drag is never interpolated.">
          <div className="w-full max-w-md">
            <Slider aria-label="Motion lab slider" defaultValue={40} />
          </div>
        </Specimen>

        <Specimen intent="modal presence" note="A large surface settles; the plane behind it only fades.">
          <Button appearance="filled" onClick={() => setDialogOpen(true)}>
            Dialog
          </Button>
          <Button appearance="filled" variant="danger" onClick={() => setAlertOpen(true)}>
            Alert dialog
          </Button>
        </Specimen>

        <Specimen intent="activity" note="Continuous movement that reports work rather than answering an event.">
          <div data-testid="lab-spinner">
            <Spinner />
          </div>
          <div data-testid="lab-skeleton" className="w-40">
            <Skeleton className="h-4 w-full" />
          </div>
        </Specimen>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Header>Motion lab dialog</Dialog.Header>
          <Dialog.Description>Opened from the modal presence specimen.</Dialog.Description>
          <Dialog.Content>
            <p>Escape or the close control dismisses it.</p>
          </Dialog.Content>
        </Dialog>

        <AlertDialog
          open={alertOpen}
          onOpenChange={setAlertOpen}
          title="Motion lab alert dialog?"
          description="The same surface as the dialog above."
          confirmLabel="Confirm"
        />
      </section>
    </main>
  );
}
