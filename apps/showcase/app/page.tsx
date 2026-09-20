"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Download,
  Ellipsis,
  Heart,
  Monitor,
  Moon,
  Search as SearchIcon,
  SlidersHorizontal,
  Sun,
  Trash2,
} from "lucide-react";
import {
  Accordion,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  ChipGroup,
  Collapsible,
  Combobox,
  Dialog,
  Divider,
  Drawer,
  Field,
  IconButton,
  Input,
  Menu,
  NavGroup,
  NumberField,
  Popover,
  Progress,
  RadioGroup,
  Search,
  SegmentedControl,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  ToastProvider,
  ToastViewport,
  ToggleGroup,
  Tooltip,
  useToast,
} from "sherick-ui";
import type { DrawerSide } from "sherick-ui";
import { CodeBlock, Markdown } from "sherick-ui/content";
import {
  cn,
  density,
  edge,
  elevation,
  focusRing,
  material,
  motionActivityIndeterminate,
  motionActivityPulse,
  motionActivitySpin,
  motionArrive,
  motionFeedback,
  motionOrient,
  motionPresenceAnchored,
  motionRelocate,
  motionTactile,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "sherick-ui/dev";

import {
  ShowcaseJumpNav,
  ShowcaseSideNav,
  showcaseSections,
  useShowcaseScrollSpy,
  type ShowcaseSectionId,
} from "../components/ShowcaseNav";

const selectOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Marketing site", value: "marketing" },
];

const comboboxOptions = [
  { label: "Design system", value: "design" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Marketing site", value: "marketing", disabled: true },
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [selection, setSelection] = useState("design");
  const [alertOpen, setAlertOpen] = useState(false);
  const [filters, setFilters] = useState<string[]>(["design"]);
  const [range, setRange] = useState("week");
  const [alignment, setAlignment] = useState<string[]>(["left"]);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const activeSection = useShowcaseScrollSpy();

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
    <main className={cn("min-h-screen text-left", material.canvas)}>
      <div className="mx-auto w-full max-w-[1320px] px-5 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <Badge variant="primary">Sherick UI · development workbench</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Design system showcase</h1>
            <p className={cn("mt-3 max-w-2xl text-base leading-7", text.medium)}>
              Every component and primitive, side by side, in every theme.
            </p>
            <a
              href="https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md"
              className={cn("mt-4 inline-flex items-center gap-1.5 text-sm", text.medium, motionFeedback, `${focusRing} focus-visible:outline-offset-2`, "hover:text-sherick-ink")}
            >
              Design language
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          <ThemePicker theme={theme} onChange={changeTheme} />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 min-[1660px]:max-w-none min-[1660px]:grid-cols-[minmax(0,1fr)_1320px_minmax(0,1fr)]">
        <div className="hidden min-[1660px]:block">
          <ShowcaseSideNav activeId={activeSection} className="sticky top-28 ml-auto mr-3 w-36" />
        </div>
        <div className="min-w-0 px-5 pb-10 sm:px-8 lg:px-10 lg:pb-14">
        <div className="sticky top-4 z-30 mb-6 min-[1660px]:hidden">
          <ShowcaseJumpNav activeId={activeSection} />
        </div>
        <div className="space-y-16">
          <ShowcaseSection id="design-language">
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
                  <Tile label="Raised" testId="tile-raised" className={cn(material.matteHigh, elevation.raised)} />
                  <Tile label="Control" className={cn(material.matteHigh, elevation.control)} />
                  <Tile label="Recessed" testId="tile-recessed" className={cn(material.matteHigh, elevation.recessed)} />
                  <Tile label="Floating" testId="tile-floating" className={cn(material.matteHigh, elevation.floating)} />
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
                <MotionSpecimen />
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
          </ShowcaseSection>

          <ShowcaseSection id="buttons">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances">
                <div className="flex flex-wrap items-center gap-3">
                  <Button appearance="filled">Filled</Button>
                  <Button appearance="tonal" variant="secondary">Tonal</Button>
                  <Button appearance="text" variant="secondary">Text</Button>
                  <Button appearance="tonal" variant="danger" icon={<Trash2 />}>Delete</Button>
                </div>
              </Specimen>

              <Specimen title="States">
                {/* A loading button keeps its label, so the two states sit beside each other and the
                    control can be compared without it moving. */}
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="Rest"><Button icon={<Download />}>Export</Button></StateLabel>
                  <StateLabel label="Loading"><Button icon={<Download />} loading>Export</Button></StateLabel>
                  <StateLabel label="Disabled"><Button disabled>Disabled</Button></StateLabel>
                  <StateLabel label="Focus"><Button className="outline outline-2 outline-sherick-focus outline-offset-[3px]">Focus-visible</Button></StateLabel>
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
                  <IconButton icon={<Bell />} loading aria-label="Saving notifications" />
                  <IconButton disabled icon={<Heart />} aria-label="Disabled favorite" />
                </div>
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="fields">
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

              <Specimen title="Select">
                <div className="space-y-4">
                  <Select options={selectOptions} aria-label="Empty project type" />
                  <Select options={selectOptions} value={selection} onValueChange={(next) => setSelection(next ?? "")} aria-label="Project type" />
                  <Select options={selectOptions} disabled aria-label="Disabled project type" />
                </div>
              </Specimen>

              <Specimen title="Combobox">
                <div className="space-y-4">
                  <Field label="Project">
                    <Combobox options={comboboxOptions} defaultValue="dashboard" />
                  </Field>
                  <Field label="No results">
                    <Combobox options={comboboxOptions} defaultInputValue="Nothing matches this query" />
                  </Field>
                  <Field label="Disabled">
                    <Combobox options={comboboxOptions} defaultValue="design" disabled />
                  </Field>
                </div>
              </Specimen>

              <Specimen title="Field & validation">
                <div className="space-y-5">
                  <Field label="Quantity" description="Between 1 and 10.">
                    <NumberField min={1} max={10} defaultValue={4} />
                  </Field>
                  <Field label="Seats" required error="Choose between 1 and 10 seats.">
                    <NumberField min={1} max={10} defaultValue={10} />
                  </Field>
                  <Field label="Locked" description="Owned by the workspace.">
                    <NumberField defaultValue={4} disabled />
                  </Field>
                </div>
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="selection">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Checkbox">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="Checked"><Checkbox defaultChecked aria-label="Checked" /></StateLabel>
                  <StateLabel label="Unchecked"><Checkbox aria-label="Unchecked" /></StateLabel>
                  <StateLabel label="Mixed"><Checkbox indeterminate aria-label="Mixed" /></StateLabel>
                  <StateLabel label="Disabled"><Checkbox defaultChecked disabled aria-label="Disabled" /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Radio group">
                <RadioGroup
                  label="Deployment target"
                  defaultValue="preview"
                  options={[
                    { value: "production", label: "Production" },
                    { value: "preview", label: "Preview" },
                    { value: "cluster", label: "Shared cluster, whose label is long enough to wrap across more than one line" },
                    { value: "edge", label: "Edge", disabled: true },
                  ]}
                />
              </Specimen>

              <Specimen title="Switch">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="On" /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onCheckedChange={() => undefined} aria-label="Off" /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled aria-label="Disabled" /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Slider">
                <div className="space-y-6">
                  <Field label="Budget">
                    <Slider defaultValue={40} />
                  </Field>
                  <Field label="Disabled budget">
                    <Slider defaultValue={65} disabled />
                  </Field>
                </div>
              </Specimen>

              <Specimen title="Chips">
                <div className="space-y-5">
                  <ChipGroup aria-label="Filters" value={filters} onValueChange={setFilters}>
                    <Chip value="design">Design</Chip>
                    <Chip value="code">Code</Chip>
                    <Chip value="ops" disabled>Ops</Chip>
                  </ChipGroup>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Chip variant="success" icon={<Check />}>Ready</Chip>
                    <Chip variant="warning">Beta</Chip>
                    <Chip icon={<Check />} onRemove={() => undefined}>Verified</Chip>
                    <Chip onRemove={() => undefined}>Platform</Chip>
                  </div>
                </div>
              </Specimen>

              <Specimen title="Segmented control">
                <div className="flex flex-col items-start gap-5">
                  <SegmentedControl
                    aria-label="Range"
                    value={range}
                    onValueChange={setRange}
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                    ]}
                  />
                  <SegmentedControl
                    aria-label="Text alignment"
                    defaultValue="start"
                    options={[
                      { value: "start", label: "Start", icon: <AlignLeft className="size-4" /> },
                      { value: "center", label: "Center", icon: <AlignCenter className="size-4" /> },
                    ]}
                  />
                  <ToggleGroup aria-label="Text format" multiple value={alignment} onValueChange={setAlignment}>
                    <ToggleGroup.Item value="left" aria-label="Align left"><AlignLeft className="size-4" /></ToggleGroup.Item>
                    <ToggleGroup.Item value="center" aria-label="Align center"><AlignCenter className="size-4" /></ToggleGroup.Item>
                    <ToggleGroup.Item value="right" aria-label="Align right" disabled><AlignRight className="size-4" /></ToggleGroup.Item>
                  </ToggleGroup>
                </div>
              </Specimen>

              <Specimen title="Tabs">
                <Tabs tabs={[
                  { id: "one", label: "Overview", content: <p className={cn("text-sm", text.medium)}>Overview content</p> },
                  { id: "two", label: "Activity", content: <p className={cn("text-sm", text.medium)}>Activity content</p> },
                  { id: "three", label: "Members", content: <p className={cn("text-sm", text.medium)}>Members content</p> },
                ]} />
              </Specimen>

              <Specimen title="Navigation groups">
                <div className={cn("flex max-w-xs flex-col gap-4")}>
                  <NavGroup
                    title="Foundations"
                    activeHref="#design-language"
                    items={[
                      { label: "Design language", href: "#design-language" },
                      { label: "Display", href: "#display" },
                    ]}
                  />
                  <NavGroup
                    title="Controls"
                    activeHref="#fields"
                    items={[
                      { label: "Buttons", href: "#buttons" },
                      { label: "Fields", href: "#fields" },
                      { label: "Selection", href: "#selection" },
                    ]}
                  />
                </div>
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="feedback">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Alerts">
                <div className="space-y-3">
                  <Alert variant="primary">A useful piece of information.</Alert>
                  <Alert variant="success">Changes were saved successfully.</Alert>
                  <Alert variant="warning">Review these settings before continuing.</Alert>
                  <Alert variant="danger" closeable>
                    The connection dropped before the file was sent. Retry the upload, or split the
                    file and add each part to the workspace again.
                  </Alert>
                </div>
              </Specimen>

              <Specimen title="Loading & skeleton">
                <div className="space-y-7">
                  <div className={cn("flex items-center gap-4", text.medium)}><Spinner size="small" /><Spinner size="medium" /><Spinner size="large" /></div>
                  <div className="space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /></div>
                </div>
              </Specimen>

              <Specimen title="Progress">
                <div className="space-y-7">
                  <Progress value={62} label="Uploading assets" showValue />
                  <Progress value={null} label="Scanning dependencies" />
                  <Progress value={100} variant="success" label="Deploy finished" showValue />
                </div>
              </Specimen>

              <Specimen title="Toasts">
                {/* The provider is the demo's own: it wraps the button that raises a toast and the
                    stack that renders it, which is the whole of the relationship the component
                    asks of an application. */}
                <ToastProvider>
                  <ToastSpecimen />
                  <ToastViewport />
                </ToastProvider>
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="disclosure">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Accordion">
                <Accordion defaultValue={["wrapped"]}>
                  <Accordion.Item value="plan">
                    <Accordion.Trigger>What is included in the workspace plan?</Accordion.Trigger>
                    <Accordion.Panel className={cn("text-sm leading-7", text.medium)}>
                      Unlimited projects, shared components and the full theme.
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="wrapped">
                    <Accordion.Trigger>
                      A section whose own label wraps across more than one line, which the row has to
                      lay out
                    </Accordion.Trigger>
                    <Accordion.Panel className={cn("text-sm leading-7", text.medium)}>
                      Invoices are issued on the first working day of each month.
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="locked" disabled>
                    <Accordion.Trigger>A section that cannot be opened</Accordion.Trigger>
                    <Accordion.Panel>Contact the workspace owner to change the plan.</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Specimen>

              <Specimen title="Collapsible">
                <Collapsible>
                  <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
                  <Collapsible.Panel className={cn("text-sm leading-7", text.medium)}>
                    Send a copy of every deployment to the workspace owners.
                  </Collapsible.Panel>
                </Collapsible>
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="display">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary"><div className="font-medium">Neutral card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Body copy goes here.</p></Card>
                  <Card variant="primary"><div className="font-medium">Tonal card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Body copy goes here.</p></Card>
                </div>
              </Specimen>

              <Specimen title="Badges">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="secondary">Neutral</Badge>
                  <Badge variant="success" icon={<Check />}>Ready</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                </div>
              </Specimen>

              <Specimen title="Avatar">
                <div className="flex flex-wrap items-end gap-5">
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Small avatar" size="sm" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Rounded avatar" size="md" shape="rounded" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Large avatar" size="lg" />
                </div>
              </Specimen>

              <Specimen title="Table">
                <Table headers={["Project", "Owner", "Status"]} rows={[
                  ["Design system", "Ana", <Badge key="design" variant="success">Live</Badge>],
                  ["Marketing site", "Bruno", <Badge key="marketing" variant="primary">In review</Badge>],
                  ["Documentation", "Chen", <Badge key="docs" variant="secondary">Draft</Badge>],
                ]} />
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="floating">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Popover">
                <Popover>
                  <Popover.Trigger
                    render={
                      <Button appearance="tonal" variant="secondary" icon={<SlidersHorizontal />}>
                        Filters
                      </Button>
                    }
                  />
                  <Popover.Content className="w-72">
                    <div className="space-y-3">
                      <p className={cn("text-sm font-medium", text.high)}>Refine results</p>
                      <Input label="Owner" placeholder="Anyone" />
                      <Field label="Status">
                        <Select options={selectOptions} defaultValue="design" />
                      </Field>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <Button appearance="tonal" variant="secondary">Reset</Button>
                      <Button appearance="filled">Apply</Button>
                    </div>
                  </Popover.Content>
                </Popover>
              </Specimen>

              <Specimen title="Menu">
                <Menu>
                  <Menu.Trigger
                    render={
                      <Button appearance="tonal" variant="secondary" icon={<Ellipsis />}>
                        Actions
                      </Button>
                    }
                  />
                  <Menu.Content>
                    <Menu.Item onClick={() => undefined}>Rename</Menu.Item>
                    <Menu.Item disabled>Duplicate</Menu.Item>
                    <Menu.Separator />
                    <Menu.Item variant="danger" onClick={() => undefined}>Delete</Menu.Item>
                  </Menu.Content>
                </Menu>
              </Specimen>

              <Specimen title="Tooltip">
                <div className="flex flex-wrap items-center gap-3">
                  <Tooltip content="Creates a copy in the same workspace">
                    <Button appearance="tonal" variant="secondary">Duplicate project</Button>
                  </Tooltip>
                </div>
              </Specimen>

              <Specimen title="Dialog & alert dialog">
                <div className="flex flex-wrap items-center gap-3">
                  <Button appearance="tonal" variant="secondary" onClick={() => setDialogOpen(true)}>Open dialog</Button>
                  <Button appearance="filled" variant="danger" icon={<Trash2 />} onClick={() => setAlertOpen(true)}>Delete project</Button>
                </div>
              </Specimen>

              <Specimen title="Sheet">
                <SheetSpecimen />
              </Specimen>
            </div>
          </ShowcaseSection>

          <ShowcaseSection id="content" className="pb-12">
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Code block">
                <CodeBlock language="tsx">{'<Button appearance="filled">Save</Button>'}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown">
                <Markdown>{`## Workspace settings\nEverything in this project is **shared with the team** and versioned together.\n\n- Invite members from the workspace settings\n- Pin a deployment to keep it live\n- [Read the changelog](#)\n\n> Changes are reviewed before they reach production.\n\nReach for a fenced block when the code carries its own hierarchy:\n\n\`\`\`ts\nconst workspace = createWorkspace({ name: "Sherick UI" });\n\`\`\``}</Markdown>
              </Specimen>
            </div>
          </ShowcaseSection>
        </div>
        </div>
        <div className="hidden min-[1660px]:block" aria-hidden="true" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Header>Dialog specimen</Dialog.Header>
        <Dialog.Content>
          <div className="space-y-5">
            <p>Overlay specimen content.</p>
            <Field label="Dialog project type">
              <Combobox options={comboboxOptions} defaultValue="design" />
            </Field>
          </div>
        </Dialog.Content>
        <Dialog.Footer>
          <Button appearance="text" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button appearance="filled" onClick={() => setDialogOpen(false)}>Confirm</Button>
        </Dialog.Footer>
      </Dialog>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="Delete project?"
        description="Every deployment of this project will be removed. This action cannot be undone."
        cancelLabel="Keep project"
        confirmLabel="Delete project"
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />
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
                motionFeedback,
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

function ShowcaseSection({
  id,
  className,
  children,
}: {
  id: ShowcaseSectionId;
  className?: string;
  children: React.ReactNode;
}) {
  const section = showcaseSections.find((entry) => entry.id === id);
  if (!section) {
    throw new Error(`Unknown showcase section: ${id}`);
  }

  return (
    <section id={section.id} className={cn("scroll-mt-28", className)}>
      <SectionHeading title={section.title} />
      {children}
    </section>
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

function Tile({ label, caption, className, testId }: { label?: string; caption?: string; className?: string; testId?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        data-testid={label ? `tile-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined}
        className={cn("flex min-h-20 items-center justify-center px-4 text-sm", shape.control, className)}
      >
        {label}
      </div>
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

/* One intent per stage, and every stage is reversible by hand so both directions of its recipe are
   visible. A stage carries a recipe's classes on a minimal mark wherever an intent can be shown
   that way — each component already demonstrates its own motion where it is specimened, and what a
   reader cannot see there is one intent at a time with its name beside it.
   Two intents cannot be shown that way, because they belong to a *widget* rather than to a mark: a
   direct manipulation needs a part the pointer can actually drag, and a disclosure needs a
   measured region and a trigger relationship. Those two stages use the real component, because the
   alternative is a second slider and a second disclosure with their own contracts to get wrong —
   and this page is not a fixture for behaviour, which the motion suite covers against the
   verification fixture. */
function MotionSpecimen() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const toggle = (intent: string) => setOn((current) => ({ ...current, [intent]: !current[intent] }));

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {/* Feedback is the one intent a click cannot show: it is the response to a pointer being on a
          surface or a keyboard landing on it, so the stage is hovered or focused rather than
          toggled, and nothing about it travels. */}
      <MotionStage label="feedback">
        <button
          type="button"
          className={cn(
            "flex h-9 items-center px-3 text-xs",
            shape.control,
            focusRing,
            motionFeedback,
            material.matteHigh,
            text.medium,
            state.enabled,
            "hover:bg-sherick-surface-high/[0.82] hover:text-sherick-ink",
            "focus-visible:bg-sherick-surface-high/[0.82] focus-visible:text-sherick-ink"
          )}
        >
          Hover or focus
        </button>
      </MotionStage>

      <MotionStage label="tactile">
        <button
          type="button"
          className={cn(
            "flex h-9 items-center px-3 text-xs font-medium",
            shape.control,
            focusRing,
            motionTactile,
            elevation.raised,
            state.recess,
            tone.tonal.secondary,
            text.high,
            state.enabled
          )}
        >
          Hold
        </button>
      </MotionStage>

      <MotionStage label="arrive">
        <button
          type="button"
          onClick={() => toggle("arrive")}
          aria-label="Toggle the arriving mark"
          aria-pressed={on.arrive ?? false}
          className={cn("flex size-7 items-center justify-center", shape.mark, elevation.recessed, material.matteHigh, focusRing, state.enabled)}
        >
          {/* The two states a primitive publishes around a mark: while it leaves, `data-ending-style`
              holds it at the exit geometry, and clearing that attribute is the arrival. */}
          <span
            aria-hidden="true"
            data-ending-style={on.arrive ? undefined : ""}
            className={cn("size-4", shape.circle, tone.strong.primary, motionArrive)}
          />
        </button>
      </MotionStage>

      <MotionStage label="orient">
        <button
          type="button"
          onClick={() => toggle("orient")}
          aria-label="Turn the affordance"
          aria-pressed={on.orient ?? false}
          className={cn("flex size-7 items-center justify-center", shape.circle, material.matteHigh, text.high, focusRing, state.enabled)}
        >
          <ChevronDown className={cn("size-4", motionOrient, on.orient && "rotate-180")} aria-hidden="true" />
        </button>
      </MotionStage>

      <MotionStage label="relocate">
        <button
          type="button"
          onClick={() => toggle("relocate")}
          aria-label="Move the mark between its destinations"
          aria-pressed={on.relocate ?? false}
          className={cn("relative block h-8 w-16", shape.pill, elevation.recessed, material.matteHigh, focusRing, state.enabled)}
        >
          <span
            aria-hidden="true"
            className={cn("absolute left-1 top-1 size-6", shape.circle, elevation.control, material.handle, motionRelocate, on.relocate && "translate-x-9")}
          />
        </button>
      </MotionStage>

      <MotionStage label="direct">
        {/* The one intent a mark cannot demonstrate. Pointer-driven geometry belongs to the part the
            pointer is on, and showing that honestly means the part has to *be* draggable: a mark that
            fakes it is a second slider, with its own keyboard contract to get wrong. The real control
            owns the drag and writes the range's geometry directly, which is exactly the intent. */}
        <Slider label="Position" defaultValue={40} className="w-32" />
      </MotionStage>

      <MotionStage label="disclose">
        {/* And a mark cannot disclose anything either: a region that only shrinks to `height: 0` is
            still a region, and its trigger needs the relationship, the measured height and the
            hidden state that go with one. The real disclosure supplies all three. */}
        <div className="w-32">
          <Collapsible>
            <Collapsible.Trigger>Region</Collapsible.Trigger>
            <Collapsible.Panel>Panel content</Collapsible.Panel>
          </Collapsible>
        </div>
      </MotionStage>

      <MotionStage label="presence">
        <div className="relative flex flex-col items-center">
          {/* A toggle, not a disclosure: the surface it reveals is decorative and `aria-hidden`, so
              the trigger announces its own state rather than claiming a region it does not control. */}
          <button
            type="button"
            onClick={() => toggle("presence")}
            aria-pressed={on.presence ?? false}
            className={cn("relative z-10 flex h-8 items-center px-3 text-xs", shape.control, material.matteHigh, text.high, focusRing, state.enabled)}
          >
            Anchor
          </button>
          {/* Base publishes the anchor edge as `--transform-origin`; a stage has no positioner, so it
              declares one, and the attribute it toggles is the one a primitive writes while an
              anchored surface enters. */}
          <div
            aria-hidden="true"
            data-ending-style={on.presence ? undefined : ""}
            className={cn(
              "mt-1 flex h-8 items-center px-3 text-xs",
              "[--transform-origin:top]",
              shape.control,
              material.acrylicDense,
              elevation.floating,
              text.high,
              motionPresenceAnchored
            )}
          >
            Surface
          </div>
        </div>
      </MotionStage>

      <MotionStage label="activity">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={cn("size-4 rounded-full border-2 border-sherick-ink-faint border-t-transparent", motionActivitySpin)} />
          <span aria-hidden="true" className={cn("h-4 w-10", shape.pill, material.matteHigh, motionActivityPulse)} />
          <span aria-hidden="true" className={cn("relative block h-1.5 w-10 overflow-hidden", shape.pill, elevation.recessed, material.matteHigh)}>
            <span className={cn("absolute inset-y-0 w-1/2", shape.pill, tone.strong.primary, motionActivityIndeterminate)} />
          </span>
        </div>
      </MotionStage>
    </div>
  );
}

function MotionStage({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex h-24 items-center justify-center px-3", shape.control, material.canvas)}>{children}</div>
      <div className={cn("text-xs font-medium", text.high)}>{label}</div>
    </div>
  );
}

/* `direct` is the one intent a still stage cannot fake: while the pointer owns the geometry the
   positional transition is removed, and the mark settles to the nearest destination on release. */
function SheetSpecimen() {
  const [side, setSide] = useState<DrawerSide>("bottom");
  const [open, setOpen] = useState(false);

  const sides: DrawerSide[] = ["bottom", "right", "left", "top"];

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {sides.map((value) => (
          <Button
            key={value}
            appearance="tonal"
            variant="secondary"
            onClick={() => {
              setSide(value);
              setOpen(true);
            }}
          >
            {value}
          </Button>
        ))}
      </div>
      <Drawer
        open={open}
        onOpenChange={(next) => setOpen(next)}
        side={side}
      >
        <Drawer.Content>
          <Drawer.Header>Sheet</Drawer.Header>
          <Drawer.Description>
            A surface attached to the {side} edge of the viewport.
          </Drawer.Description>
          <Drawer.Footer>
            <Drawer.Close
              render={
                <Button appearance="text" variant="secondary">
                  Cancel
                </Button>
              }
            />
            <Drawer.Close render={<Button appearance="filled">Confirm</Button>} />
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </>
  );
}

function ToastSpecimen() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        appearance="tonal"
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "success",
            title: "Deployment finished",
            description: "The build is live.",
          })
        }
      >
        Success
      </Button>
      <Button
        appearance="tonal"
        variant="secondary"
        onClick={() =>
          toast.add({
            type: "warning",
            title: "Quota almost reached",
            description: "Eighty per cent of the monthly budget is used.",
          })
        }
      >
        Warning
      </Button>
      <Button
        appearance="tonal"
        variant="danger"
        onClick={() =>
          toast.add({
            type: "danger",
            title: "Upload failed",
            description: "The connection dropped before the file was sent.",
            actionProps: { children: "Retry", onClick: () => undefined },
          })
        }
      >
        Danger + action
      </Button>
      <Button
        appearance="tonal"
        variant="secondary"
        onClick={() =>
          void toast.promise(new Promise<void>((resolve) => setTimeout(resolve, 1600)), {
            loading: "Uploading assets",
            success: "Assets uploaded",
            error: "Upload failed",
          })
        }
      >
        Loading
      </Button>
    </div>
  );
}
