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
import ActionButton, { type ButtonSize } from "@/components/UI/ActionButton";
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
import {
  density,
  edge,
  elevation,
  focusRing,
  material,
  motion,
  shape,
  state,
  text,
  tone,
} from "@/components/UI/ui.common";
import { cn } from "@/libs/utils";

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
    <main className={cn("min-h-screen", material.canvas)}>
      <div className="mx-auto w-full max-w-[1320px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <Badge variant="primary">Sherick UI · development workbench</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Design system showcase</h1>
            <p className={cn("mt-3 max-w-2xl text-base leading-7", text.medium)}>
              One set of primitives — material, elevation, shape, edge, tone, state, density and motion — used by every component and comparable side by side below.
            </p>
          </div>
          <ThemePicker theme={theme} onChange={changeTheme} />
        </div>

        <div className="space-y-16">
          <section>
            <SectionHeading
              title="Design language"
              description="The primitives a new component chooses from. Every variant below is the same token the library itself applies, so what is compared here is what ships."
            />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen
                title="Material"
                description="A material is a fill, nothing else. Tone separates matte surfaces from the canvas, and acrylic is reserved for what floats above the page — no material carries a shadow or a rim."
              >
                <div className={cn("grid gap-4 p-5 sm:grid-cols-2", shape.control, material.canvas)}>
                  <Tile label="Canvas" note="The page itself" className={cn(material.canvas, "outline outline-1 outline-dashed outline-sherick-edge/[0.25]")}>canvas</Tile>
                  <Tile label="Matte quiet" note="Dense data regions and wells" className={material.matteQuiet}>matte quiet</Tile>
                  <Tile label="Matte" note="Cards and panels, flat on the canvas" className={material.matte}>matte</Tile>
                  <Tile label="Matte high" note="Nesting inside another matte surface" className={material.matteHigh}>matte high</Tile>
                  <Tile label="Matte control" note="The fill every text control shares" className={material.control}>matte control</Tile>
                  <Tile label="Matte control, invalid" note="The same fill, carrying danger tone" className={material.controlError}>invalid field</Tile>
                </div>
                <div className={cn("relative mt-4 overflow-hidden p-5 bg-sherick-canvas/[0.55]", shape.prominent)}>
                  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute -left-6 -top-4 h-24 w-36 rounded-full bg-sherick-primary/[0.30] blur-[28px]" />
                    <div className="absolute -bottom-2 right-2 h-20 w-28 rounded-full bg-sherick-accent/[0.22] blur-[26px]" />
                  </div>
                  <div className="relative grid gap-4 sm:grid-cols-3">
                    <Tile label="Acrylic" note="Menus and popups" className={material.acrylic}>acrylic</Tile>
                    <Tile label="Acrylic dense" note="Small floating surfaces" className={material.acrylicDense}>dense</Tile>
                    <Tile label="Acrylic modal" note="Dialogs, which carry more text" className={material.acrylicModal}>modal</Tile>
                  </div>
                </div>
              </Specimen>

              <Specimen
                title="Elevation"
                description="Flat matte by default. Depth is added by anatomy, never by the material: tactile on manipulated controls, recessed while pressed and for tracks, floating only for surfaces that genuinely sit above the page."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Tile label="Flat" note="Default — every passive matte surface" className={cn(material.matteHigh, elevation.flat)}>flat</Tile>
                  <Tile label="Raised" note="A manipulated control, resting" className={cn(material.matteHigh, elevation.raised)}>raised</Tile>
                  <Tile label="Control" note="A part the user moves: a thumb, a selected segment" className={cn(material.matteHigh, elevation.control)}>control</Tile>
                  <Tile label="Pressed" note="While pressed, and for tracks and grooves" className={cn(material.matteHigh, elevation.pressed)}>pressed</Tile>
                  <Tile label="Floating" note="Acrylic above the application" className={cn(material.matteHigh, elevation.floating)}>floating</Tile>
                  <div className="flex flex-col items-start justify-center gap-2 text-xs leading-5">
                    <span className={text.medium}>Light from above:</span>
                    <span className={text.high}>inset 0 1px 0 · highlight</span>
                    <span className={text.high}>0 Ypx · lower shadow</span>
                    <span className={text.high}>inset 0 -1px 0 · bounce</span>
                  </div>
                </div>
              </Specimen>

              <Specimen
                title="Shape"
                description="Six corner roles. Softness grows with size and emphasis, and nothing picks a radius of its own."
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Tile label="Control" note="Ordinary controls" className={cn(material.matteHigh, shape.control)}>1.25rem</Tile>
                  <Tile label="Prominent" note="Prominent controls" className={cn(material.matteHigh, shape.prominent)}>1.5rem</Tile>
                  <Tile label="Surface" note="Large surfaces" className={cn(material.matteHigh, shape.surface)}>1.75rem</Tile>
                  <Tile label="Expressive" note="Hero overlays" className={cn(material.matteHigh, shape.expressive)}>2.25rem</Tile>
                  <Tile label="Pill" note="Content-driven width" className={cn(tone.tonal.primary, shape.pill, text.high)}>pill</Tile>
                  <Tile label="Circle" note="Square targets" className={cn(tone.tonal.primary, shape.circle, text.high, "aspect-square w-24 self-center")}>circle</Tile>
                </div>
              </Specimen>

              <Specimen
                title="Structural lines"
                description="A 1px ring that traces a filled object is still a border, so matte controls carry none: they are separated by tone and by light. A hairline is reserved for where two parts of one surface actually meet."
              >
                <div className={cn("overflow-hidden", shape.control, material.matte)}>
                  <div className={cn("flex items-center justify-between px-4 py-3 text-sm font-medium", edge.header, text.medium)}>
                    <span>Component</span>
                    <span>Line</span>
                  </div>
                  <div className={cn("flex items-center justify-between px-4 py-3 text-sm", edge.row, text.high)}>
                    <span>Table rows</span>
                    <span className={text.low}>edge.row</span>
                  </div>
                  <div className={cn("flex items-center justify-between px-4 py-3 text-sm", edge.row, text.high)}>
                    <span>Column header</span>
                    <span className={text.low}>edge.header</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className={text.high}>Rules and dividers</span>
                    <span className={text.low}>edge.rule</span>
                  </div>
                </div>
                <div className={cn("mt-4 border-t pt-4", edge.rule)}>
                  <p className={cn("text-xs leading-5", text.medium)}>
                    One tone serves every line, so table rows, dividers, code sections and quotes agree. Fields add no line at all: their state is tonality.
                  </p>
                </div>
              </Specimen>

              <Specimen
                title="Tonality"
                description="Canvas and surface levels, the three-step text hierarchy, accent hierarchy and semantic states — every color a component is allowed to use."
              >
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
                    <p className={cn("text-sm", text.high)}>High emphasis — labels and values</p>
                    <p className={cn("text-sm", text.medium)}>Medium emphasis — supporting copy</p>
                    <p className={cn("text-sm", text.low)}>Low emphasis — gutters and hints</p>
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

              <Specimen
                title="Interaction states"
                description="One language: tonality carries hover, a recess carries pressed, a tone carries selection, opacity carries disabled, and one ring carries focus. Depth is never added just to show a state."
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <StateTile label="Rest" className={cn(material.control, text.high)}>Rest</StateTile>
                  <StateTile label="Hover" className={cn(material.control, "bg-sherick-surface-high/[0.82]", text.high)}>Hover</StateTile>
                  <StateTile label="Pressed" className={cn(material.control, "bg-sherick-surface-high/[0.9]", elevation.pressed, text.high)}>Pressed</StateTile>
                  <StateTile label="Selected" className={cn(shape.control, tone.selected.primary)}>Selected</StateTile>
                  <StateTile label="Disabled" className={cn(material.control, state.disabled)}>Disabled</StateTile>
                  <StateTile label="Focus-visible" className={cn(material.control, text.high, "outline outline-2 outline-sherick-focus outline-offset-[3px]")}>Focus</StateTile>
                </div>
                <p className={cn("mt-4 text-xs leading-5", text.medium)}>
                  Selected is a tone, not a depth: a segment inside a groove is raised, a row in a list stays flat. The static tiles above show hover, pressed and focus applied for comparison; use any real control below to see the press and release timings.
                </p>
              </Specimen>

              <Specimen
                title="Density"
                description="Density owns height and the type step, so controls of one density share a rhythm. Anatomy owns padding: a button is gripped at its ends, a field holds text, and neither derives from the other."
              >
                <div className="space-y-5">
                  <DensityRow label="Compact" role={density.compact} buttonPadding="px-4 py-2" size="sm" />
                  <DensityRow label="Normal" role={density.normal} buttonPadding="px-6 py-3" size="md" />
                  <DensityRow label="Prominent" role={density.prominent} buttonPadding="px-8 py-4" size="lg" />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={cn("w-24 shrink-0 text-xs font-medium", text.medium)}>Anatomy</span>
                    <span className={cn(density.normal, shape.control, material.control, text.high, "inline-flex min-h-12 items-center gap-2 px-6 py-3")}>Button</span>
                    <span className={cn(density.normal, shape.control, material.control, text.high, "inline-flex min-h-12 items-center gap-2 px-5 py-3")}>Field</span>
                    <span className={cn("text-xs", text.medium)}>One density, two paddings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("w-24 shrink-0 text-xs font-medium", text.medium)}>Target</span>
                    <span className={cn(density.target, shape.circle, material.matteHigh, "inline-flex items-center justify-center")}>
                      <Heart className="size-5" aria-hidden="true" />
                    </span>
                    <span className={cn("text-xs", text.medium)}>{density.target} — the hit target floor for icon-only controls</span>
                  </div>
                </div>
              </Specimen>

              <Specimen
                title="Motion"
                description="Three families, no exceptions. Each is a token pair of duration and easing, and each collapses under prefers-reduced-motion."
              >
                <div className="space-y-3">
                  <MotionRow label="Press" note="A tonality change with no travel: hover, focus, an engaged field" tokens="--sui-duration-press · --sui-ease-press" />
                  <MotionRow label="Release" note="A tactile control: press timing while held, release timing as it settles, and the travel of a thumb or segment" tokens="--sui-duration-release · --sui-ease-release" />
                  <MotionRow label="Overlay" note="Entrance and exit for anything that floats, at its own geometry but one timing" tokens="--sui-duration-overlay · --sui-duration-overlay-exit" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled">Press me</ActionButton>
                  <Tooltip content="Overlay entrance, exit and scrim from one family">
                    <ActionButton appearance="tonal" variant="secondary">Hover for an overlay</ActionButton>
                  </Tooltip>
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Buttons" description="Appearance, size and state are separate parts of the API." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Appearances" description="Filled for priority, tonal for normal actions, text for quiet actions. Only tonal controls carry a raised matte step, and pressing one recesses it.">
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

              <Specimen title="Sizes" description="Scale is density: the same three steps every other control uses.">
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton appearance="filled" size="sm">Small</ActionButton>
                  <ActionButton appearance="filled" size="md">Medium</ActionButton>
                  <ActionButton appearance="filled" size="lg">Large</ActionButton>
                </div>
              </Specimen>

              <Specimen title="Icon buttons" description="Tonal, ghost and acrylic treatments share one hit target and one state language.">
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

              <Specimen title="Dropdown" description="Matte trigger that holds the engaged step while open, acrylic listbox, clear selection.">
                <div className="space-y-4">
                  <Dropdown options={selectOptions} selected={selection} onSelect={setSelection} aria-label="Project type" className="w-full" />
                  <Dropdown options={selectOptions} disabled aria-label="Disabled project type" className="w-full" />
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Selection & navigation" description="A selection is a matte control resting in a groove: the track recedes, the thumb stays raised." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Switch" description="Large hit target, compact visual track.">
                <div className="flex flex-wrap items-center gap-6">
                  <StateLabel label="On"><Switch checked={switchOn} onChange={setSwitchOn} /></StateLabel>
                  <StateLabel label="Off"><Switch checked={false} onChange={() => undefined} /></StateLabel>
                  <StateLabel label="Disabled"><Switch checked disabled /></StateLabel>
                </div>
              </Specimen>

              <Specimen title="Tabs" description="The same groove and thumb at a wider scale.">
                <TabGroup tabs={[
                  { id: "one", label: "Overview", content: <p className={cn("text-sm", text.medium)}>Overview content</p> },
                  { id: "two", label: "Motion", content: <p className={cn("text-sm", text.medium)}>Motion content</p> },
                  { id: "three", label: "Density", content: <p className={cn("text-sm", text.medium)}>Density content</p> },
                ]} />
              </Specimen>

              <Specimen title="Navigation groups" description="The current destination holds the selected tone and the accent foreground; a row in a list stays flat.">
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
            <SectionHeading title="Feedback" description="Semantic color marks meaning on the surface and the icon; the copy stays at full emphasis." />
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
                  <div className={cn("flex items-center gap-4", text.medium)}><Spinner size="small" /><Spinner size="medium" /><Spinner size="large" /></div>
                  <div className="space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-20 w-full" /></div>
                </div>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Surfaces & overlays" description="Cards stay matte; only what floats above the page uses acrylic." />
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <Specimen title="Cards & badges" description="Passive content surfaces and compact semantic labels.">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card variant="secondary"><div className="font-medium">Neutral card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Normal information stays matte and grounded.</p></Card>
                  <Card variant="primary"><div className="font-medium">Tonal card</div><p className={cn("mt-2 text-sm leading-6", text.medium)}>Use stronger tone only when it adds meaning.</p></Card>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success" icon={<Check className="size-3.5" />}>Ready</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="secondary">Neutral</Badge>
                </div>
              </Specimen>

              <Specimen title="Avatar & tooltip" description="Compact identity, and the denser acrylic recipe for small floating surfaces.">
                <div className="flex items-center gap-5">
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example avatar" size="sm" />
                  <Avatar src="https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg" alt="Example rounded avatar" size="md" shape="rounded" />
                  <Tooltip content="Acrylic tooltip: same entrance and exit family as every overlay"><ActionButton appearance="tonal" variant="secondary">Hover or focus</ActionButton></Tooltip>
                </div>
              </Specimen>

              <Specimen title="Modal" description="Highest elevation: acrylic, expressive shape, entrance and exit from the overlay family.">
                <ActionButton appearance="tonal" variant="secondary" onClick={() => setModalOpen(true)}>Open modal</ActionButton>
              </Specimen>
            </div>
          </section>

          <section>
            <SectionHeading title="Data display" description="Dense information stays quiet, compact and easy to scan." />
            <Specimen title="Table" description="One hairline tone for every line; semantic color belongs inside cells, not across the whole table." className="mt-6">
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
              <Specimen title="Code block" description="A quiet contained well: matte and recessed, with its actions outside the code flow.">
                <CodeBlock language="tsx">{'<ActionButton appearance="filled">Save</ActionButton>'}</CodeBlock>
              </Specimen>
              <Specimen title="Markdown" description="Headings, links, lists, quotes and inline code share a readable rhythm.">
                <Markdown>{`## Example\nSherick UI keeps **dense information quiet** and gives floating UI more depth.\n\n- Predictable controls\n- Soft hierarchy\n- [Accessible interactions](#)\n\n> Expression should clarify hierarchy, not decorate every surface.\n\nUse \`ActionButton\` for primary actions, and reach for a fenced block when the code carries its own hierarchy:\n\n\`\`\`ts\nconst surface = material.matteRaised;\nconst action = shape.pill;\n\`\`\``}</Markdown>
              </Specimen>
            </div>
          </section>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>Modal specimen</Modal.Header>
        <Modal.Content>
          This is the highest elevation layer in the system: focused, translucent and deliberately separated from the page beneath it. It leaves through the same overlay family it arrived on.
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
      <div className={cn("mb-2 text-xs font-medium", text.medium)}>Theme</div>
      <div className={cn("inline-flex bg-sherick-surface/[0.72] p-1", shape.pill, elevation.pressed)}>
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

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className={cn("border-b pb-5", edge.rule)}>
      <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{title}</h2>
      <p className={cn("mt-2 text-base leading-7", text.medium)}>{description}</p>
    </div>
  );
}

function Specimen({ title, description, children, className = "" }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(shape.surface, material.matte, "p-6", className)}>
      <div className="mb-5">
        <h3 className="font-medium tracking-[-0.01em]">{title}</h3>
        <p className={cn("mt-1 text-sm leading-6", text.medium)}>{description}</p>
      </div>
      {children}
    </div>
  );
}

function Tile({ label, note, className, children }: { label: string; note: string; className?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex min-h-20 items-center justify-center px-4 py-5 text-sm", shape.control, className)}>{children}</div>
      <div>
        <div className={cn("text-xs font-medium", text.high)}>{label}</div>
        <div className={cn("mt-0.5 text-xs leading-5", text.medium)}>{note}</div>
      </div>
    </div>
  );
}

function StateTile({ label, className, children }: { label: string; className: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("flex min-h-16 w-full items-center justify-center px-4 py-3 text-sm", shape.control, className)}>{children}</div>
      <span className={cn("text-xs font-medium", text.medium)}>{label}</span>
    </div>
  );
}

function DensityRow({ label, role, buttonPadding, size }: { label: string; role: string; buttonPadding: string; size: ButtonSize }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={cn("w-24 shrink-0 text-xs font-medium", text.medium)}>{label}</span>
      <ActionButton appearance="tonal" variant="secondary" size={size}>{label}</ActionButton>
      <span className={cn("font-mono text-[11px]", text.low)}>{role}</span>
      <span className={cn("font-mono text-[11px]", text.low)}>{buttonPadding}</span>
    </div>
  );
}

function MotionRow({ label, note, tokens }: { label: string; note: string; tokens: string }) {
  return (
    <div className={cn("flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4", shape.control, material.matteHigh)}>
      <span className={cn("w-20 shrink-0 text-sm font-medium", text.high)}>{label}</span>
      <span className={cn("flex-1 text-xs leading-5", text.medium)}>{note}</span>
      <span className={cn("font-mono text-[11px]", text.low)}>{tokens}</span>
    </div>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return <div><div className={cn("h-14", shape.control, className)} /><div className={cn("mt-2 text-xs", text.medium)}>{label}</div></div>;
}

function StateLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><div>{children}</div><span className={cn("text-sm", text.medium)}>{label}</span></div>;
}
