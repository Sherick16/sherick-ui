"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Download,
  Heart,
  Monitor,
  Moon,
  Search as SearchIcon,
  Sun,
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

type ThemeMode = "system" | "light" | "dark";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "system" || value === "light" || value === "dark";

const applyTheme = (theme: ThemeMode) => {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-sherick-theme");
  } else {
    document.documentElement.dataset.sherickTheme = theme;
  }
};

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [selection, setSelection] = useState("design");
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = localStorage.getItem("sherick-ui-theme");
    const nextTheme = isThemeMode(stored) ? stored : "system";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const changeTheme = (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    localStorage.setItem("sherick-ui-theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <main className="min-h-screen bg-sherick-canvas text-sherick-ink">
      <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <Badge variant="primary">Sherick UI · development workbench</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Design system showcase</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-sherick-ink-muted">
              Soft tonal hierarchy, expressive interaction, runtime light and dark themes, and richer smoked-glass depth only when UI floats or matters.
            </p>
          </div>
          <ThemePicker theme={theme} onChange={changeTheme} />
        </div>

        <div className="space-y-16">
          <section>
            <SectionHeading title="Foundations" description="Core palette, shape, material and elevation language used by every component." />
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

              <Specimen
                title="Surface & elevation"
                description="Shadow is tied to elevation, not decoration: matte surfaces separate by color, raised surfaces lift slightly, floating glass lifts decisively above the page."
              >
                <div className="space-y-5">
                  <div className="rounded-[1.25rem] bg-sherick-surface p-4 text-sm shadow-sherick-grounded">Matte surface</div>
                  <div className="rounded-[1.5rem] bg-sherick-surface-high p-4 text-sm shadow-sherick-raised">Elevated tonal surface</div>

                  <div className="relative rounded-[1.5rem] bg-sherick-canvas/[0.55] p-5">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.5rem]">
                      <div className="absolute -left-8 -top-4 h-24 w-36 rounded-full bg-sherick-primary/[0.30] blur-[28px]" />
                      <div className="absolute bottom-1 right-1 h-20 w-28 rounded-full bg-sherick-accent/[0.22] blur-[26px]" />
                    </div>
                    <div className="relative rounded-[1.25rem] bg-sherick-surface-float/[0.60] bg-sherick-glass p-4 text-sm shadow-sherick-floating backdrop-blur-[32px] backdrop-saturate-[1.45] backdrop-brightness-[1.04]">
                      Floating liquid glass
                    </div>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Shape roles" description="Softness increases with elevation and emphasis.">
                <div className="grid grid-cols-2 gap-3 text-center text-xs text-sherick-ink-muted">
                  <div className="rounded-[1.25rem] bg-sherick-surface-high/[0.72] p-5">Control</div>
                  <div className="rounded-full bg-sherick-primary/[0.12] p-5 text-sherick-primary">Pill</div>
                  <div className="rounded-[1.75rem] bg-sherick-surface/[0.8] p-5">Surface</div>
                  <div className="rounded-[3rem] bg-sherick-surface-high/[0.72] p-5">Hero</div>
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Buttons" description="Appearance, size and state are separate parts of the API." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances" description="Filled for priority, tonal for normal actions, text for quiet actions. Only tonal controls carry the raised elevation step, and pressing one recesses it.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled">Filled</ActionButton>
                  <ActionButton appearance="tonal" variant="secondary">Tonal</ActionButton>
                  <ActionButton appearance="text" variant="secondary">Text</ActionButton>
                  <ActionButton appearance="tonal" variant="danger" icon={<Trash2 />}>Delete</ActionButton>
                  <IconButton appearance="tonal" variant="secondary" icon={<Bell />} aria-label="Tonal icon button" />
                </div>
              </Specimen>

              <Specimen title="States" description="Loading, disabled and keyboard focus remain visually distinct.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton loading>Saving</ActionButton>
                  <ActionButton disabled>Disabled</ActionButton>
                  <ActionButton className="outline outline-2 outline-sherick-focus outline-offset-[3px]">Focus-visible</ActionButton>
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

          <section>
            <SectionHeading title="Fields" description="One borderless field language across text input, textarea, search and select." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Text input" description="Default, error, focus-visible and disabled states.">
                <div className="space-y-4">
                  <Input label="Project name" placeholder="Sherick UI" />
                  <Input label="Invalid" placeholder="Required value" error />
                  <Input label="Focus-visible" placeholder="Keyboard focus" inputClassName="outline outline-2 outline-sherick-focus outline-offset-[3px] bg-sherick-surface-high/[0.9]" />
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

              <Specimen title="Dropdown" description="Matte trigger, smoked-glass floating listbox, clear selection.">
                <div className="space-y-4">
                  <Dropdown options={selectOptions} selected={selection} onSelect={setSelection} aria-label="Project type" className="w-full" />
                  <Dropdown options={selectOptions} disabled aria-label="Disabled project type" className="w-full" />
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Selection & navigation" description="Persistent state may carry a stronger shape and tone than surrounding UI." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Switch" description="Large hit target, compact visual track.">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onChange={setSwitchOn} /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onChange={() => undefined} /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Tabs" description="Matte track; the selected segment presses into it like a held control.">
                <TabGroup tabs={[
                  { id: "one", label: "Overview", content: <p className="text-sm text-sherick-ink-muted">Overview content</p> },
                  { id: "two", label: "Motion", content: <p className="text-sm text-sherick-ink-muted">Motion content</p> },
                  { id: "three", label: "Density", content: <p className="text-sm text-sherick-ink-muted">Density content</p> },
                ]} />
              </Specimen>

              <Specimen title="Navigation groups" description="Current navigation gets a persistent tonal selection.">
                <div className="max-w-xs rounded-[1.25rem] bg-sherick-surface/[0.5] p-2">
                  <NavGroup title="Components" activeHref="#fields" items={[
                    { label: "Buttons", href: "#buttons" },
                    { label: "Fields", href: "#fields" },
                    { label: "Feedback", href: "#feedback" },
                  ]} />
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Feedback" description="Semantic color communicates actual state and stays restrained by default." />
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

          <section>
            <SectionHeading title="Surfaces & overlays" description="Cards stay matte; floating UI may use restrained smoked liquid-glass depth." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards & badges" description="Passive content surfaces and compact semantic labels.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary"><div className="font-medium">Neutral card</div><p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Normal information stays matte and grounded.</p></Card>
                  <Card variant="primary"><div className="font-medium">Tonal card</div><p className="mt-2 text-sm leading-6 text-sherick-ink-muted">Use stronger tone only when it adds meaning.</p></Card>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" icon={<Check className="h-3.5 w-3.5" />}>Ready</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </Specimen>

              <Specimen title="Avatar & tooltip" description="Compact identity and denser floating glass material.">
                <div className="flex items-center gap-5">
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example avatar" size="sm" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example rounded avatar" size="md" shape="rounded" />
                  <Tooltip content="Smoked liquid-glass tooltip"><ActionButton appearance="tonal" variant="secondary">Hover or focus</ActionButton></Tooltip>
                </div>
              </Specimen>

              <Specimen title="Modal" description="Highest elevation: focused, translucent and visually separated.">
                <ActionButton appearance="tonal" variant="secondary" onClick={() => setModalOpen(true)}>Open modal</ActionButton>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Data display" description="Dense information stays quiet, compact and easy to scan." />
            <Specimen title="Table" description="Semantic color belongs inside cells, not across the whole table." className="mt-6">
              <Table headers={["Component", "Role", "Status"]} rows={[
                ["Dropdown", "Custom selection", <Badge key="dropdown" variant="success">Ready</Badge>],
                ["Modal", "Focused overlay", <Badge key="modal" variant="success">Ready</Badge>],
                ["Table", "Dense information", <Badge key="table" variant="secondary">Quiet</Badge>],
                ["Input", "Form control", <Badge key="input" variant="primary">Core</Badge>],
              ]} />
            </Specimen>
          </section>

          <section className="pb-12">
            <SectionHeading title="Content" description="Code and Markdown primitives for documentation and rich text surfaces." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Code block" description="Copyable syntax-highlighted code with actions outside the code flow.">
                <CodeBlock language="tsx">{'<ActionButton appearance="filled">Save</ActionButton>'}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown" description="Headings, links, lists, quotes and inline code share a readable rhythm.">
                <Markdown>{`## Example\nSherick UI keeps **dense information quiet** and gives floating UI more depth.\n\n- Predictable controls\n- Soft hierarchy\n- [Accessible interactions](#)\n\n> Expression should clarify hierarchy, not decorate every surface.\n\nUse \`ActionButton\` for primary actions.`}</Markdown>
              </Specimen>
            </div>
          </section>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Modal specimen</Modal.Header>
        <Modal.Content>
          This is the highest elevation layer in the system: focused, translucent and deliberately separated from the page beneath it.
        </Modal.Content>
        <Modal.Footer>
          <ActionButton appearance="text" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</ActionButton>
          <ActionButton appearance="filled" onClick={() => setModalOpen(false)}>Confirm</ActionButton>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

function ThemePicker({ theme, onChange }: { theme: ThemeMode; onChange: (theme: ThemeMode) => void }) {
  const choices: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div className="shrink-0">
      <div className="mb-2 text-xs font-medium text-sherick-ink-muted">Theme</div>
      <div className="inline-flex rounded-full bg-sherick-surface/[0.72] p-1 shadow-inner">
        {choices.map(({ value, label, icon: Icon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(value)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sherick-focus focus-visible:outline-offset-2 ${
                selected
                  ? "bg-sherick-primary/[0.16] text-sherick-ink shadow-sherick-pressed"
                  : "text-sherick-ink-muted hover:bg-sherick-ink/[0.05] hover:text-sherick-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-sherick-ink/[0.06] pb-5">
      <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{title}</h2>
      <p className="mt-2 text-base leading-7 text-sherick-ink-muted">{description}</p>
    </div>
  );
}

function Specimen({ title, description, children, className = "" }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] bg-sherick-surface/[0.72] p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="font-medium tracking-[-0.01em]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-sherick-ink-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return <div><div className={`h-14 rounded-[1rem] ${className}`} /><div className="mt-2 text-xs text-sherick-ink-muted">{label}</div></div>;
}

function StateLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><div>{children}</div><span className="text-sm text-sherick-ink-muted">{label}</span></div>;
}
