import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ChipGroup,
  Combobox,
  Dialog,
  Divider,
  Field,
  IconButton,
  Input,
  Menu,
  Popover,
  Progress,
  Search,
  SegmentedControl,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  ToggleGroup,
  Tooltip,
} from "sherick-ui";
import { CodeBlock, Markdown } from "sherick-ui/content";
import "./app.css";
import "sherick-ui/styles.css";

const options = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
];

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);

  return (
    <main className="page" data-testid="no-tailwind-ready">
      <header className="page-header">
        <Badge>Scoped package CSS</Badge>
        <h1>No-Tailwind consumer</h1>
        <p>Only sherick-ui/styles.css supplies component styling on this page.</p>
      </header>

      <div
        data-testid="css-leak-sentinel"
        className="flex absolute rounded-full px-6 text-sm"
      >
        Consumer class sentinel
      </div>

      <section className="section">
        <h2>Actions and feedback</h2>
        <div className="row">
          <Button appearance="filled">Primary</Button>
          <Button variant="danger">Danger</Button>
          <Button appearance="text" aria-label="Nested button leak host">
            <span
              data-testid="button-child-leak-sentinel"
              className="absolute flex rounded-full px-6"
            >
              Consumer child
            </span>
          </Button>
          <IconButton aria-label="Add" icon={<span>+</span>} />
          <Spinner size="small">Loading</Spinner>
          <Avatar
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2388aaff'/%3E%3C/svg%3E"
            alt="Verification avatar"
            size="sm"
          />
        </div>
        <Alert variant="warning">Semantic alert</Alert>
        <Skeleton className="skeleton" />
      </section>

      <section className="section">
        <h2>Selection and progress</h2>
        <div className="row">
          <ChipGroup aria-label="Filters" defaultValue={["design"]}>
            <Chip value="design">Design</Chip>
            <Chip value="code">Code</Chip>
          </ChipGroup>
          <Chip variant="success">Ready</Chip>
          <Chip onRemove={() => undefined}>Platform</Chip>
        </div>
        <div className="row">
          <ToggleGroup aria-label="View" defaultValue={["list"]}>
            <ToggleGroup.Item value="list">List</ToggleGroup.Item>
            <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
          </ToggleGroup>
          <SegmentedControl
            aria-label="Density"
            defaultValue="comfortable"
            options={[
              { value: "compact", label: "Compact" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
        </div>
        <Progress value={40} label="Uploading" showValue locale="en-US" />
        <Progress value={null} label="Indexing" />
      </section>

      <section className="section grid">
        <Input
          label="Project name"
          defaultValue="Sherick UI"
          description="Description relationship"
        />
        <Textarea label="Notes" defaultValue="Scoped textarea" />
        <Search aria-label="Search" onSearch={() => undefined} defaultValue="tokens" />
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enabled" />
        <Select aria-label="Project type" options={options} defaultValue="design" />
      </section>

      <section className="section">
        <Tabs
          defaultValue="overview"
          tabs={[
            { id: "overview", label: "Overview", content: "Overview panel" },
            { id: "details", label: "Details", content: "Details panel" },
          ]}
        />
      </section>

      <section className="section">
        <Card>
          <h2>Surface</h2>
          <p>Card styling comes from the package stylesheet.</p>
          <span
            data-testid="card-child-leak-sentinel"
            className="absolute flex rounded-full px-6"
          >
            Consumer card child
          </span>
          <Divider />
          <Tooltip content="Portaled tooltip">
            <Button appearance="text">Tooltip trigger</Button>
          </Tooltip>
        </Card>
      </section>

      <section className="section">
        <Table
          headers={["Component", "State"]}
          rows={[
            ["Button", "Ready"],
            ["Dialog", "Ready"],
          ]}
        />
      </section>

      <section className="section">
        <Popover>
          <Popover.Trigger render={<Button appearance="tonal">Portaled popover</Button>} />
          <Popover.Content>
            <p>Popover content</p>
          </Popover.Content>
        </Popover>
        <Menu>
          <Menu.Trigger render={<Button appearance="tonal">Portaled menu</Button>} />
          <Menu.Content>
            <Menu.Item>Rename</Menu.Item>
            <Menu.Separator />
            <Menu.Item variant="danger">Delete</Menu.Item>
          </Menu.Content>
        </Menu>
        <Field label="Portaled combobox">
          <Combobox options={options} defaultValue="design" />
        </Field>
      </section>

      <section className="section">
        <CodeBlock language="typescript">{"const scoped: boolean = true;"}</CodeBlock>
        <Markdown>{"Inline $x^2$ and display math:\n\n$$x = 42$$"}</Markdown>
      </section>

      <section className="section">
        <Button appearance="filled" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Button appearance="filled" variant="danger" onClick={() => setAlertOpen(true)}>
          Open portaled alert
        </Button>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Header>No-Tailwind dialog</Dialog.Header>
        <Dialog.Description>Portaled styles must remain scoped and complete.</Dialog.Description>
        <Dialog.Content>
          <Select aria-label="Dialog project type" options={options} defaultValue="design" />
          <Field label="Dialog combobox">
            <Combobox options={options} defaultValue="design" />
          </Field>
        </Dialog.Content>
        <Dialog.Footer>
          <Button appearance="filled" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Portaled alert dialog"
        description="The alert dialog surface must be styled by package CSS alone."
        confirmLabel="Delete"
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
