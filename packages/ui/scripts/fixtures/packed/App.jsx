"use client";

import React, { useEffect, useState } from "react";
import {
  Badge, Button, Card, Checkbox, Dialog, DirectionProvider, Divider, Drawer,
  Input, Popover, Select, Skeleton, Slider, Spinner, Switch, ToastProvider, ToastViewport, useToast,
} from "sherick-ui";
import { CodeBlock, Markdown } from "sherick-ui/content";

function Notice() {
  const toast = useToast();
  return <Button onClick={() => toast.add({ title: "Packed toast", description: "Saved", timeout: 0 })}>Notify</Button>;
}

export default function App() {
  const [dialog, setDialog] = useState(false);
  const [ready, setReady] = useState(false);
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
  </main></ToastProvider></DirectionProvider>;
}
