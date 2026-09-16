import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CodeBlock,
  Dialog,
  Divider,
  IconButton,
  Input,
  Markdown,
  Search,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  Tooltip,
} from "sherick-ui";
import "sherick-ui/styles.css";
import "./app.css";

const options = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
];

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
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
        <CodeBlock language="typescript">{"const scoped: boolean = true;"}</CodeBlock>
        <Markdown>{"Inline $x^2$ and display math:\n\n$$x = 42$$"}</Markdown>
      </section>

      <section className="section">
        <Button appearance="filled" onClick={() => setDialogOpen(true)}>
          Open dialog
        </Button>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Header>No-Tailwind dialog</Dialog.Header>
        <Dialog.Description>Portaled styles must remain scoped and complete.</Dialog.Description>
        <Dialog.Content>
          <Select aria-label="Dialog project type" options={options} defaultValue="design" />
        </Dialog.Content>
        <Dialog.Footer>
          <Button appearance="filled" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
