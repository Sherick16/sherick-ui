# Navigation and overlays

Use this reference for the exports that place the reader somewhere or open a surface over the
page: `Breadcrumb`, `NavGroup`, `NavItem`, `Pagination`, `Stepper`, `TreeView`, `Tabs`,
`Accordion`, `Collapsible`, `Dialog`, `AlertDialog`, `Drawer`, `Menu`, `Popover` and `Tooltip`.
It owns their props, defaults, states and component-specific caveats. Cross-component rules live
in [composition](../composition.md), [accessibility](../accessibility.md),
[design language](../design-language.md) and [theming](../theming.md).

Release availability: `NavGroup`, `NavItem`, `Tabs`, `Accordion`, `Collapsible`, `Dialog`,
`AlertDialog`, `Drawer`, `Menu`, `Popover` and `Tooltip` are part of the stable `2.0.0` root
export. `Breadcrumb`, `Pagination`, `Stepper` and `TreeView` are **unreleased v2.1 additions** —
the import path is the same `sherick-ui`, but they are not in a published release, so confirm each
exists in the installed package before using it.

```tsx
import {
  Accordion, AlertDialog, Breadcrumb, Collapsible, Dialog, Drawer, Menu, NavGroup, NavItem,
  Pagination, Popover, Stepper, Tabs, Tooltip, TreeView,
  type AccordionHeadingLevel, type AccordionItemProps, type AccordionPanelProps, type AccordionProps,
  type AccordionTriggerProps, type AlertDialogProps, type BreadcrumbItem, type BreadcrumbProps,
  type CollapsiblePanelProps, type CollapsibleProps, type CollapsibleTriggerProps, type DialogContentProps,
  type DialogDescriptionProps, type DialogFooterProps, type DialogHeaderProps, type DialogProps,
  type DrawerContentProps, type DrawerDescriptionProps, type DrawerFooterProps, type DrawerHeaderProps,
  type DrawerProps, type DrawerSide, type DrawerTriggerProps, type MenuContentProps, type MenuItemProps,
  type MenuProps, type MenuSeparatorProps, type MenuTriggerProps, type NavGroupHeadingLevel,
  type NavGroupItem, type NavGroupProps, type NavItemProps, type OverlayAlign, type OverlaySide,
  type PaginationProps, type PopoverContentProps, type PopoverProps, type PopoverTriggerProps,
  type StepperItem, type StepperProps, type Tab, type TabsProps, type TooltipProps,
  type TreeViewItem, type TreeViewProps,
} from "sherick-ui";
```

`Dialog.Header`, `.Description`, `.Content` and `.Footer` are the dialog's compound
parts; the corresponding exported `DialogHeaderProps`, `DialogDescriptionProps`,
`DialogContentProps` and `DialogFooterProps` describe only those parts' children/props.
`OverlaySide` (`top | bottom | left | right | inline-start | inline-end`) and
`OverlayAlign` (`start | center | end`) are shared exported value types for the overlay
components that expose placement. Use only the placement props documented for that
component; these types do not imply every overlay accepts every placement.

## Pick by what the surface is for

The choice is semantic, not stylistic. The base rule from
[composition](../composition.md#group-by-purpose-not-by-wrappers) is: a destination is
navigation, a command performs an action, and a choice holds a value.

| Need | Use | Why not the neighbour |
| --- | --- | --- |
| A column of destinations | `NavGroup` + `NavItem` | `Tabs` selects a panel in place; it is not route navigation |
| The trail of places the reader came through | `Breadcrumb` | It is passive: links and text, no state, no selection |
| Move through a known page set | `Pagination` | It only renders the control; it never fetches or scrolls the page |
| Show where a workflow is, and optionally jump | `Stepper` | `Progress` reports one percentage; a stepper names discrete stages |
| Browse and choose inside a hierarchy | `TreeView` | `NavGroup` is a flat, icon-less list of links |
| Swap the region under a row of labels | `Tabs` | `SegmentedControl` holds one value and owns no panel |
| Several sections of one explanation | `Accordion` | A group: one open at a time by default, headings, dividers |
| One region that expands where it sits | `Collapsible` | No group, no dividers, no shared state |
| A task the reader must complete or abandon | `Dialog` | `Popover` is dismissible ambient content, not a task |
| One destructive question with two answers | `AlertDialog` | It is always modal, has no dismissal control and cannot be clicked away |
| A task attached to an edge of the viewport | `Drawer` | Same modal mechanics as `Dialog`; only placement and arrival differ |
| A list of commands | `Menu` | Choosing closes it and runs an action; it holds no value |
| Free-form interactive content anchored to a control | `Popover` | Stays open while used; does not trap focus |
| A short non-interactive hint | `Tooltip` | Cannot hold anything focusable, and is not an accessible name |

## Conventions that hold across the overlays

- **Base UI owns the mechanics, this package owns the surface.** Portals, anchoring, collision
  handling, focus trapping and restoration, Escape, outside dismissal, document scroll locking
  and mount/unmount lifecycle are the primitive's, and Sherick UI publishes only the parts and
  props it declares. There is no `asChild`, no arbitrary Base prop pass-through, and no second
  wrapper to import. Do not add your own focus trap, Escape listener, exit timer or portal
  reparenting around one.
- **Trigger parts take Base's `render` element.** `Drawer.Trigger`, `Menu.Trigger` and
  `Popover.Trigger` hand the trigger's own props to whatever you render — usually a Sherick
  `Button` through `render={<Button …/>}` — so the control that opens the surface looks like the
  control it is. `Dialog` has no trigger part at all (see below).
- **Open state is one convention:** `open` / `defaultOpen` / `onOpenChange(nextOpen, eventDetails)`.
  Omitting `open` leaves the surface uncontrolled; passing it makes it controlled, and it then
  moves only when you write the value back. `eventDetails.reason` tells you *why* it changed
  (`"escape-key"`, `"outside-press"`, `"trigger-press"`, …), which is what distinguishes a
  keyboard dismissal from an action press.
- **Nothing here submits a form value.** `Tabs`, `Accordion`, `Collapsible`, `Pagination`,
  `Stepper`, `TreeView` and the overlays report through callbacks and render no hidden input, so
  there is no `name`/submission contract to reach for — keep the state in application state. A
  `Button` inside one of these still defaults to `type="button"`; a dialog that really is a form
  needs a `<form>` around its content and an explicit `type="submit"` on the action.
- **Client boundaries.** Everything here except `Breadcrumb`, `NavGroup` and `NavItem` is a client
  component (`"use client"`), so it must be rendered from a client boundary; the three navigation
  exports above it render in a server component.
- **One stacking level.** Every floating surface shares the package's floating layer, so a surface
  opened from inside another paints above it. Never rank them with application `z-index` or
  `!important`; test a nested surface in its real parent instead of in isolation.
- **Portaled surfaces establish their own style scope.** Set `className` on the popup part to
  restyle the shell; do not target private classes, `data-sui-*` attributes or the portal.
- **Refs are the exception.** `Dialog`, `AlertDialog` (popup `<div>`), `Breadcrumb`, `Pagination`,
  `Stepper` (`<nav>`) and `TreeView` (root `<div>`) forward one. `NavItem`, `NavGroup`, `Tabs`,
  `Accordion`, `Collapsible`, `Drawer`, `Menu`, `Popover` and `Tooltip` accept no `ref`.

## Navigation

### `NavItem`

A destination in a navigation list: one flat row, a real `<a>`.

```tsx
<NavItem href="/projects" icon={<Folder />} active>Projects</NavItem>
```

- `href` and `children` are required; `icon?` occupies one 20px, `aria-hidden` slot (a direct
  `svg` is normalized to 20px); `active?` (default `false`) publishes `aria-current="page"` and
  adds the quietest primary tint plus medium weight. Colour is never the only carrier.
- It extends `AnchorHTMLAttributes`, so `onClick`, `target`, `rel`, `aria-*` and the rest land on
  the anchor. There is no `ref`. Nothing here detects the current route — you pass `active`.
- The row is `max-w-xs` single-line with truncation: a long label is clipped, not wrapped. Keep
  destination labels short, and let the surrounding column own the width.
- It is a row, not a control the size of a field: density owns its height, depth never says
  "current", and the current step is deliberately quieter than an opaque accent fill (that fill
  belongs to the one primary *action* in a view).

### `NavGroup`

A titled group of destinations — structure inside the surface it sits on, not a surface.

```tsx
<NavGroup
  title="Foundations"
  headingLevel={2}
  activeHref="/design-language"
  items={[
    { label: "Design language", href: "/design-language" },
    { label: "Colour", href: "/colour" },
  ]}
/>
```

- `title: string` and `items: { label: string; href: string }[]` are required; `activeHref?` marks
  the one item whose `href` matches; `headingLevel?` defaults to `3`; `className?` styles the
  group's own column. No `ref`.
- The title is a real heading (`h1`–`h6`), not a badge: choose the level from the document the
  group lands in. The group itself brings no fill, elevation or rim, so a navigation column reads
  as one region — do not wrap each group in a `Card`.
- Items are plain strings, rendered as `NavItem`s keyed by `href` (so hrefs must be unique in a
  group). There is no icon, no per-item `disabled` and no render escape hatch: for those, compose
  `NavItem` yourself.

### `Breadcrumb` (unreleased v2.1)

The trail of places a reader came through. Passive: links and text, no state, no effect and no
client directive, so a server component renders it.

```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Library", href: "/library" },
    { label: "Pagination" },
  ]}
/>
```

- `items: { label: ReactNode; href?: string }[]` is required; `renderLink?(item, props)` replaces
  the intermediate anchor (the escape hatch for a router link); the rest of the props are native
  `<nav>` attributes, with `aria-label` defaulting to `"Breadcrumb"`. The ref is the `<nav>`.
- **The last item is the page the reader is on**: it renders as text with `aria-current="page"`
  even when the caller supplies an `href`. Every intermediate destination is a real anchor, so
  ordinary clicks, modified clicks and every browser affordance work with no router required.
- `renderLink` **must spread the props it is handed** (destination, shared classes, content) onto
  its element, or the link loses its href, its treatment and its focus ring.
- The trail is a native ordered list; separators are decorative, `aria-hidden` chevrons that
  mirror with the writing direction.
- Long labels wrap (`overflow-wrap: anywhere`) and the row wraps; nothing collapses, truncates or
  hides a place behind an overflow menu. That is deliberate — which places are behind the reader
  is information — so plan the column for a long trail.
- Items are keyed by position.

### `Pagination` (unreleased v2.1)

A bounded set of numbered destinations over one native ordered list. It renders the control only.

```tsx
<Pagination count={12} value={page} onValueChange={setPage} getPageHref={(page) => `/list?page=${page}`} />
```

- `count: number` is required and `0` is a valid, empty pagination (no current page, no
  activation). `value?` / `defaultValue?` (default `1`) are 1-based; `onValueChange?(page)`
  reports the page an ordinary activation asked for. `siblingCount?` defaults to `1` and is capped
  at `5`; `disabled?`, `getPageHref?(page)`, `getPageLabel?(page)` (default `Page {page}`),
  `previousLabel?` (`"Previous page"`) and `nextLabel?` (`"Next page"`) complete the surface.
  Native `<nav>` attributes pass through except `children`/`defaultValue`/`onChange`; `aria-label`
  defaults to `"Pagination"`; the ref is the `<nav>`.
- Numbers normalize: a finite count is floored, an unusable one falls back to `0`/`1`, and a
  controlled page outside the range is shown clamped rather than rewritten — the component never
  corrects your state.
- The rendered set is bounded: both ends are always present, the current page keeps its siblings,
  a page missing by a single step is named rather than replaced, and anything larger becomes one
  non-interactive, `aria-hidden` ellipsis per gap. Ten thousand pages render about as many
  controls as ten.
- With `getPageHref`, the numbered pages and the eligible arrows are real anchors: an ordinary
  activation reports the page and *then* lets the browser navigate (no `preventDefault`, so the
  consumer's router still sees the click), while a modified click is the browser's own gesture and
  is not reported. A boundary control and a disabled pagination are never anchors.
- Exactly one control carries `aria-current="page"`; in a disabled pagination every control is a
  natively disabled button.
- Narrow containers are the interesting case: below a 32rem container the numbered controls are
  hidden except the current page and the total appears as `of N`, leaving previous,
  current and next reachable side by side without a scrolling strip. Targets stay ≥44px.
- It does not fetch data, does not know what a page holds and does not scroll the page.

### `Stepper` (unreleased v2.1)

A discrete progress track that names the workflow's stages and can be operated.

```tsx
const [step, setStep] = useState<string | null>("shipping");

<Stepper
  aria-label="Checkout progress"
  items={[
    { value: "cart", label: "Cart", complete: true },
    { value: "shipping", label: "Shipping", description: "Courier and delivery window" },
    { value: "payment", label: "Payment", disabled: true },
  ]}
  value={step}
  onValueChange={setStep}
/>
```

- `value: string | null` is **required and always controlled** — the consumer owns the workflow —
  and `null` means the workflow has not started, not its first step. `onValueChange?(value)` is
  what makes the list interactive; without it every step is informative text and no focusable
  fake control is rendered.
- `items: { value; label: ReactNode; description?: ReactNode; complete?: boolean; disabled? }[]`
  is required. `orientation?` defaults to `"horizontal"`, `disabled?` to `false`; native `<nav>`
  attributes pass through except `children`/`defaultValue`/`onChange`; `aria-label` defaults to
  `"Progress steps"`; the ref is the `<nav>`.
- States state themselves beyond colour: `complete` renders a check mark with an `sr-only`
  "Complete", the current step takes `aria-current="step"` and the stronger label emphasis, and
  when a step is both current and marked complete the current state wins.
- Disabling is list-scoped first: `item.disabled` and the list's `disabled` are honoured only when
  the stepper is interactive. A non-interactive stepper ignores `disabled` (there is nothing to
  disable) and a disabled interactive list disables every step at once.
- A step the workflow has not reached is still ordinary content — a step's own state is never
  inferred from an earlier step's `complete`.
- Layout is driven by container width: a vertical column in a narrow container, a single row from
  a 32rem container (64rem when there are more than four steps). DOM order and the controls never
  change with the arrangement, so nothing is reordered or duplicated by resizing.

### `TreeView` (unreleased v2.1)

A finite static tree the user browses, expands and chooses from.

```tsx
<TreeView
  label="Project files"
  items={items}
  defaultValue="src/Button.tsx"
  defaultExpandedValues={["src", "src/components"]}
  onValueChange={select}
  onExpandedValuesChange={setExpanded}
/>
```

- `items: TreeViewItem[]` and `label: string` (the tree's accessible name) are required.
  `TreeViewItem = { value: string; label: string; icon?: ReactNode; disabled?: boolean;
  children?: TreeViewItem[] }`, and `value` is unique across the whole tree.
- `value?` / `defaultValue?` (`string | null`) and `onValueChange?(value)` own the **selection**;
  `expandedValues?` / `defaultExpandedValues?` and `onExpandedValuesChange?(values)` own the
  **expansion**. `disabled?` disables the tree; `renderItem?(item)` replaces a row's label
  content; the remaining props are `<div>` attributes and the ref is the root `<div>`.
- Base UI ships no tree primitive, so this component owns the APG mechanics itself: one roving tab
  stop (which starts on the selected node), `role="tree"`/`treeitem`/`group`, arrow navigation
  over the visible order, `Home`/`End`, typeahead over visible labels, and `aria-expanded` on
  branches only.
- **Focus and selection are two facts.** Arrows and typeahead move the keyboard and never choose;
  `Enter` and `Space` choose and never move; a pointer press on a row chooses; the branch's
  chevron region toggles without choosing. Selection is `string | null`, so `null` is your
  "nothing selected" state.
- A controlled tree reports the expansion it would like and never applies it: if you do not write
  `expandedValues` back, the request is simply refused and the keyboard stays where it was.
- **A disabled node is local.** It stays visible, focusable and announced as unavailable, its
  already-visible children remain their own nodes, and it cannot be chosen or opened. A disabled
  *tree* dims once at the root and refuses everything.
- **The tree repairs its own focus, and only its own.** If the focused node leaves — removed by
  you, or hidden by a branch you collapsed — and the tree already had focus, the keyboard moves to
  the nearest visible ancestor; if focus was elsewhere on the page, nothing is taken. Do not add
  focus management around controlled data changes.
- Deep nesting indents to a cap so labels keep their room, while the real nesting (and therefore
  what assistive technology reads as one level deeper) is untouched. A logical forward direction
  mirrors with the page.
- `renderItem` fills the label region beside the icon — labelled content, not a control: the row
  is the control and `label` remains the accessible name, so no buttons inside it.

## In-place disclosure

### `Accordion`

One group of sections whose triggers are headings.

```tsx
<Accordion defaultValue={["plan"]} headingLevel={2}>
  <Accordion.Item value="plan">
    <Accordion.Trigger>What is included in the workspace plan?</Accordion.Trigger>
    <Accordion.Panel>Unlimited projects, shared components and the full theme.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

- Root: `multiple?` defaults to `false`, so opening a section closes the one before it — use a
  single-open group when the sections answer one question. `value?` / `defaultValue?` are
  **arrays** of the open items' values, `onValueChange` is Base's callback with event details,
  `disabled?` makes the whole group inert, `headingLevel?` defaults to `3`, and `className?` adds
  to the group's own column.
- Parts: `Accordion.Item` (`value?`, `disabled?`, `className?`), `Accordion.Trigger`,
  `Accordion.Panel`. A panel belongs to exactly one item.
- The accessible structure is the component's, not yours: the trigger is a `<button>` inside a
  heading (`aria-expanded`/`aria-controls`) and the panel is the region it names. Never rebuild
  that by hand, and never put an interactive control inside a trigger row.
- The join between sections is the group's: a `Divider weight="row"` is inserted between the
  root's direct children. Pass the items as direct children — a fragment or an extra wrapper
  around them changes where the lines land — and note that the line yields to a hovered section
  rather than sitting under the pointer.
- A controlled accordion addresses items by `value`; an item with no `value` can still be opened,
  but nothing outside can address it. `headingLevel` fixes the level of every trigger in that
  accordion; it is a prop rather than something inferred from the document.

### `Collapsible`

The same disclosure at the scope of one region.

```tsx
<Collapsible defaultOpen>
  <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
  <Collapsible.Panel>Send a copy of every deployment to the workspace owners.</Collapsible.Panel>
</Collapsible>
```

- `open?` / `defaultOpen?` / `onOpenChange?` (Base's signature), `disabled?`, `className?`, and the
  two parts `Collapsible.Trigger` / `Collapsible.Panel`. Base owns the expanded state and the
  trigger's `aria-expanded`/`aria-controls`; the row, the clipping and the height motion are the
  shared disclosure recipe, which is why an accordion row and a collapsible row are one object at
  two scopes.
- Use `Collapsible` for a single region and `Accordion` when several sections belong to one group
  (it supplies the headings, the shared state and the dividers).

### `Tabs`

A row of labels with one panel beneath it, swapped in place.

```tsx
<Tabs
  ariaLabel="Project sections"
  value={tab}
  onValueChange={setTab}
  tabs={[
    { id: "overview", label: "Overview", content: <Overview /> },
    { id: "members", label: "Members", content: <Members />, disabled: true },
  ]}
/>
```

- `tabs: { id: string; label: string; content: ReactNode; disabled? }[]` is required; `value?` /
  `defaultValue?` are a tab `id`; `onValueChange?(tabId, eventDetails)` is Base's callback;
  `variant?` (default `"primary"`) names the tone the moving indicator takes; `ariaLabel?`
  defaults to `"Tabs"`; `className?` adds to the root. No `ref`. An empty `tabs` array renders
  nothing.
- Uncontrolled, it starts on the first non-disabled tab (or the first tab when all are disabled).
  A disabled tab cannot be activated or selected.
- Base owns the tablist/tab/tabpanel roles, the roving tab stop, the arrow/`Home`/`End` keys and
  `aria-selected`; Sherick owns the track and the indicator that relocates to the active tab. The
  tab row scrolls horizontally inside itself so a narrow column never widens the page.
- **Inactive panels are unmounted**, so local state inside a tab's content does not survive a
  switch. Lift anything that must persist above `Tabs`.
- Naming is `ariaLabel`, not `aria-label`: `TabsProps` accepts no HTML attributes, so an
  `aria-label` on the root is silently lost and does not compile.
- Tab ids identify both the tab and its panel — keep them unique and stable across renders.
- Tabs swap a region in place; for page navigation use links (`NavItem`), and for a single-choice
  value with no panel use `SegmentedControl`.

## Viewport-owning surfaces

All three share one modal surface: the same portal, scrim, viewport, focus trap and restoration,
document scroll lock, Escape handling and mount/unmount lifecycle. Only attachment, corners and
arrival direction differ.

### `Dialog`

```tsx
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open dialog</Button>

<Dialog open={open} onOpenChange={setOpen}>
  <Dialog.Header>Rename project</Dialog.Header>
  <Dialog.Description>Renaming keeps every deployment URL unchanged.</Dialog.Description>
  <Dialog.Content>
    <Input label="Project name" />
  </Dialog.Content>
  <Dialog.Footer>
    <Button appearance="text" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
    <Button appearance="filled" onClick={save}>Save</Button>
  </Dialog.Footer>
</Dialog>
```

- `open?` / `defaultOpen?` / `onOpenChange?`, `children`, `className?` (the popup shell). The ref
  is the popup `<div>`. Parts: `Dialog.Header` (renders Base's title, which is the dialog's
  **accessible name**), `Dialog.Description` (the accessible description), `Dialog.Content` (the
  padded body) and `Dialog.Footer`.
- **There is no `Dialog.Trigger`.** Open it from your own control and control the state, as above;
  `Drawer` is the surface that ships a trigger. This is the single asymmetry between them.
- Initial focus is the dialog surface itself, not the first control inside it — a dialog's content
  is read before it is acted on — so a stray `Enter` cannot press whatever happens to be first.
- The dialog renders its own dismissal control, whose accessible name is the fixed English
  `"Close dialog"` and is not localizable through props. There is no prop to remove it.
- Escape and an outside press dismiss by default; `onOpenChange` receives Base's
  `(nextOpen, eventDetails)`, so `eventDetails.reason` is how you tell a keyboard dismissal from an
  action.
- A dialog taller than the viewport scrolls inside itself; keep a reachable scroll origin instead
  of clipping or fixing its height.
- Child surfaces inside a dialog dismiss in their own order: Escape closes the inner `Select`,
  `Menu`, `Popover` or `Tooltip` first and only the next Escape closes the dialog. Do not add a key
  handler of your own for that.
- Give it one `Dialog.Header`, or the dialog has no accessible name; give it a description when
  the title alone does not explain the consequence.

### `AlertDialog`

One question, one answer.

```tsx
<AlertDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete project?"
  description="Every deployment of this project will be removed. This action cannot be undone."
  confirmLabel="Delete project"
  cancelLabel="Keep project"
  onConfirm={remove}
  onCancel={trackCancelled}
/>
```

- `title` (required — the surface's accessible name), `description?`, `confirmLabel` (required),
  `cancelLabel?` (`"Cancel"`), `onConfirm?`, `onCancel?`, `confirmVariant?` (default `"danger"`),
  `className?`, and `open?` / `defaultOpen?` / `onOpenChange?`. The ref is the popup `<div>`.
- No compound parts and no trigger: it renders its own header, description and two actions. **It
  has no dismissal control either** — the two answers are the only ways out.
- It is always modal and an outside press never dismisses it. Escape does, and Escape is treated as
  a cancellation: `onCancel` runs for the cancel action and for a keyboard dismissal alike, so one
  decision is reported once. `onConfirm` runs before the surface closes.
- Focus starts on the first tabbable element, which is the cancel action (the DOM order is cancel
  then confirm), so a stray `Enter` cannot destroy anything.
- Only the confirm action carries a semantic tone; the surface itself never does.

### `Drawer`

A surface attached to one edge of the viewport — a bottom sheet, a side panel, a top drawer.

```tsx
const [side, setSide] = useState<DrawerSide>("right");
const [open, setOpen] = useState(false);

<Drawer open={open} onOpenChange={setOpen} side={side}>
  <Drawer.Trigger render={<Button appearance="filled">Open</Button>} />
  <Drawer.Content>
    <Drawer.Header>Filters</Drawer.Header>
    <Drawer.Description>Applied to the current result set.</Drawer.Description>
    <Drawer.Footer>
      <Drawer.Close render={<Button appearance="text" variant="secondary">Cancel</Button>} />
      <Drawer.Close render={<Button appearance="filled">Apply</Button>} />
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>
```

- `open?` / `defaultOpen?` / `onOpenChange?`, `side?` (default `"bottom"`). Parts:
  `Drawer.Trigger` (`render` element, `children`, `className`), `Drawer.Content`, `Drawer.Header`,
  `Drawer.Description`, `Drawer.Footer` and `Drawer.Close`. No `ref`.
- **The sides are physical, not logical.** `"bottom" | "top" | "left" | "right"` place the sheet
  against that edge of the screen and do not mirror in a right-to-left page; a direction-aware
  placement is your own `dir`-aware choice. (Anchored overlays do accept logical sides: see
  `Popover.Content`/`Menu.Content` below.)
- It is a `Dialog` with an edge, not a second modal system: the same root, scrim, portal, focus
  trap and restoration, Escape, outside-press dismissal and page scroll lock. The attached edge is
  square, the exposed corners take the sheet's own radius step, and the surface arrives along its
  own axis only.
- Unlike `Dialog`, it ships a trigger: `Drawer.Trigger` hands Base's trigger props to whatever you
  render, so the opener looks like the control it is.
- The body scrolls inside the sheet while the header and footer stay on the surface, and initial
  focus is the reading region — so `Page Down` and `Space` scroll the sheet before any control has
  been visited.
- The sheet's own dismissal control is named `"Close"` (fixed English). `Drawer.Close` renders
  nothing by itself: give it `children` or a `render` element, usually a `Button`.

## Anchored surfaces

### `Menu`

A surface of actions.

```tsx
<Menu>
  <Menu.Trigger render={<IconButton icon={<Ellipsis />} aria-label="Actions" />} />
  <Menu.Content>
    <Menu.Item onClick={rename}>Rename</Menu.Item>
    <Menu.Item disabled>Duplicate</Menu.Item>
    <Menu.Separator />
    <Menu.Item variant="danger" onClick={remove}>Delete</Menu.Item>
  </Menu.Content>
</Menu>
```

- Root: `open?` / `defaultOpen?` / `onOpenChange?`. Parts: `Menu.Trigger` (`render` / `children` /
  `className`), `Menu.Content` (`side?` default `"bottom"`, `align?` default `"start"`, `sideOffset?`
  default `8`, `alignOffset?`), `Menu.Item` (`variant?`, `disabled?`, `onClick?`) and
  `Menu.Separator` (`className?`). No `ref`.
- **Choosing an item runs `onClick` and closes the menu** — that is Base's contract, not something
  to re-implement. Nothing here holds a value: a value-selection surface is `Select` or `Combobox`,
  and free-form content is a `Popover`.
- Base owns keyboard navigation, typeahead over the items' own labels, roving focus, Escape,
  outside dismissal and focus restoration. A menu is modal by Base's default: an outside press is
  absorbed by the primitive's plane rather than reaching the page beneath, so no second backdrop
  is rendered.
- A disabled item **stays in the list and stays reachable by keyboard** — including its highlight
  and focus ring — but cannot be activated and takes no hover or press state. Never write your own
  "skip disabled" navigation.
- `variant="danger"` tones the action's own label and highlight; the popup stays neutral. The
  whole row is the target, content is truncated to one line, and there are no icon or description
  slots.
- Only the props above are published. Base's fuller surface (`modal`, `closeOnClick`, …) is not
  part of this API.

### `Popover`

Free-form interactive content anchored to a control: a small form, a picker, an explanation with
controls.

```tsx
<Popover>
  <Popover.Trigger render={<Button appearance="tonal" variant="secondary">Filters</Button>} />
  <Popover.Content side="bottom" align="start">
    <Input label="Owner" value={owner} onValueChange={setOwner} />
    <Button appearance="filled" onClick={apply}>Apply</Button>
  </Popover.Content>
</Popover>
```

- Root: `open?` / `defaultOpen?` / `onOpenChange?`. Parts: `Popover.Trigger` (`render` /
  `children` / `className`) and `Popover.Content` (`side?` default `"bottom"`, `align?` default
  `"start"`, `sideOffset?` default `8`, `alignOffset?`). No `ref`.
- It stays open while the reader interacts with its content — that is the distinction from a
  `Menu` — and Escape or an outside press dismisses it, with focus returning to the trigger.
- Base owns the portal, anchor positioning, collision handling and the resulting flip; the
  entrance grows out of the side Base actually resolved. `side` accepts `"top" | "bottom" |
  "left" | "right" | "inline-start" | "inline-end"` and `align` `"start" | "center" | "end"`.
- The popup is capped to `min(24rem, available width)` and to the available height, scrolling
  inside itself. Do not wrap it in another fixed-height or clipped scroller.
- It is not a dialog: no scrim, no page scroll lock and no focus trapping (Base's non-modal
  default, and `modal` is not exposed). Anything the reader must complete belongs in a `Dialog`;
  anything they must read belongs on the page.

### `Tooltip`

A short hint for a control.

```tsx
<Tooltip content="Creates a copy in the same workspace" position="top">
  <IconButton icon={<Copy />} aria-label="Duplicate project" />
</Tooltip>
```

- `content` (required), one element as `children`, `position?` (`"top" | "right" | "bottom" |
  "left"`, default `"bottom"`) and `className?`.
- **`position`, not `side`** — and `className` styles the inline wrapper span around the trigger,
  **not** the popup, whose shell is fixed. Both are easy to get backwards.
- The hint appears immediately: the component carries its own provider with no delay and no close
  delay, so there is no shared timing to configure and no grouping with other tooltips.
- `children` must be a single element that forwards ref and props — a Sherick `Button`,
  `IconButton`, or a native element. A string or a fragment cannot be the trigger.
- A tooltip is **not** an accessible name: an icon-only control still needs its own `aria-label`.
  It is also not a place for essential instructions or for anything focusable (use `Popover`), and
  a touch reader has no hover to reveal it — never make it the only route to information.

## Known gaps to plan around

- `Dialog` has no trigger part: open state is yours. `Drawer` is the only modal that ships one.
- `AlertDialog` has no dismissal control, no compound parts and no localizable action wording
  beyond its two labels; outside press never closes it.
- Collapsed disclosure panels and inactive tab panels are **unmounted** (Base's `keepMounted`
  default, which the public props do not expose), so state inside a closed panel or a hidden tab
  does not survive it.
- `Dialog`'s dismissal control is fixed English, as is `Drawer`'s; `Tooltip` popup styling is not
  customizable through props.
- `Tabs` names its tablist with `ariaLabel` (no `aria-label` pass-through) and exposes no ref or
  per-tab class hook.
- `NavGroup` items are `{ label: string; href: string }` only — no icon, no per-item disabled, no
  render escape hatch.
- `Breadcrumb` ignores an `href` on the final item by design, and its items are keyed by position.
- `TreeView` and `Stepper` own mechanics that Base UI does not provide (the APG tree, and the
  step's controlled workflow). Do not wrap either in extra keyboard or focus machinery.
- `Breadcrumb`, `Pagination`, `Stepper` and `TreeView` are unreleased v2.1 additions; confirm the
  installed package actually exports them before depending on them.

Sources: [component sources at the pinned
revision](https://github.com/Sherick16/sherick-ui/tree/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components)
— [`NavItem.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/NavItem.tsx),
[`NavGroup.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/NavGroup.tsx),
[`Breadcrumb.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Breadcrumb.tsx),
[`Pagination.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Pagination.tsx),
[`Stepper.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Stepper.tsx),
[`TreeView.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/TreeView.tsx),
[`Tabs.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Tabs.tsx),
[`Accordion.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Accordion.tsx),
[`Collapsible.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Collapsible.tsx),
[`Dialog.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Dialog.tsx),
[`DialogSurface.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/DialogSurface.tsx),
[`AlertDialog.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/AlertDialog.tsx),
[`Drawer.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Drawer.tsx),
[`Menu.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Menu.tsx),
[`Popover.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Popover.tsx),
[`Tooltip.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Tooltip.tsx),
the [disclosure](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/disclosure.spec.ts),
[floating-surface](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/floating-surfaces.spec.ts),
[sheet](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/sheet.spec.ts),
[navigation](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-c.spec.ts),
[stepper](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-e.spec.ts)
and [tree](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-f.spec.ts)
specs, the [release contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/RELEASE.md)
and the [v2.1 component contracts](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/V2_1_COMPONENTS.md).
