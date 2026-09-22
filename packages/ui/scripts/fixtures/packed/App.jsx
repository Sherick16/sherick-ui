"use client";

import React, { useEffect, useState } from "react";
import {
  Badge, Button, Card, Checkbox, Combobox, Dialog, DirectionProvider, Divider, Drawer,
  Input, Popover, Select, Skeleton, Slider, Spinner, Switch, ToastProvider, ToastViewport, useToast,
  Breadcrumb, Calendar, Command, CommandPalette, DatePicker, DateRangePicker, FileUpload,
  Pagination, Stepper, TreeView,
} from "sherick-ui";
import { CodeBlock, Markdown } from "sherick-ui/content";

function Notice() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ title: "Packed toast", description: "Saved", timeout: 0 })}>Notify</Button>;
}

export default function App() {
  const [dialog, setDialog] = useState(false);
  const [ready, setReady] = useState(false);
  const [action, setAction] = useState("");
  const [step, setStep] = useState("review");
  const commands = [{ value: "save", label: "Save draft" }, { value: "archive", label: "Archive draft" }];
  useEffect(() => setReady(true), []);
  return <DirectionProvider direction="rtl"><ToastProvider><main data-ready={ready}>
    <div id="sentinel" className="flex absolute rounded-full text-sm px-6">Consumer</div>
    <pre id="host-code"><code className="language-jsx">{"<Host />"}</code></pre>
    <div id="host-spin" />
    <div id="host-pulse" />
    <Button appearance="filled" id="primary" icon={<svg data-testid="consumer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M12 4v16" /></svg>}>Packed button</Button>
    <Button id="override" className="w-24 min-w-0 rounded-none static overflow-visible p-0 opacity-100 hover:opacity-50">Override</Button>
    <Card><span id="nested" className="flex absolute rounded-full px-6">Consumer child</span></Card>
    <Badge>Package badge</Badge>
    <Divider />
    <Input label="Name" defaultValue="Packed" />
    <Checkbox aria-label="Accept" defaultChecked />
    <Switch aria-label="Enabled" defaultChecked />
    <Slider id="slider-root" aria-label="Volume" defaultValue={30} style={{ width: 180 }} />
    <Select aria-label="Project" className="p-0 rounded-none" options={[{ value: "one", label: "One" }, { value: "two", label: "Two" }]} defaultValue="one" />
    <label htmlFor="packed-combobox">Search project</label>
    <Combobox id="packed-combobox" options={[{ value: "design", label: "Design system" }, { value: "dashboard", label: "Dashboard" }]} defaultValue="design" />
    <Popover><Popover.Trigger render={<Button>Popup</Button>} /><Popover.Content>Package popup</Popover.Content></Popover>
    <Button onClick={() => setDialog(true)}>Open dialog</Button>
    <Dialog open={dialog} onOpenChange={setDialog}>
      <Dialog.Header>Packed dialog</Dialog.Header><Dialog.Description>Package overlay</Dialog.Description>
      <Dialog.Content><Button appearance="filled" id="portal-primary" onClick={() => setDialog(false)}>Done</Button></Dialog.Content>
    </Dialog>
    <Drawer><Drawer.Trigger render={<Button>Open drawer</Button>} /><Drawer.Content>
      <Drawer.Header>Packed drawer</Drawer.Header><Drawer.Description>Package sheet</Drawer.Description>
    </Drawer.Content></Drawer>
    <Notice /><ToastViewport />
    <Spinner>Working</Spinner><Skeleton className="consumer-skeleton" />
    <CodeBlock language="tsx">{'<Button appearance="filled">Hello</Button>'}</CodeBlock>
    <Markdown>{"# Packed content\n\n$x^2$\n\n```python\ndef answer():\n    return 42\n```"}</Markdown>
    <section data-testid="packed-v21" style={{ display: "grid", gap: 16, width: "min(100%, 28rem)", minWidth: 0 }}>
      <h2>v2.1 components</h2>
      <Calendar aria-label="Packed calendar" defaultValue="2024-06-10" today="2024-06-10" />
      <form id="packed-dates">
        <DatePicker label="Packed date" name="date" defaultValue="2024-06-10" today="2024-06-10" />
        <DateRangePicker label="Packed range" startLabel="Packed start" endLabel="Packed end"
          startName="start" endName="end" defaultValue={{ start: "2024-06-10", end: "2024-06-12" }} today="2024-06-10" />
        <Button type="reset">Reset packed dates</Button>
      </form>
      <Command label="Packed commands" items={commands} onAction={setAction} />
      <CommandPalette title="Packed palette" label="Packed palette search" items={commands}
        onAction={setAction} trigger={<Button>Open packed palette</Button>} />
      <output data-testid="packed-command-action">{action}</output>
      <Pagination aria-label="Packed pages" count={20} defaultValue={2} />
      <Breadcrumb aria-label="Packed breadcrumb" items={[{ label: "Home", href: "#home" }, { label: "Current" }]} />
      <FileUpload label="Packed files" multiple accept=".txt" />
      <Stepper aria-label="Packed workflow" value={step} onValueChange={setStep}
        items={[{ value: "draft", label: "Draft", complete: true }, { value: "review", label: "Review" }]} />
      <TreeView label="Packed tree" defaultExpandedValues={["root"]}
        items={[{ value: "root", label: "Root", children: [{ value: "child", label: "Child" }] }]} />
    </section>
  </main></ToastProvider></DirectionProvider>;
}
