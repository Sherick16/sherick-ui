"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Download,
  Heart,
  Layers3,
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
      <header className="sticky top-0 z-40 border-b border-white/[0.045] bg-sherick-canvas/[0.88] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-sherick-primary-strong text-sherick-on-primary">
              <Layers3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-semibold tracking-[-0.015em]">Sherick UI</div>
              <div className="text-xs text-sherick-ink-muted">Design system workbench</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Badge variant="primary">Development</Badge>
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
                  <a key={href} href={href} className="block rounded-xl px-3 py-2 text-sm text-sherick-ink-muted transition-colors hover:bg-white/[0.045] hover:text-sherick-ink">
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
            <SectionHeading title="Foundations" description="Core palette, shape and material language used by every component." />
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

              <Specimen title="Surface hierarchy" description="Grounded UI stays matte; floating UI can become frosted.">
                <div className="space-y-3">
                  <div className="rounded-[1.25rem] bg-sherick-surface p-4 text-sm">Matte surface</div>
                  <div className="rounded-[1.5rem] bg-sherick-surface-high p-4 text-sm shadow-sherick-soft">Elevated tonal surface</div>
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-sherick-canvas p-4">
                    <div className="absolute -left-4 top-2 h-16 w-24 rounded-full bg-sherick-primary/[0.28] blur-2xl" />
                    <div className="absolute right-3 top-5 text-[10px] text-sherick-ink-muted">content behind</div>
                    <div className="relative rounded-[1.25rem] bg-sherick-surface-float/[0.72] p-4 text-sm shadow-sherick-float ring-1 ring-inset ring-white/[0.055] backdrop-blur-2xl backdrop-saturate-150">
                      Floating acrylic
                    </div>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Shape roles" description="Softness increases with elevation and emphasis.">
                <div className="grid grid-cols-2 gap-3 text-center text-xs text-sherick-ink-muted">
                  <div className="rounded-[1.25rem] bg-sherick-surface-high p-5">Control</div>
                  <div className="rounded-full bg-sherick-primary/[0.16] p-5 text-sherick-primary">Pill</div>
                  <div className="rounded-[1.75rem] bg-sherick-surface p-5">Surface</div>
                  <div className="rounded-[3rem] bg-sherick-surface-high p-5">Hero</div>
                </div>
              </Specimen>
            </div>
          </section>

          <section id="buttons" className="scroll-mt-28">
            <SectionHeading title="Buttons" description="Appearance, size and state are separate parts of the API." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances" description="Filled for priority, tonal for normal actions, text for quiet actions.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled">Filled</ActionButton>
                  <ActionButton appearance="tonal" variant="secondary">Tonal</ActionButton>
                  <ActionButton appearance="text" variant="secondary">Text</ActionButton>
                  <ActionButton appearance="tonal" variant="danger" icon={<Trash2 />}>Delete</ActionButton>
                </div>
              </Specimen>

              <Specimen title="States" description="Loading and disabled suppress press and hover behavior.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton loading>Saving</ActionButton>
                  <ActionButton disabled>Disabled</ActionButton>
                  <ActionButton className="ring-2 ring-sherick-primary ring-offset-2 ring-offset-sherick-canvas">Focus-visible</ActionButton>
                </div>
              </Specimen>

              <Specimen title="Sizes" description="Scale changes hierarchy without changing the interaction language.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled" size="sm">Small</ActionButton>
                  <ActionButton appearance="filled" size="md">Medium</ActionButton>
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
              <Specimen title="Text input" description="Default, error, focus-visible and disabled states.">
                <div className="space-y-4">
                  <Input label="Project name" placeholder="Sherick UI" />
                  <Input label="Invalid" placeholder="Required value" error />
                  <Input label="Focus-visible" placeholder="Keyboard focus" inputClassName="ring-2 ring-sherick-primary ring-offset-2 ring-offset-sherick-canvas bg-sherick-surface-high" />
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
                  <Dropdown options={selectOptions} selected={selection} onSelect={setSelection} aria-label="Project type" className="w-full" />
                  <Dropdown options={selectOptions} disabled aria-label="Disabled project type" className="w-full" />
                </div>
              </Specimen>
            </div>
          </section>

          <section id="selection" className="scroll-mt-28">
            <SectionHeading title="Selection & navigation" description="Persistent state can carry stronger shape and tone than surrounding UI." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Switch" description="Large hit target, compact 52×32 visual track.">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onChange={setSwitchOn} /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onChange={() => undefined} /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Tabs" description="Matte track with a softly elevated sliding selection.">
                <TabGroup tabs={[
                  { id: "one", label: "Overview", content: <p className="text-sm text-sherick-ink-muted">Overview content</p> },
                  { id: "two", label: "Motion", content: <p className="text-sm text-sherick-ink-muted">Motion content</p> },
                  { id: "three", label: "Density", content: <p className="text-sm text-sherick-ink-muted">Density content</p> },
                ]} />
              </Specimen>

              <Specimen title="Navigation groups" description="Current navigation gets a persistent tonal selection.">
                <div className="max-w-xs rounded-[1.25rem] bg-sherick-surface/[0.45] p-2">
                  <NavGroup title="Components" activeHref="#fields" items={[
                    { label: "Buttons", href: "#buttons" },
                    { label: "Fields", href: "#fields" },
                    { label: "Feedback", href: "#feedback" },
                  ]} />
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
                  <div className="flex items-center gap-4 text-sherick-ink-muted"><Spinner size="small" /><Spinner size="medium" /><Spinner size="large" /></div>
                  <div className="space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /></div>
                </div>
              </Specimen>
            </div>
          </section>

          <section id="surfaces" className="scroll-mt-28">
            <SectionHeading title="Surfaces & overlays" description="Cards stay matte; menus, tooltips and modals may use richer acrylic depth." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards & badges" description="Passive content surfaces and compact semantic labels.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary"><div className="font-medium">Neutral card</div><p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Normal information stays matte and grounded.</p></Card>
                  <Card variant="primary"><div className="font-medium">Tonal card</div><p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Use stronger tone only when it adds meaning.</p></Card>
                </div>
                <div className="mt-4 flex flex-wrap gap-2"><Badge variant="primary">Primary</Badge><Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>Ready</Badge><Badge variant="warning">Warning</Badge><Badge variant="danger">Danger</Badge><Badge variant="secondary">Neutral</Badge></div>
              </Specimen>

              <Specimen title="Avatar & tooltip" description="Compact identity and denser floating material.">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-sherick-canvas p-5">
                  <div className="absolute -right-6 top-0 h-24 w-28 rounded-full bg-sherick-accent/[0.18] blur-3xl" />
                  <div className="relative flex items-center gap-5">
                    <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example avatar" size="sm" />
                    <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example rounded avatar" size="md" shape="rounded" />
                    <Tooltip content="Frosted tooltip material"><ActionButton appearance="tonal" variant="secondary">Hover or focus</ActionButton></Tooltip>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Modal" description="Highest elevation uses the strongest acrylic treatment.">
                <ActionButton appearance="tonal" onClick={() => setModalOpen(true)}>Open modal</ActionButton>
              </Specimen>
            </div>
          </section>

          <section id="data" className="scroll-mt-28">
            <SectionHeading title="Data display" description="Dense information remains quiet, compact and easy to scan." />
            <Specimen className="mt-6" title="Table" description="Semantic color belongs inside cells, not across the whole table.">
              <Table headers={["Component", "Role", "Status"]} rows={[
                ["Dropdown", "Custom selection", <Badge key="d" variant="success">Ready</Badge>],
                ["Modal", "Focused overlay", <Badge key="m" variant="success">Ready</Badge>],
                ["Table", "Dense information", <Badge key="t" variant="secondary">Quiet</Badge>],
                ["Input", "Form control", <Badge key="i" variant="primary">Core</Badge>],
              ]} />
            </Specimen>
          </section>

          <section id="content" className="scroll-mt-28 pb-12">
            <SectionHeading title="Content" description="Code and Markdown primitives for documentation and rich text surfaces." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Code block" description="Actions live outside the code viewport and never obscure content.">
                <CodeBlock language="tsx">{'<ActionButton appearance="filled">Save</ActionButton>'}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown" description="Readable defaults for rich text without imposing a documentation theme.">
                <Markdown>{`## Example\nSherick UI keeps **dense information quiet** and lets [floating UI](#surfaces) carry more depth.\n\n- Clear hierarchy\n- Inline \`code\`\n- Restrained semantic color\n\n> Floating material should signal elevation, not decorate everything.`}</Markdown>
              </Specimen>
            </div>
          </section>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Modal specimen</Modal.Header>
        <Modal.Content>This is the highest elevation layer in the system: focused, frosted and deliberately separated from the page beneath it.</Modal.Content>
        <Modal.Footer>
          <ActionButton appearance="text" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</ActionButton>
          <ActionButton appearance="filled" onClick={() => setModalOpen(false)}>Confirm</ActionButton>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div className="border-b border-white/[0.045] pb-5"><h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h2><p className="mt-2 text-base leading-7 text-sherick-ink-muted">{description}</p></div>;
}

function Specimen({ title, description, children, className = "" }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] bg-sherick-surface/[0.72] p-5 sm:p-6 ${className}`}><div className="mb-5"><h3 className="font-medium tracking-[-0.01em]">{title}</h3><p className="mt-1 text-sm leading-6 text-sherick-ink-muted">{description}</p></div>{children}</div>;
}

function Swatch({ label, className }: { label: string; className: string }) {
  return <div><div className={`h-14 rounded-[1rem] ${className}`} /><div className="mt-2 text-xs text-sherick-ink-muted">{label}</div></div>;
}

function StateLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><div>{children}</div><span className="text-sm text-sherick-ink-muted">{label}</span></div>;
}
