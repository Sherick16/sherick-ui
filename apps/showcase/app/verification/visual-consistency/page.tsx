"use client";

import { useState, type ReactNode } from "react";
import { Check, Download, Heart } from "lucide-react";
import {
  Accordion, Alert, AlertDialog, Badge, Button, Card, Checkbox, Chip, Collapsible,
  Dialog, Drawer, Field, IconButton, Input, Menu, NavGroup, NavItem,
  NumberField, Popover, RadioGroup, Search, SegmentedControl, Select, Slider,
  Switch, Table, Tabs, Textarea, ToastProvider, ToastViewport, ToggleGroup, Tooltip,
  useToast, type DrawerSide,
} from "sherick-ui";
import { CodeBlock } from "sherick-ui/content";
import { DirectionProvider } from "sherick-ui";

const options = [
  { value: "one", label: "Workspace" },
  { value: "two", label: "Personal projects" },
  { value: "three", label: "Unavailable", disabled: true },
];

function Band({ name, children }: { name: string; children: ReactNode }) {
  return <section data-band={name} className="space-y-4"><h2 className="text-lg font-medium">{name}</h2>{children}</section>;
}

export default function VisualConsistencyPage() {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [dialog, setDialog] = useState(false);
  const [alert, setAlert] = useState(false);
  const [side, setSide] = useState<DrawerSide>("right");
  const [sheet, setSheet] = useState(false);
  return (
    <DirectionProvider direction={direction}>
      <ToastProvider>
        {/* A locale change mounts a fresh catalog: Base owns layout measurements, including tabs. */}
        <main key={direction} dir={direction} className="min-h-screen space-y-10 bg-sherick-canvas p-6 text-sherick-ink sm:p-10">
          <header className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-semibold">Visual sibling comparisons</h1>
            <Button size="sm" onClick={() => { const next = direction === "ltr" ? "rtl" : "ltr"; setDirection(next); document.documentElement.dir = next; }}>Mirror direction</Button>
          </header>
          <Band name="Actions">
            {(["tonal", "filled", "text"] as const).map((appearance) => <div key={appearance} data-appearance={appearance} className="flex flex-wrap items-center gap-4">
              <Button appearance={appearance} icon={<Download />}>Export</Button>
              <Button appearance={appearance} icon={<Download />} loading>Export</Button>
              <Button appearance={appearance} icon={<Download />} disabled>Export</Button>
              <IconButton appearance={appearance === "tonal" ? "tonal" : "ghost"} icon={<Download />} aria-label={`${appearance} icon`} />
              <IconButton appearance={appearance === "tonal" ? "tonal" : "ghost"} loading aria-label={`${appearance} loading icon`} />
            </div>)}
          </Band>
          <Band name="Fields">
            {(["Default", "Disabled", "Read only", "Invalid"] as const).map((state) => {
              const disabled = state === "Disabled";
              const readOnly = state === "Read only";
              const error = state === "Invalid";
              return <div key={state} data-field-state={state} className="grid grid-cols-1 items-start gap-4 md:grid-cols-3 xl:grid-cols-5">
                <Input label={`${state} input`} defaultValue="Workspace" disabled={disabled} readOnly={readOnly} error={error} />
                <Textarea label={`${state} notes`} defaultValue="Workspace notes with a second readable line." disabled={disabled} readOnly={readOnly} error={error} />
                <Field label={`${state} select`} disabled={disabled} invalid={error}><Select options={options} defaultValue="one" readOnly={readOnly} /></Field>
                <Field label={`${state} number`} disabled={disabled} invalid={error}><NumberField defaultValue={3} min={1} max={10} readOnly={readOnly} /></Field>
                <Search aria-label={`${state} search`} defaultValue="Workspace" disabled={disabled} readOnly={readOnly} loading={error} onSearch={() => undefined} className="mt-7" />
              </div>;
            })}
          </Band>
          <Band name="Selection">
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
              <div className="flex flex-wrap items-center gap-6"><Checkbox aria-label="Empty" /><Checkbox aria-label="Checked" defaultChecked /><Checkbox aria-label="Mixed" indeterminate /><Checkbox aria-label="Locked" disabled /><Switch aria-label="Off" /><Switch aria-label="On" defaultChecked /><Switch aria-label="Locked switch" disabled defaultChecked /></div>
              <RadioGroup label="Choices" defaultValue="one" options={[...options, {value: "long", label: "A multiline option that keeps its mark on the first readable line"}]} />
              <div className="space-y-4"><Slider label="Budget" defaultValue={40} /><Slider label="Locked budget" defaultValue={40} disabled /></div>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <Badge icon={<Check />}>Workspace</Badge><Chip icon={<Check />}>Workspace</Chip><Chip value="one" defaultChecked>Workspace</Chip><Chip value="two">Personal</Chip><Chip value="locked" disabled>Locked</Chip>
              <Chip onRemove={() => undefined}>Workspace</Chip>
              <div className="max-w-full overflow-x-auto"><SegmentedControl aria-label="Segments" options={options} /></div>
              <div className="max-w-full overflow-x-auto"><ToggleGroup aria-label="Toggles" defaultValue={["one"]}><ToggleGroup.Item value="one">Workspace</ToggleGroup.Item><ToggleGroup.Item value="two">Personal</ToggleGroup.Item><ToggleGroup.Item value="three" disabled>Locked</ToggleGroup.Item></ToggleGroup></div>
            </div>
          </Band>
          <Band name="Rows">
            <Tabs ariaLabel="Sections" tabs={options.map(({ value, label, disabled }) => ({ id: value, label, disabled, content: label }))} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div><NavGroup title="Destinations" activeHref="#one" items={options.map(({value,label}) => ({href: `#${value}`,label}))} /><NavItem href="#icon" icon={<Heart />}>With an icon</NavItem></div>
              <Accordion defaultValue={["one"]}><Accordion.Item value="one"><Accordion.Trigger>Workspace settings with a label that can wrap</Accordion.Trigger><Accordion.Panel>Supporting copy for the open region.</Accordion.Panel></Accordion.Item><Accordion.Item value="two"><Accordion.Trigger>Personal projects</Accordion.Trigger><Accordion.Panel>Personal settings</Accordion.Panel></Accordion.Item></Accordion>
              <Collapsible defaultOpen><Collapsible.Trigger>Workspace settings with a label that can wrap</Collapsible.Trigger><Collapsible.Panel>Supporting copy for the open region.</Collapsible.Panel></Collapsible>
            </div>
          </Band>
          <Band name="Surfaces">
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3"><Card><h3 className="font-medium">Workspace</h3><p className="mt-2 text-sm">Supporting copy on a passive surface.</p></Card><Table headers={["Workspace", "Status"]} rows={[["Design", <Badge key="ready">Ready</Badge>], ["Personal", "Draft"]]} /><CodeBlock language="text">Workspace content</CodeBlock></div>
            <Alert closeable>Supporting copy that may wrap across several lines at narrow widths.</Alert>
          </Band>
          <Band name="Overlays">
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-4">
              <Tooltip content="Workspace hint"><Button>Hint</Button></Tooltip>
              <Menu><Menu.Trigger render={<Button>Commands</Button>} /><Menu.Content><Menu.Item>Workspace</Menu.Item><Menu.Item>Personal projects</Menu.Item><Menu.Item disabled>Unavailable</Menu.Item><Menu.Separator /><Menu.Item variant="danger">Delete</Menu.Item></Menu.Content></Menu>
              <Field label="Options"><Select options={options} defaultValue="one" /></Field>
              <Popover><Popover.Trigger render={<Button>Details</Button>} /><Popover.Content><p className="text-sm">Workspace details</p><Input label="Owner" defaultValue="Design team" /></Popover.Content></Popover>
              <Button onClick={() => setDialog(true)}>Dialog</Button><Button onClick={() => setAlert(true)}>Confirmation</Button><RaiseToast />
            </div>
            <div className="flex flex-wrap gap-3">{(["top", "right", "bottom", "left"] as const).map((edge) => <Button key={edge} onClick={() => { setSide(edge); setSheet(true); }}>{edge} sheet</Button>)}</div>
          </Band>
          <Dialog open={dialog} onOpenChange={setDialog}><Dialog.Header>Workspace settings with a title that can wrap</Dialog.Header><Dialog.Description>Supporting copy beneath the first readable line.</Dialog.Description><Dialog.Content><Input label="Workspace name" defaultValue="Design team" /></Dialog.Content><Dialog.Footer><Button onClick={() => setDialog(false)}>Done</Button></Dialog.Footer></Dialog>
          <AlertDialog open={alert} onOpenChange={setAlert} title="Delete this workspace?" description="Supporting copy beneath the first readable line." confirmLabel="Delete workspace" />
          <Drawer side={side} open={sheet} onOpenChange={setSheet}><Drawer.Content><Drawer.Header>Workspace settings with a title that can wrap</Drawer.Header><Drawer.Description>Supporting copy beneath the first readable line.</Drawer.Description><Drawer.Footer><Drawer.Close render={<Button>Done</Button>} /></Drawer.Footer></Drawer.Content></Drawer>
        </main>
        <ToastViewport />
      </ToastProvider>
    </DirectionProvider>
  );
}

function RaiseToast() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ type: "warning", title: "Workspace update", description: "Supporting copy that wraps beneath a first-line status mark.", timeout: 0, actionProps: {children: "Undo"} })}>Toast</Button>;
}
