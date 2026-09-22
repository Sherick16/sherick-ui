import { useState } from "react";
import {
  Breadcrumb, Button, Calendar, Command, CommandPalette, DatePicker, DateRangePicker,
  DirectionProvider, FileUpload, Pagination, Progress, SegmentedControl, Stepper, Tabs, TreeView,
} from "sherick-ui";

const commands = [
  { value: "save", label: "Save draft" },
  { value: "archive", label: "Archive draft" },
  { value: "publish", label: "Publish draft", disabled: true },
];
export default function V21() {
  const [step, setStep] = useState("review");
  const [action, setAction] = useState("");
  return <DirectionProvider direction="rtl"><main dir="rtl" className="page" data-testid="no-tailwind-v21">
    <h1>v2.1 package consumer</h1>
    <div style={{ display: "grid", gap: 16, maxWidth: 420, minWidth: 0 }}>
      <Calendar aria-label="Calendar" defaultValue="2024-06-10" today="2024-06-10" />
      <form id="dates">
        <DatePicker label="Date" name="date" defaultValue="2024-06-10" today="2024-06-10" />
        <DateRangePicker label="Date range" startLabel="Start" endLabel="End" startName="start" endName="end"
          defaultValue={{ start: "2024-06-10", end: "2024-06-12" }} today="2024-06-10" />
        <Button type="reset">Reset dates</Button>
      </form>
      <Command label="Commands" items={commands} onAction={setAction} />
      <CommandPalette title="Palette" label="Palette search" items={commands} onAction={setAction}
        trigger={<Button>Open palette</Button>} />
      <output data-testid="command-action">{action}</output>
      <Pagination aria-label="Pages" count={20} defaultValue={2} />
      <Breadcrumb items={[{ label: "Home", href: "#home" }, { label: "Current" }]} />
      <FileUpload label="Files" accept=".txt" multiple />
      <Stepper aria-label="Workflow" value={step} onValueChange={setStep}
        items={[{ value: "draft", label: "Draft", complete: true }, { value: "review", label: "Review" }]} />
      <TreeView label="Tree" defaultExpandedValues={["root"]}
        items={[{ value: "root", label: "Root", children: [{ value: "child", label: "Child" }] }]} />
      <SegmentedControl aria-label="Reference segments" defaultValue="two"
        options={[{ value: "one", label: "One" }, { value: "two", label: "Two" }]} />
      <Tabs ariaLabel="Reference tabs" defaultValue="two" tabs={[
        { id: "one", label: "One", content: "First panel" },
        { id: "two", label: "Two", content: "Second panel" },
      ]} />
      <Progress label="Reference progress" value={60} />
    </div>
  </main></DirectionProvider>;
}
