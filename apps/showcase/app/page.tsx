"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
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
import {
  Button,
  Alert,
  Avatar,
  Badge,
  Card,
  CodeBlock,
  Divider,
  Dropdown,
  IconButton,
  Input,
  Markdown,
  Modal,
  NavGroup,
  Search,
  Skeleton,
  Spinner,
  Switch,
  TabGroup,
  Table,
  Textarea,
  Tooltip,
} from "sherick-ui";
import {
  cn,
  density,
  edge,
  elevation,
  focusRing,
  material,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "sherick-ui/dev";

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
  const [motionSwitch, setMotionSwitch] = useState(false);
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
    <main className={cn("min-h-screen", material.canvas)}>
      <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <Badge variant="primary">Sherick UI · development workbench</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Design system showcase</h1>
            <p className={cn("mt-3 max-w-2xl text-base leading-7", text.medium)}>
              Every component and primitive, side by side, in every theme.
            </p>
            <a
              href="https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md"
              className={cn("mt-4 inline-flex items-center gap-1.5 text-sm", text.medium, motion.press, `${focusRing} focus-visible:outline-offset-2`, "hover:text-sherick-ink")}
            >
              Design language
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <ThemePicker theme={theme} onChange={changeTheme} />
        </div>

        <div className="space-y-16">
          <section>
            <SectionHeading title="Design language" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Material">
                <div className={cn("grid grid-cols-2 gap-4 p-5 sm:grid-cols-3", shape.control, material.canvas)}>
                  <Tile label="Canvas" className={cn(material.canvas, "outline outline-1 outline-dashed outline-sherick-edge/[0.25]")} />
                  <Tile label="Matte quiet" className={material.matteQuiet} />
                  <Tile label="Matte" className={material.matte} />
                  <Tile label="Matte high" className={material.matteHigh} />
                  <Tile label="Matte control" className={material.control} />
                  <Tile label="Invalid" className={material.controlError} />
                </div>
                <div className={cn("relative mt-4 overflow-hidden p-5", shape.prominent, "bg-sherick-canvas/[0.55]")}>
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute -left-6 -top-4 h-24 w-36 rounded-full bg-sherick-primary/[0.30] blur-[28px]" />
                    <div className="absolute -bottom-2 right-2 h-20 w-28 rounded-full bg-sherick-accent/[0.22] blur-[26px]" />
                  </div>
                  <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Tile label="Acrylic" className={material.acrylic} />
                    <Tile label="Dense" className={material.acrylicDense} />
                    <Tile label="Hero" className={material.acrylicHero} />
                  </div>
                </div>
              </Specimen>

              <Specimen title="Elevation">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Tile label="Flat" className={cn(material.matteHigh, elevation.flat)} />
                  <Tile label="Raised" className={cn(material.matteHigh, elevation.raised)} />
                  <Tile label="Control" className={cn(material.matteHigh, elevation.control)} />
                  <Tile label="Recessed" className={cn(material.matteHigh, elevation.recessed)} />
                  <Tile label="Floating" className={cn(material.matteHigh, elevation.floating)} />
                </div>
              </Specimen>

              <Specimen title="Shape">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Tile label="1.25rem" caption="Control" className={cn(material.matteHigh, shape.control)} />
                  <Tile label="1.5rem" caption="Prominent" className={cn(material.matteHigh, shape.prominent)} />
                  <Tile label="1.75rem" caption="Surface" className={cn(material.matteHigh, shape.surface)} />
                  <Tile label="2rem" caption="Expressive" className={cn(material.matteHigh, shape.expressive)} />
                  <Tile label="pill" caption="Pill" className={cn(tone.tonal.primary, shape.pill, text.high)} />
                  <Tile label="circle" caption="Circle" className={cn(tone.tonal.primary, shape.circle, text.high, "aspect-square w-24 max-w-full self-center")} />
                </div>
              </Specimen>

              <Specimen title="Tonality">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Swatch label="Canvas" className={material.canvas} />
                    <Swatch label="Surface" className="bg-sherick-surface" />
                    <Swatch label="Surface high" className="bg-sherick-surface-high" />
                    <Swatch label="Surface float" className="bg-sherick-surface-float" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Swatch label="Primary strong" className="bg-sherick-primary-strong" />
                    <Swatch label="Primary" className="bg-sherick-primary" />
                    <Swatch label="Primary soft" className="bg-sherick-primary-soft" />
                    <Swatch label="Accent" className="bg-sherick-accent" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Swatch label="Danger" className="bg-sherick-danger" />
                    <Swatch label="Warning" className="bg-sherick-warning" />
                    <Swatch label="Success" className="bg-sherick-success" />
                  </div>
                  <div className="space-y-2">
                    <p className={cn("text-sm", text.high)}>High emphasis</p>
                    <p className={cn("text-sm", text.medium)}>Medium emphasis</p>
                    <p className={cn("text-sm", text.low)}>Low emphasis</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">Soft primary</Badge>
                    <Badge variant="danger">Soft danger</Badge>
                    <span className={cn("inline-flex min-h-7 items-center px-3 text-xs font-semibold", shape.pill, tone.tonal.secondary, text.high)}>Tonal</span>
                    <span className={cn("inline-flex min-h-7 items-center px-3 text-xs font-semibold", shape.pill, tone.strong.primary)}>Strong</span>
                    <span className={cn("inline-flex min-h-7 items-center px-3 text-xs font-semibold", shape.pill, tone.selected.primary)}>Selected</span>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Interaction states">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Tile label="Rest" className={cn(material.control, text.high)} />
                  <Tile label="Hover" className={cn(material.control, "bg-sherick-surface-high/[0.82]", text.high)} />
                  <Tile label="Pressed" className={cn(material.control, text.high, stateLayer.tonal, "before:opacity-[0.15]")} />
                  <Tile label="Selected" className={cn(shape.control, tone.selected.primary)} />
                  <Tile label="Disabled" className={cn(material.control, state.disabled)} />
                  <Tile label="Focus" className={cn(material.control, text.high, "outline outline-2 outline-sherick-focus outline-offset-[3px]")} />
                </div>
              </Specimen>

              <Specimen title="Motion">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={cn("w-20 text-xs font-medium", text.high)}>Press</span>
                    <Input placeholder="Hover, focus or type" className="w-56" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={cn("w-20 text-xs font-medium", text.high)}>Release</span>
                    <Switch checked={motionSwitch} onChange={setMotionSwitch} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={cn("w-20 text-xs font-medium", text.high)}>Overlay</span>
                    <Tooltip content="Overlay">
                      <IconButton variant="secondary" icon={<Bell />} aria-label="Overlay" />
                    </Tooltip>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Density">
                <div className="flex flex-wrap items-center gap-4">
                  <Button appearance="tonal" variant="secondary" size="sm">Compact</Button>
                  <Button appearance="tonal" variant="secondary" size="md">Normal</Button>
                  <Button appearance="tonal" variant="secondary" size="lg">Prominent</Button>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className={cn("text-xs font-medium", text.high)}>Target</span>
                  <span className={cn(density.target, shape.circle, material.matteHigh, "inline-flex items-center justify-center")}>
                    <Heart className="size-5" aria-hidden="true" />
                  </span>
                </div>
              </Specimen>

              <Specimen title="Structural lines">
                <div className={cn("overflow-hidden", shape.control, material.matte)}>
                  <div className={cn("px-4 py-3 text-sm font-medium", edge.header, text.medium)}>Column header</div>
                  <div className={cn("px-4 py-3 text-sm", edge.row, text.high)}>Table rows</div>
                  <div className="flex items-center gap-4 px-4 py-4">
                    <span className={cn("w-24 shrink-0 text-sm", text.high)}>Divider</span>
                    <Divider className="flex-1" />
                  </div>
                  <div className="flex h-9 items-center gap-4 px-4">
                    <span className={cn("w-24 shrink-0 text-sm", text.high)}>Vertical</span>
                    <Divider orientation="vertical" />
                    <span className={cn("text-sm", text.high)}>Divider</span>
                  </div>
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Buttons" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances">
                <div className="flex flex-wrap items-center gap-3">
                  <Button appearance="filled">Filled</Button>
                  <Button appearance="tonal" variant="secondary">Tonal</Button>
                  <Button appearance="text" variant="secondary">Text</Button>
                  <Button appearance="tonal" variant="danger" icon={<Trash2 />}>Delete</Button>
                  <IconButton appearance="tonal" variant="secondary" icon={<Bell />} aria-label="Tonal icon button" />
                </div>
              </Specimen>

              <Specimen title="States">
                <div className="flex flex-wrap items-center gap-3">
                  <Button loading>Saving</Button>
                  <Button disabled>Disabled</Button>
                  <Button className="outline outline-2 outline-sherick-focus outline-offset-[3px]">Focus-visible</Button>
                </div>
              </Specimen>

              <Specimen title="Sizes">
                <div className="flex flex-wrap items-center gap-3">
                  <Button appearance="filled" size="sm">Small</Button>
                  <Button appearance="filled" size="md">Medium</Button>
                  <Button appearance="filled" size="lg">Large</Button>
                </div>
              </Specimen>

              <Specimen title="Icon buttons">
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
            <SectionHeading title="Fields" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Text input">
                <div className="space-y-4">
                  <Input label="Project name" placeholder="Sherick UI" />
                  <Input label="Invalid" placeholder="Required value" error />
                  <Input label="Focus-visible" placeholder="Keyboard focus" inputClassName="outline outline-2 outline-sherick-focus outline-offset-[3px] bg-sherick-surface-high/[0.9]" />
                  <Input label="Disabled" placeholder="Unavailable" disabled />
                </div>
              </Specimen>

              <Specimen title="Textarea">
                <div className="space-y-4">
                  <Textarea label="Notes" placeholder="Describe what you want to build…" />
                  <Textarea label="Invalid notes" placeholder="Add more detail" error />
                </div>
              </Specimen>

              <Specimen title="Search">
                <div className="space-y-4">
                  <Search onSearch={() => undefined} placeholder="Search components" className="w-full" />
                  <Search onSearch={() => undefined} placeholder="Loading search" loading className="w-full" />
                </div>
              </Specimen>

              <Specimen title="Dropdown">
                <div className="space-y-4">
                  <Dropdown options={selectOptions} selected={selection} onSelect={setSelection} aria-label="Project type" className="w-full" />
                  <Dropdown options={selectOptions} disabled aria-label="Disabled project type" className="w-full" />
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Selection & navigation" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Switch">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onChange={setSwitchOn} /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onChange={() => undefined} /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Tabs">
                <TabGroup className="overflow-x-auto" tabs={[
                  { id: "one", label: "Overview", content: <p className={cn("text-sm", text.medium)}>Overview content</p> },
                  { id: "two", label: "Motion", content: <p className={cn("text-sm", text.medium)}>Motion content</p> },
                  { id: "three", label: "Density", content: <p className={cn("text-sm", text.medium)}>Density content</p> },
                ]} />
              </Specimen>

              <Specimen title="Navigation groups">
                <div className={cn("max-w-xs p-2", shape.control, material.matte)}>
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
            <SectionHeading title="Feedback" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Alerts">
                <div className="space-y-3">
                  <Alert variant="primary">A useful piece of information.</Alert>
                  <Alert variant="success">Changes were saved successfully.</Alert>
                  <Alert variant="warning">Review these settings before continuing.</Alert>
                  <Alert variant="danger" closeable>Something needs your attention.</Alert>
                </div>
              </Specimen>

              <Specimen title="Loading & skeleton">
                <div className="space-y-7">
                  <div className={cn("flex items-center gap-4", text.medium)}><Spinner size="small" /><Spinner size="medium" /><Spinner size="large" /></div>
                  <div className="space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /></div>
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Surfaces & overlays" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards & badges">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary"><div className="font-medium">Neutral card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Body copy goes here.</p></Card>
                  <Card variant="primary"><div className="font-medium">Tonal card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Body copy goes here.</p></Card>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" icon={<Check className="size-3.5" />}>Ready</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </Specimen>

              <Specimen title="Avatar & tooltip">
                <div className="flex items-center gap-5">
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example avatar" size="sm" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example rounded avatar" size="md" shape="rounded" />
                  <Tooltip content="Acrylic tooltip"><Button appearance="tonal" variant="secondary">Hover or focus</Button></Tooltip>
                </div>
              </Specimen>

              <Specimen title="Modal">
                <Button appearance="tonal" variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Data display" />
            <Specimen title="Table" className="mt-6">
              <Table headers={["Component", "Role", "Status"]} rows={[
                ["Dropdown", "Custom selection", <Badge key="dropdown" variant="success">Ready</Badge>],
                ["Modal", "Focused overlay", <Badge key="modal" variant="success">Ready</Badge>],
                ["Table", "Dense information", <Badge key="table" variant="secondary">Quiet</Badge>],
                ["Input", "Form control", <Badge key="input" variant="primary">Core</Badge>],
              ]} />
            </Specimen>
          </section>

          <section className="pb-12">
            <SectionHeading title="Content" />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Code block">
                <CodeBlock language="tsx">{'<Button appearance="filled">Save</Button>'}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown">
                <Markdown>{`## Example\nSherick UI keeps **dense information quiet** and gives floating UI more depth.\n\n- Predictable controls\n- Soft hierarchy\n- [Accessible interactions](#)\n\n> Expression should clarify hierarchy, not decorate every surface.\n\nUse \`Button\` for primary actions, and reach for a fenced block when the code carries its own hierarchy:\n\n\`\`\`ts\nconst surface = material.matte;\nconst action = shape.pill;\n\`\`\``}</Markdown>
              </Specimen>
            </div>
          </section>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Modal specimen</Modal.Header>
        <Modal.Content>
          Overlay specimen content.
        </Modal.Content>
        <Modal.Footer>
          <Button appearance="text" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button appearance="filled" onClick={() => setModalOpen(false)}>Confirm</Button>
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
      <div className={cn("mb-2 text-xs font-medium", text.medium)}>Theme</div>
      <div className={cn("inline-flex bg-sherick-surface/[0.72] p-1", shape.pill, elevation.recessed)}>
        {choices.map(({ value, label, icon: Icon }) => {
          const selected = theme === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(value)}
              className={cn(
                "inline-flex min-h-9 items-center gap-1.5 px-3 text-xs font-medium",
                shape.pill,
                motion.press,
                `${focusRing} focus-visible:outline-offset-2`,
                selected
                  ? cn(tone.selected.primary, elevation.control, text.high)
                  : cn(text.medium, "hover:text-sherick-ink", state.rowHover)
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className={cn("border-b pb-5", edge.rule)}>
      <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{title}</h2>
    </div>
  );
}

function Specimen({ title, className = "", children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(shape.surface, material.matte, "min-w-0 p-6", className)}>
      <h3 className="mb-5 font-medium tracking-[-0.01em]">{title}</h3>
      {children}
    </div>
  );
}

function Tile({ label, caption, className }: { label?: string; caption?: string; className?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex min-h-20 items-center justify-center px-4 text-sm", shape.control, className)}>{label}</div>
      {caption ? <div className={cn("text-xs font-medium", text.high)}>{caption}</div> : null}
    </div>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return <div><div className={cn("h-14", shape.control, className)} /><div className={cn("mt-2 text-xs", text.medium)}>{label}</div></div>;
}

function StateLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><div>{children}</div><span className={cn("text-sm", text.medium)}>{label}</span></div>;
}
