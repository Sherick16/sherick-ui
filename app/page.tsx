"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  Layers3,
  Settings2,
  Sparkles,
} from "lucide-react";
import ActionButton from "@/components/UI/ActionButton";
import Dropdown from "@/components/UI/Dropdown";
import Search from "@/components/UI/Search";
import Input from "@/components/UI/Input";
import Avatar from "@/components/UI/Avatar";
import Textarea from "@/components/UI/Textarea";
import Tooltip from "@/components/UI/Tooltip";
import Modal from "@/components/UI/Modal";
import Badge from "@/components/UI/Badge";
import IconButton from "@/components/UI/IconButton";
import { Spinner } from "@/components/UI/Spinner";
import { Alert } from "@/components/UI/Alert";
import { Card } from "@/components/UI/Card";
import { Skeleton } from "@/components/UI/Skeleton";
import { Switch } from "@/components/UI/Switch";
import { TabGroup } from "@/components/UI/TabGroup";
import { Table } from "@/components/UI/Table";

const options = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Marketing site", value: "marketing" },
];

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [selection, setSelection] = useState("design");

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sherick-primary-strong text-sherick-on-primary shadow-sherick-primary">
            <Layers3 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-semibold text-sherick-ink">Sherick UI</div>
            <div className="text-sm text-sherick-ink-muted">Expressive, not excessive.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Notifications" position="bottom">
            <IconButton appearance="acrylic" variant="secondary" icon={<Bell className="h-5 w-5" />} aria-label="Notifications" />
          </Tooltip>
          <Tooltip content="Settings" position="bottom">
            <IconButton appearance="acrylic" variant="secondary" icon={<Settings2 className="h-5 w-5" />} aria-label="Settings" />
          </Tooltip>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="flex min-h-[26rem] flex-col justify-between rounded-[2.75rem] bg-sherick-surface/82 p-7 sm:p-10 lg:p-12">
          <div className="max-w-3xl">
            <Badge variant="primary" icon={<Sparkles className="h-3.5 w-3.5" />}>
              Material 3 Expressive inspired
            </Badge>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.045em] text-sherick-ink sm:text-6xl lg:text-7xl">
              Quiet by default. Expressive where it matters.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-sherick-ink-muted">
              Sherick UI uses shape, tone, scale and motion to create hierarchy without turning every control into a visual event.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <ActionButton appearance="filled" size="lg" icon={<ArrowRight className="h-5 w-5" />} onClick={() => setModalOpen(true)}>
              Open example
            </ActionButton>
            <ActionButton appearance="tonal" size="lg" variant="secondary">
              Browse components
            </ActionButton>
          </div>
        </div>

        <div className="relative min-h-[26rem] overflow-hidden rounded-[2.75rem] bg-sherick-primary-soft/70 p-8 shadow-sherick-soft ring-1 ring-inset ring-white/[0.035]">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sherick-primary/18 blur-[90px]" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sherick-accent/12 blur-[100px]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex justify-end">
              <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>Stable baseline</Badge>
            </div>
            <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-sherick-primary-strong shadow-sherick-primary sm:h-52 sm:w-52">
              <div className="h-20 w-20 rotate-12 rounded-[2rem] bg-sherick-accent/90" />
            </div>
            <p className="max-w-sm text-sm leading-6 text-sherick-ink/65">
              Strong geometry is reserved for focal moments; dense information stays deliberately calm.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Actions"
          description="Hierarchy comes from emphasis and scale, not five equally loud colors."
        />
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[2.25rem] bg-sherick-surface/58 p-6 sm:p-8">
          <ActionButton appearance="filled">Primary action</ActionButton>
          <ActionButton appearance="tonal" variant="secondary">Secondary</ActionButton>
          <ActionButton appearance="text" variant="secondary">Quiet action</ActionButton>
          <ActionButton appearance="tonal" variant="danger">Delete</ActionButton>
          <ActionButton loading>Saving</ActionButton>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Fields"
          description="Input, search, textarea and select share one predictable control language."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card variant="secondary" className="space-y-5">
            <Input label="Project name" placeholder="Sherick UI" />
            <Dropdown
              options={options}
              selected={selection}
              onSelect={setSelection}
              aria-label="Project type"
            />
            <Search onSearch={() => undefined} placeholder="Search components" />
          </Card>
          <Card variant="secondary" className="space-y-5">
            <Textarea label="Notes" placeholder="Describe what you want to build…" />
            <Input label="Invalid example" placeholder="Required value" error aria-invalid="true" />
          </Card>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Navigation & state"
          description="Selected states can be expressive while the surrounding structure remains restrained."
        />
        <div className="mt-6 rounded-[2.25rem] bg-sherick-surface/58 p-5 sm:p-8">
          <TabGroup
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: <p className="max-w-3xl text-sherick-ink-muted">The selected state gets the strongest shape and tone. Content remains quiet and readable.</p>,
              },
              {
                id: "motion",
                label: "Motion",
                content: <p className="max-w-3xl text-sherick-ink-muted">Short state transitions and restrained enter motion add physicality without distracting from the task.</p>,
              },
              {
                id: "density",
                label: "Density",
                content: <p className="max-w-3xl text-sherick-ink-muted">Desktop information density stays practical instead of blindly inheriting mobile-sized expressive components.</p>,
              },
            ]}
          />
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Feedback"
          description="Semantic color is strongest when it communicates actual state."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Alert variant="success">Changes were saved successfully.</Alert>
            <Alert variant="danger" closeable>Something needs your attention before publishing.</Alert>
          </div>
          <Card variant="secondary" className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sherick-ink">Notifications</div>
                <div className="mt-1 text-sm text-sherick-ink-muted">Receive meaningful product updates.</div>
              </div>
              <Switch checked={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center gap-4 text-sherick-ink/80">
              <Spinner size="small" />
              <span className="text-sm">Loading inherits the surrounding foreground.</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-16 pb-16">
        <SectionHeading
          title="Dense information"
          description="Expressive systems still need quiet places for scanning and comparison."
        />
        <div className="mt-6 overflow-hidden rounded-[2.25rem] bg-sherick-surface/58 p-4 sm:p-6">
          <Table
            headers={["Component", "Role", "Status"]}
            rows={[
              ["Dropdown", "Custom selection", <Badge key="dropdown" variant="success">Ready</Badge>],
              ["Modal", "Focused overlay", <Badge key="modal" variant="success">Ready</Badge>],
              ["Table", "Dense information", <Badge key="table" variant="secondary">Quiet</Badge>],
            ]}
          />
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Expressive, with restraint</Modal.Header>
        <Modal.Content>
          <div className="flex items-start gap-4">
            <Avatar
              src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg"
              alt="Example profile"
              size="sm"
            />
            <p className="pr-6 leading-7 text-sherick-ink/78">
              Large surfaces can carry personality while controls inside them remain predictable, accessible and easy to scan.
            </p>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <ActionButton appearance="text" variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton appearance="filled" onClick={() => setModalOpen(false)}>
            Confirm
          </ActionButton>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-3xl">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-sherick-ink sm:text-4xl">{title}</h2>
      <p className="mt-2 text-base leading-7 text-sherick-ink-muted">{description}</p>
    </div>
  );
}
