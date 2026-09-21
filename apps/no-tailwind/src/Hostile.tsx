import { useState } from "react";
import {
  Accordion, Alert, AlertDialog, Badge, Button, Card, Checkbox, Chip, ChipGroup,
  Collapsible, Combobox, Dialog, DirectionProvider, Drawer, Field, Input, Menu, NavGroup, NavItem,
  NumberField, Popover, Progress, RadioGroup, Search, SegmentedControl, Select,
  Slider, Switch, Table, Tabs, Textarea, ToastProvider, ToastViewport, ToggleGroup,
  Tooltip, useToast,
} from "sherick-ui";
import { CodeBlock, Markdown } from "sherick-ui/content";
import "./hostile.css";

const long = "An unexpectedly long label that must remain usable in a narrow consumer column";
const token = "project_" + "abcdefghij".repeat(12);
const options = [{ value: "long", label: long }, { value: "token", label: token },
  ...Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `Project ${i}` }))];
const tabs = ["Overview", "Permissions and access", "Recent activity"].map((label) => ({ id: label, label, content: <Input label="Panel field" /> }));

function NestedControls() {
  const toast = useToast();
  const [undone, setUndone] = useState(false);
  return <div className="hostile-stack">
    <Select aria-label="Nested select" options={options} defaultValue="long" />
    <Field label="Nested combobox"><Combobox options={options} /></Field>
    <Popover><Popover.Trigger render={<Button>Nested popover</Button>} /><Popover.Content><Input label="Popover field" /></Popover.Content></Popover>
    <Menu><Menu.Trigger render={<Button>Nested menu</Button>} /><Menu.Content><Menu.Item>Nested command</Menu.Item></Menu.Content></Menu>
    <Tooltip content="Nested hint"><Button>Nested tooltip</Button></Tooltip>
    <Button onClick={() => toast.add({ title: "Modal notification", description: "Saved while editing", timeout: 0, actionProps: { children: "Undo modal change", onClick: () => setUndone(true) } })}>Notify inside overlay</Button>
    {undone && <p>Modal change undone</p>}
    <Tabs tabs={tabs} ariaLabel="Nested tabs" />
    <Accordion><Accordion.Item value="form"><Accordion.Trigger>{long}</Accordion.Trigger><Accordion.Panel><Textarea label="Disclosed notes" /></Accordion.Panel></Accordion.Item></Accordion>
    {Array.from({ length: 8 }, (_, i) => <Input key={i} label={`Form field ${i}`} />)}
  </div>;
}

function Surfaces() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [alert, setAlert] = useState(false);
  const toast = useToast();
  const side = new URLSearchParams(location.search).get("side") as "left" | "right" | "top" | "bottom" | null;
  return <>
    <div className="hostile-stack" data-testid="surface-triggers">
      <Button onClick={() => setDialog(true)}>Open stress dialog</Button>
      <Button onClick={() => setDrawer(true)}>Open stress drawer</Button>
      <Button onClick={() => setAlert(true)}>Open stress confirmation</Button>
      <Button onClick={() => toast.add({ title: long, description: `${token} ${long.repeat(8)}`, timeout: 0, actionProps: { children: "Resolve notification", onClick: () => undefined } })}>Raise stress toast</Button>
    </div>
    <Dialog open={dialog} onOpenChange={setDialog}>
      <Dialog.Header>{long}</Dialog.Header><Dialog.Description>{token}</Dialog.Description>
      <Dialog.Content><NestedControls /></Dialog.Content>
      <Dialog.Footer><Button onClick={() => setDialog(false)}>Finish dialog</Button></Dialog.Footer>
    </Dialog>
    <Drawer open={drawer} onOpenChange={setDrawer} side={side ?? "right"}>
      <Drawer.Content><Drawer.Header>{long}</Drawer.Header><Drawer.Description>{token}</Drawer.Description>
        <div style={{ padding: 24 }}><NestedControls /></div>
        <Drawer.Footer><Button onClick={() => setDrawer(false)}>Finish drawer</Button></Drawer.Footer>
      </Drawer.Content>
    </Drawer>
    <AlertDialog open={alert} onOpenChange={setAlert} title={long} description={long.repeat(8)} confirmLabel="Confirm this unusually long operation" cancelLabel="Return without making changes" />
    <div className="hostile-anchor" data-testid="edge-anchor">
      <Select aria-label="Edge select" options={options} />
      <Field label="Edge combobox"><Combobox options={options} /></Field>
      <Menu><Menu.Trigger render={<Button>Edge menu</Button>} /><Menu.Content>{options.map(o => <Menu.Item key={o.value}>{o.label}</Menu.Item>)}</Menu.Content></Menu>
      <Popover><Popover.Trigger render={<Button>Edge popover</Button>} /><Popover.Content><Input label="Floating field" /><p>{token}</p><p>{long.repeat(8)}</p><Button>Last popover action</Button></Popover.Content></Popover>
      <Tooltip content={<span data-testid="stress-tooltip">{token}</span>}><Button>Edge tooltip</Button></Tooltip>
    </div>
    <ToastViewport />
  </>;
}

export default function Hostile() {
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const direction = new URLSearchParams(location.search).get("dir") === "rtl" ? "rtl" : "ltr";
  return <DirectionProvider direction={direction}><ToastProvider><main className="hostile-page">
    <h1>Hostile consumer</h1>
    <div className="hostile-grid" data-testid="hostile-grid">
      <Input label={token} description={long} error={invalid} errorMessage={long.repeat(2)} defaultValue={token} />
      <Textarea label={long} defaultValue={token} />
      <Search aria-label="Stress search" defaultValue={token} onSearch={() => undefined} />
      <Select aria-label="Stress select" options={options} defaultValue="long" />
      <Field label="Stress combobox"><Combobox options={options} defaultValue="long" /></Field>
      <NumberField aria-label="Stress number" defaultValue={123456789} />
      <Field label={token} description={token}><Input aria-label="Field input" /></Field>
      <Button>{token}</Button>
      <Badge>{token}</Badge>
      <Chip onRemove={() => undefined}>{token}</Chip>
      <ChipGroup aria-label="Stress chips"><Chip value="a">{token}</Chip><Chip value="b">Second</Chip></ChipGroup>
      <SegmentedControl aria-label="Stress segments" options={options.slice(0, 3)} />
      <ToggleGroup aria-label="Stress toggles"><ToggleGroup.Item value="a">{long}</ToggleGroup.Item><ToggleGroup.Item value="b">Another long choice</ToggleGroup.Item></ToggleGroup>
      <Tabs tabs={tabs} ariaLabel="Stress tabs" />
      <Table headers={["Identifier", "Description"]} rows={[[token, long], [<Checkbox aria-label="Table selection" />, "Selectable row"]]} />
      <Card><Input label="Card field" /><p>{token}</p></Card>
      <NavGroup title={long} items={[{ href: "#destination", label: token }]} />
      <NavItem href="#destination">{token}</NavItem>
      <Accordion><Accordion.Item value="one"><Accordion.Trigger>{token}</Accordion.Trigger><Accordion.Panel>{token}</Accordion.Panel></Accordion.Item></Accordion>
      <Collapsible defaultOpen><Collapsible.Trigger>{long}</Collapsible.Trigger><Collapsible.Panel>{token}</Collapsible.Panel></Collapsible>
      <Alert closeable>{token} {long}</Alert>
      <Progress label={long} value={45} showValue />
      <RadioGroup aria-label="Stress radios" options={options.slice(0, 2)} />
      <Slider label={long} defaultValue={35} />
      <Switch aria-label="Stress switch" />
      <CodeBlock language="text">{token.repeat(3)}</CodeBlock>
      <Markdown>{`[${token}](https://example.com)\n\n| Key | Value |\n| --- | --- |\n| ${token} | Wide |`}</Markdown>
    </div>
    <section data-testid="flex-fields">
      <div className="hostile-flex"><Input label="Flex input" /><Button>Go</Button></div>
      <div className="hostile-flex"><Search aria-label="Flex search" onSearch={() => undefined} /><Button>Go</Button></div>
      <div className="hostile-flex"><Select aria-label="Flex select" options={options} /><Button>Go</Button></div>
      <div className="hostile-flex"><Field label="Flex combobox"><Combobox options={options} /></Field><Button>Go</Button></div>
      <div className="hostile-flex"><NumberField aria-label="Flex number" /><Button>Go</Button></div>
    </section>
    <div className="hostile-stack" data-testid="state-controls">
      <Button onClick={() => setLoading(!loading)}>Toggle loading</Button>
      <Button loading={loading} data-testid="loading-button">Save changes</Button>
      <Button onClick={() => setInvalid(!invalid)}>Toggle validation</Button>
      <div className="hostile-row"><Checkbox aria-label="First checkbox" /><Checkbox aria-label="Second checkbox" /><Switch aria-label="Row switch" /></div>
    </div>
    <Surfaces />
  </main></ToastProvider></DirectionProvider>;
}
