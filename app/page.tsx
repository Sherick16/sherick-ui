"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Download,
  Heart,
  Layers3,
  Plus,
  Search as SearchIcon,
  Settings2,
  Trash2,
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
import Divider from "@/components/UI/Divider";
import CodeBlock from "@/components/UI/CodeBlock";
import Markdown from "@/components/UI/Markdown";
import NavGroup from "@/components/UI/NavGroup";
import { Spinner } from "@/components/UI/Spinner";
import { Alert } from "@/components/UI/Alert";
import { Card } from "@/components/UI/Card";
import { Skeleton } from "@/components/UI/Skeleton";
import { Switch } from "@/components/UI/Switch";
import { TabGroup } from "@/components/UI/TabGroup";
import { Table } from "@/components/UI/Table";

const selectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Marketing site", value: "marketing" },
];

const nav = [
  ["Foundations", "#foundations"],
  ["Buttons", "#buttons"],
  ["Fields", "#fields"],
  ["Selection", "#selection"],
  ["Feedback", "#feedback"],
  ["Surfaces", "#surfaces"],
  ["Data", "#data"],
  ["Content", "#content"],
] as const;

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [selection, setSelection] = useState("design");

  return (
    <main className="min-h-screen bg-sherick-canvas text-sherick-ink">
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-sherick-canvas/[0.86] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-sherick-primary-strong text-sherick-on-primary">
              <Layers3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-semibold tracking-[-0.015em]">Sherick UI</div>
              <div className="text-xs text-sherick-ink-muted">Component showcase · development</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="primary">Material 3 Expressive inspired</Badge>
            <Tooltip content="Component settings">
              <IconButton appearance="acrylic" variant="secondary" icon={<Settings2 />} aria-label="Component settings" />
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1480px] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sherick-ink-muted">Library</div>
              <nav className="mt-3 space-y-1">
                {nav.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="block rounded-xl px-3 py-2 text-sm text-sherick-ink-muted transition-colors hover:bg-white/[0.045] hover:text-sherick-ink"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
            <Divider />
            <div className="space-y-2 text-xs leading-5 text-sherick-ink-muted">
              <div className="font-medium text-sherick-ink">Design rule</div>
              <p>Matte at rest. Richer depth only when UI floats, activates or matters.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-16">
          <section id="foundations" className="scroll-mt-28">
            <SectionHeading
              title="Foundations"
              description="Core palette, shape and material language used by the components below."
            />
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <Specimen title="Color roles" description="Primary, semantic and neutral roles—not raw component colors.">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Swatch label="Primary" className="bg-sherick-primary-strong" />
                  <Swatch label="Accent" className="bg-sherick-accent" />
                  <Swatch label="Success" className="bg-sherick-success" />
                  <Swatch label="Danger" className="bg-sherick-danger" />
                  <Swatch label="Surface" className="bg-sherick-surface" />
                  <Swatch label="Surface high" className="bg-sherick-surface-high" />
                </div>
              </Specimen>

              <Specimen title="Surface hierarchy" description="Ordinary UI stays matte; overlays can become frosted.">
                <div className="space-y-3">
                  <div className="rounded-[1.25rem] bg-sherick-surface p-4 text-sm">Matte surface</div>
                  <div className="rounded-[1.5rem] bg-sherick-surface-high p-4 text-sm">Elevated tonal surface</div>
                  <div className="rounded-[1.5rem] bg-sherick-surface-float/[0.78] p-4 text-sm shadow-sherick-float ring-1 ring-inset ring-white/[0.05] backdrop-blur-2xl">
                    Floating acrylic
                  </div>
                </div>
              </Specimen>

              <Specimen title="Shape roles" description="Softness increases with elevation and emphasis.">
                <div className="grid grid-cols-2 gap-3 text-center text-xs text-sherick-ink-muted">
                  <div className="rounded-[1.25rem] bg-sherick-surface-high p-5">Control</div>
                  <div className="rounded-full bg-sherick-primary/[0.16] p-5 text-sherick-primary">Pill</div>
                  <div className="rounded-[1.75rem] bg-sherick-surface p-5">Surface</div>
                  <div className="rounded-[2.5rem] bg-sherick-surface-high p-5">Hero</div>
                </div>
              </Specimen>
            </div>
          </section>

          <section id="buttons" className="scroll-mt-28">
            <SectionHeading title="Buttons" description="Emphasis, size and semantic states without decorative glow." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances" description="Filled for priority, tonal for normal actions, text for quiet actions.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled">Filled</ActionButton>
                  <ActionButton appearance="tonal" variant="secondary">Tonal</ActionButton>
                  <ActionButton appearance="text" variant="secondary">Text</ActionButton>
                  <ActionButton appearance="tonal" variant="danger" icon={<Trash2 />}>Delete</ActionButton>
                </div>
              </Specimen>

              <Specimen title="States" description="Loading and disabled suppress press/hover behavior.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton loading>Saving</ActionButton>
                  <ActionButton disabled>Disabled</ActionButton>
                  <ActionButton appearance="filled" size="sm">Small</ActionButton>
                  <ActionButton appearance="filled" size="lg">Large</ActionButton>
                </div>
              </Specimen>

              <Specimen title="Icon buttons" description="Tonal, ghost and acrylic treatments share the same hit target.">
                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip content="Notifications"><IconButton icon={<Bell />} aria-label="Notifications" /></Tooltip>
                  <Tooltip content="Search"><IconButton appearance="ghost" variant="secondary" icon={<SearchIcon />} aria-label="Search" /></Tooltip>
                  <Tooltip content="Download"><IconButton appearance="acrylic" variant="secondary" icon={<Download />} aria-label="Download" /></Tooltip>
                  <IconButton disabled icon={<Heart />} aria-label="Disabled favorite" />
                </div>
              </Specimen>
            </div>
          </section>

          <section id="fields" className="scroll-mt-28">
            <SectionHeading title="Fields" description="One borderless field language across text input, textarea, search and select." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Text input" description="Default, invalid and disabled states.">
                <div className="space-y-4">
                  <Input label="Project name" placeholder="Sherick UI" />
                  <Input label="Invalid" placeholder="Required value" error />
                  <Input label="Disabled" placeholder="Unavailable" disabled />
                </div>
              </Specimen>

              <Specimen title="Textarea" description="Same surface and focus language at a larger content size.">
                <div className="space-y-4">
                  <Textarea label="Notes" placeholder="Describe what you want to build…" />
                  <Textarea label="Invalid notes" placeholder="Add more detail" error />
                </div>
              </Specimen>

              <Specimen title="Search" description="Composite field uses one outer focus surface.">
                <div className="space-y-4">
                  <Search onSearch={() => undefined} placeholder="Search components" className="w-full" />
                  <Search onSearch={() => undefined} placeholder="Loading search" loading className="w-full" />
                </div>
              </Specimen>

              <Specimen title="Dropdown" description="Matte trigger, frosted floating listbox, clear selection.">
                <div className="space-y-4">
                  <Dropdown
                    options={selectOptions}
                    selected={selection}
                    onSelect={setSelection}
                    aria-label="Project type"
                    className="w-full"
                  />
                  <Dropdown options={selectOptions} disabled aria-label="Disabled project type" className="w-full" />
                </div>
              </Specimen>
            </div>
          </section>

          <section id="selection" className="scroll-mt-28">
            <SectionHeading title="Selection & navigation" description="Persistent state can carry stronger shape and tone than surrounding UI." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Switch" description="44–48px hit target, compact 52×32 visual track.">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onChange={setSwitchOn} /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onChange={() => undefined} /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Tabs" description="Matte track with a softly elevated sliding selection.">
                <TabGroup
                  tabs={[
                    { id: "one", label: "Overview", content: <p className="text-sm text-sherick-ink-muted">Overview content</p> },
                    { id: "two", label: "Motion", content: <p className="text-sm text-sherick-ink-muted">Motion content</p> },
                    { id: "three", label: "Density", content: <p className="text-sm text-sherick-ink-muted">Density content</p> },
                  ]}
                />
              </Specimen>

              <Specimen title="Navigation groups" description="Compact navigation stays quiet until hovered or focused.">
                <div className="max-w-sm rounded-[1.5rem] bg-sherick-surface/[0.68] p-3">
                  <NavGroup
                    title="Components"
                    items={[
                      { label: "Buttons", href: "#buttons" },
                      { label: "Fields", href: "#fields" },
                      { label: "Feedback", href: "#feedback" },
                    ]}
                  />
                </div>
              </Specimen>
            </div>
          </section>

          <section id="feedback" className="scroll-mt-28">
            <SectionHeading title="Feedback" description="Semantic color communicates actual state and remains restrained by default." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Alerts" description="Passive surfaces do not react to hover.">
                <div className="space-y-3">
                  <Alert variant="primary">A useful piece of information.</Alert>
                  <Alert variant="success">Changes were saved successfully.</Alert>
                  <Alert variant="warning">Review these settings before continuing.</Alert>
                  <Alert variant="danger" closeable>Something needs your attention.</Alert>
                </div>
              </Specimen>

              <Specimen title="Loading & skeleton" description="Loading inherits foreground; skeletons remain neutral.">
                <div className="space-y-7">
                  <div className="flex items-center gap-4 text-sherick-ink-muted">
                    <Spinner size="small" />
                    <Spinner size="medium" />
                    <Spinner size="large" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </Specimen>
            </div>
          </section>

          <section id="surfaces" className="scroll-mt-28">
            <SectionHeading title="Surfaces & overlays" description="Cards stay matte; menus, tooltips and modals may use richer acrylic depth." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards & badges" description="Passive content surfaces and compact semantic labels.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary">
                    <div className="font-medium">Neutral card</div>
                    <p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Normal information stays matte and grounded.</p>
                  </Card>
                  <Card variant="primary">
                    <div className="font-medium">Tonal card</div>
                    <p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Use stronger tone only when it adds meaning.</p>
                  </Card>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>Ready</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </Specimen>

              <Specimen title="Avatar & tooltip" description="Compact identity and the denser floating material.">
                <div className="flex items-center gap-5">
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example avatar" size="sm" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example rounded avatar" size="md" shape="rounded" />
                  <Tooltip content="This tooltip uses the same floating acrylic language as other overlays.">
                    <ActionButton appearance="tonal" variant="secondary">Hover or focus</ActionButton>
                  </Tooltip>
                </div>
              </Specimen>

              <Specimen title="Modal" description="Strongest elevation layer: acrylic material, backdrop blur and focus trap.">
                <ActionButton appearance="filled" onClick={() => setModalOpen(true)} icon={<Plus />}>Open modal</ActionButton>
              </Specimen>
            </div>
          </section>

          <section id="data" className="scroll-mt-28">
            <SectionHeading title="Data display" description="Dense information remains quiet, compact and easy to scan." />
            <div className="mt-6">
              <Specimen title="Table" description="Neutral row treatment; semantic color belongs inside cells, not across the whole table.">
                <Table
                  headers={["Component", "Role", "Status"]}
                  rows={[
                    ["Dropdown", "Custom selection", <Badge key="dropdown" variant="success">Ready</Badge>],
                    ["Modal", "Focused overlay", <Badge key="modal" variant="success">Ready</Badge>],
                    ["Table", "Dense information", <Badge key="table" variant="secondary">Quiet</Badge>],
                    ["Input", "Form control", <Badge key="input" variant="primary">Core</Badge>],
                  ]}
                />
              </Specimen>
            </div>
          </section>

          <section id="content" className="scroll-mt-28 pb-16">
            <SectionHeading title="Content" description="Code and Markdown primitives for documentation and rich text surfaces." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Code block" description="Copyable syntax-highlighted code.">
                <CodeBlock language="tsx">{`<ActionButton appearance="filled">Save</ActionButton>`}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown" description="GFM and code rendering through the library's Markdown primitive.">
                <div className="prose prose-invert max-w-none text-sm">
                  <Markdown>{`### Example\n\nSherick UI keeps **dense information quiet** and lets floating UI carry more depth.`}</Markdown>
                </div>
              </Specimen>
            </div>
          </section>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Modal specimen</Modal.Header>
        <Modal.Content>
          <p>This is the highest elevation layer in the system: focused, frosted and deliberately separated from the page beneath it.</p>
        </Modal.Content>
        <Modal.Footer>
          <ActionButton appearance="text" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</ActionButton>
          <ActionButton appearance="filled" onClick={() => setModalOpen(false)}>Confirm</ActionButton>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-white/[0.055] pb-5">
      <h2 className="text-2xl font-semibold tracking-[-0.025em] text-sherick-ink sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-sherick-ink-muted sm:text-base">{description}</p>
    </div>
  );
}

function Specimen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-sherick-surface/[0.72] p-5 ring-1 ring-inset ring-white/[0.035] sm:p-6">
      <div className="mb-5">
        <h3 className="text-sm font-medium text-sherick-ink">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-sherick-ink-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div>
      <div className={`h-14 rounded-[1rem] ${className}`} />
      <div className="mt-2 text-xs text-sherick-ink-muted">{label}</div>
    </div>
  );
}

function StateLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <span className="text-xs text-sherick-ink-muted">{label}</span>
    </div>
  );
}
