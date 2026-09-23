# Actions and display

Use this reference for the root-barrel actions, tags, surfaces, data region and
loading/feedback output: `Button`, `IconButton`, `Badge`, `Avatar`, `Card`, `Divider`,
`Alert`, `Table`, `Skeleton`, `Spinner`, `Progress`. It owns their props, defaults,
states and component-specific caveats. The [design language](../design-language.md),
[composition](../composition.md), [theming](../theming.md) and
[accessibility](../accessibility.md) references own the cross-component rules.

All eleven ship in the stable `2.0.0` core barrel. None is part of the unreleased v2.1
wave (which adds Calendar/date pickers, Command/CommandPalette, Pagination/Breadcrumb,
FileUpload, Stepper, TreeView). Import from `sherick-ui`; no Base UI import, workbench
recipe or private class is needed or supported.

```tsx
import {
  Alert, Avatar, Badge, Button, Card, Divider, IconButton, Progress, Skeleton, Spinner, Table,
  type AlertProps, type AvatarProps, type BadgeProps, type ButtonAppearance, type ButtonProps,
  type ButtonSize, type CardProps, type DividerProps, type DividerWeight, type IconButtonAppearance,
  type IconButtonProps, type ProgressProps, type SkeletonProps, type SpinnerProps, type TableProps,
  type Variant,
} from "sherick-ui";
```

## Conventions that hold across these components

- `variant` is the shared tone union `"primary" | "secondary" | "danger" | "warning" |
  "success"`. Semantic tones carry meaning, not decoration.
- `className` is merged with the internal classes by `cn()`, so a Tailwind conflict
  replaces the internal utility rather than duplicating it. Never target private
  classes, `data-sui-*` attributes or `.sui-scope`.
- Only `Button`, `IconButton` and `Progress` forward a ref; the rest accept no `ref`.
- `Button` and `IconButton` default to `type="button"`, so a form's Save action needs
  explicit `type="submit"`. Their state and callbacks are the native ones (`onClick`,
  `disabled`, `form`, `name`, `aria-*`); there is no Sherick `onPress`-style wrapper and
  no `render`/`asChild`/`href`.
- Nothing here fetches, retries or schedules. Loading and progress state is the
  application's; these components render it.

## Button

```tsx
<Button appearance="filled" variant="danger" icon={<Trash2 />}>Delete</Button>
<Button appearance="tonal" variant="secondary">Cancel</Button>
<Button appearance="text" variant="secondary" size="sm">Skip</Button>
<Button type="submit" loading={saving} icon={<Download />}>Export</Button>
```

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` (required) | — |
| `variant` | `Variant` | `"primary"` |
| `appearance` | `"filled" \| "tonal" \| "text"` | `"tonal"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `icon` | `ReactNode` | — |
| `loading` | `boolean` | `false` |
| `type` | `"submit" \| "reset" \| "button"` | `"button"` |

Also accepts every `ButtonHTMLAttributes<HTMLButtonElement>` (`ButtonProps`). Renders a
native `<button>`; the ref points at that element.

- `appearance`: `filled` is the strong tone fill with a filled state layer, `tonal` is the
  tinted matte raised control that recesses while held, `text` is a fill-less tone label.
- `loading` also sets `disabled` and `aria-busy="true"`, so it blocks form submission and
  pointer input while it runs. The label stays in the DOM and keeps the accessible name;
  with no `icon` it is only made invisible, which is why the control's width does not
  change between its rest and loading states.
- `icon` occupies one fixed 20px slot, so swapping an icon for the spinner cannot resize the
  control. A direct `svg` in the slot is normalized to 20px; a nested node must size itself —
  `Button` passes `size-5` to the spinner it substitutes, which is why a nested `Spinner` is a
  mark a plain `svg` selector cannot reach.
- Sizes are density floors on the control's height: sm ≥40px, md ≥48px, lg ≥56px.
- For navigation use the navigation components or an anchor, not a filled button.

## IconButton

```tsx
<IconButton icon={<Bell />} aria-label="Notifications" />
<IconButton appearance="ghost" variant="secondary" icon={<Search />} aria-label="Search" />
<IconButton appearance="acrylic" variant="secondary" icon={<Download />} aria-label="Download" loading={saving} />
```

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `Variant` | `"primary"` |
| `appearance` | `"tonal" \| "ghost" \| "acrylic"` | `"tonal"` |
| `icon` | `ReactNode` | — |
| `loading` | `boolean` | `false` |
| `type` | `"submit" \| "reset" \| "button"` | `"button"` |

Also accepts every `ButtonHTMLAttributes<HTMLButtonElement>` (`IconButtonProps`); the ref
points at the `<button>`.

- It has no `size` prop: the standalone target is one 44×44px square (`density.target`)
  and the mark slot is 20px, matching `Button`'s slot.
- The icon is wrapped in an `aria-hidden` slot, so supply `aria-label` (or text) yourself;
  an unlabelled icon button has no accessible name. Add a `Tooltip` for discovery, not as
  the name.
- `appearance`: `tonal` is the raised matte control, `ghost` is transparent with a quiet
  state layer, `acrylic` is the translucent floating material for controls over
  application content. `loading` behaves exactly as on `Button`.

## Badge

```tsx
<Badge variant="success" icon={<Check />}>Ready</Badge>
<Badge variant="secondary">Draft</Badge>
```

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` (required) | — |
| `variant` | `Variant` | `"primary"` |
| `icon` | `ReactNode` | — |

Also accepts `HTMLAttributes<HTMLSpanElement>` (`BadgeProps`); it renders a plain
`<span>` and has no `ref`.

- A passive tag: no hover, press, focus or dismissal state. For a removable or
  selectable tag use `Chip`/`ChipGroup`, not a Badge with a click handler.
- The pill is a `soft` tone tint at a 28px minimum height with a neutral readable label;
  only the leading 14px icon slot takes the semantic tone. The label truncates instead of
  wrapping, so keep badge copy short.

## Avatar

```tsx
<Avatar src="/avatars/ana.jpg" alt="Ana Ruiz" size="sm" />
<Avatar src="/brand/workspace.png" alt="" shape="rounded" />
```

| Prop | Type | Default |
| --- | --- | --- |
| `src` | `string` (required) | — |
| `alt` | `string` (required) | — |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `shape` | `"circle" \| "rounded"` | `"circle"` |

Everything else is the rest of `Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" |
"width" | "height">` and lands on the `<img>` (`onError`, `loading`, `referrerPolicy`,
`data-*`), which is also where `AvatarProps` puts your extras.

- Sizes are 32/64/128px squares; `width`/`height`/`loading="lazy"` are set for you and the
  image fades out while loading or after an error.
- `alt=""` makes the avatar decorative: it drops `role="img"` and gets `aria-hidden`
  instead of a name. Pass a real `alt` when the person or brand is the content.
- There is no fallback or initials slot. An empty or broken `src` leaves the matte surface
  blank; render initials or an icon yourself (from `onError`) if you need one.
- The root is a `<span>`. Its `h-*`/`w-*` utilities only take effect where the context
  blockifies it — a flex/grid row, as the specimens place it, or an added `inline-flex`.
  Dropped directly into a text line the span stays inline and collapses to its line box.

## Card

```tsx
<Card variant="secondary">
  <h3 className="font-medium">Workspace</h3>
  <p className="mt-2 text-sm">Supporting copy.</p>
  <Divider className="my-4" />
  <Button appearance="text" variant="secondary">Manage</Button>
</Card>
```

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` (required) | — |
| `variant` | `Variant` | `"secondary"` |

Also accepts `HTMLAttributes<HTMLDivElement>` (`CardProps`); one `<div>`, no `ref`.

- A matte tonal surface with `surface` corners and no elevation or rim: the tone separates
  it from the canvas, and it lifts only when something inside it does.
- `p-6` is built-in component padding, so a card needs no inner wrapper. Override it with
  `className` (e.g. `p-4`) when the surrounding density demands it.
- No `Header`/`Content`/`Footer` parts: headings, copy and actions are ordinary children,
  and a join inside the card is a `Divider`. The semantic element is the page's choice —
  wrap the card, or keep the card as the visual surface inside a `<section>`.

## Divider

```tsx
<Divider />                                        {/* section rule inside a surface */}
<Divider weight="header" />                        {/* under a column header */}
<div className="flex h-9 items-center gap-4">
  <span>Left</span>
  <Divider orientation="vertical" />
  <span>Right</span>
</div>
```

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` |
| `weight` | `"row" \| "header" \| "rule"` (`DividerWeight`) | `"rule"` |
| `className` | `string` | — |

Renders `role="separator"` with `aria-orientation`. No children, no `ref`.

- The three weights are one structural edge tone at three strengths: `row` is the join
  between stacked rows, `header` the rule under a column header, `rule` a general section
  break. Name the join you are drawing instead of picking an opacity.
- A horizontal divider is full width and `h-0`; use `className="flex-1"` inside a flex row.
- A vertical divider is `h-full`, so its parent needs a *resolved* height — a fixed-height row
  (`h-9`, `h-11`) or a definite flex/grid track. In an auto-height row or block flow it
  collapses to zero height.
- It is a structural join, not spacing, and never a rim around a filled control or a card.

## Alert

```tsx
<Alert variant="warning">Review these settings before continuing.</Alert>
<Alert variant="danger" closeable onDismiss={() => track("dismissed")}>
  The connection dropped before the file was sent.
</Alert>
```

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` (required) | — |
| `variant` | `Variant` | `"primary"` |
| `closeable` | `boolean` | `false` |
| `onDismiss` | `() => void` | — |
| `className` | `string` | — |

Inline and non-portaled; no `ref`, no title or actions prop — the whole copy is `children`.

- Role follows the tone: `danger` and `warning` render `role="alert"` (assertive),
  everything else `role="status"`.
- The status icon is fixed per variant and `aria-hidden`; there is no prop to replace or
  remove it. Semantic colour stays on that mark and the surface tint.
- With `closeable`, the dismiss control calls `onDismiss?.()` and then hides the alert
  itself. That hidden state is internal and one-way: to show the same message again,
  remount the alert (a new `key`) or render it conditionally from your own state.
- The dismiss control's accessible name is the library's fixed English `"Dismiss alert"`;
  it is not localizable through props for non-English applications.
- The mark and the dismiss target align to the first **readable line**, so wrapping copy
  keeps both on line one.

## Table

```tsx
<Table
  headers={["Project", "Owner", "Status"]}
  rows={[
    ["Design system", "Ana", <Badge key="design" variant="success">Live</Badge>],
    ["Marketing site", "Bruno", <Badge key="marketing">In review</Badge>],
  ]}
/>
```

| Prop | Type | Default |
| --- | --- | --- |
| `headers` | `string[]` | required |
| `rows` | `ReactNode[][]` | required |
| `className` | `string` | — |

- Header labels are the header cells' React keys, so they must be unique strings, and a header
  cell cannot hold a node. Body cells accept any `ReactNode`; give a list rendered inside one
  cell its own keys. Rows are keyed by position, so re-sorted or filtered data re-renders by
  position rather than by identity.
- `className` styles the scrolling wrapper, not the `<table>`.
- Presentation only: no sorting, selection, sticky columns, density or `variant` (removed
  in v2). The wrapper owns the quiet matte fill, `control` corners and horizontal
  scrolling of wide content; rows answer pointer hover with tone only, and the header row
  carries the heavier rule.
- The rendered table has no `<caption>` and no name or label prop, so a table whose
  meaning is not clear from its headers needs a labelled application region around it.

## Skeleton

```tsx
<div className="space-y-3">
  <Skeleton className="h-4 w-4/5" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-24 w-full" />
</div>
```

`SkeletonProps` is exactly `HTMLAttributes<HTMLDivElement>`: no size, variant or preset
props. It has no intrinsic dimensions, so give each instance a height and width (and
often a `margin`) through `className` or `style`, and compose several to sketch the real
layout.

- It is decorative by default (`aria-hidden` is `true`; pass `aria-hidden={false}` to
  expose it deliberately). Naming or announcing the loading region — an `aria-busy`
  container, a status message — belongs to the application.
- Shape is the `control` corner in the second matte step; the pulse is the `activity`
  motion intent, which resolves to a static block under reduced motion.

## Spinner

```tsx
<Spinner size="small">Loading projects</Spinner>
<Spinner />        {/* bare mark: the surrounding region must convey the state */}
```

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `"small" \| "medium" \| "large"` (16/32/40px) | `"medium"` |
| `show` | `boolean` | `true` (`false` renders it hidden) |
| `children` | `ReactNode` | — |
| `className` | `string` | — |

- The wrapper is `role="status"` with `aria-live="polite"`; the glyph itself is
  `aria-hidden`. A bare spinner therefore announces nothing — pass `children` as a visible
  label, or let the loading region carry the status.
- `children` render beside the loader, not inside the mark's box, and the wrapper is
  allowed to shrink in a narrow row. The fixed, non-shrinking slot belongs to whatever
  control embeds the spinner (`Button` uses one).
- The mark takes `currentColor`; `className` applies to the glyph, so `className="size-5"`
  resizes it inside an embedding slot.

## Progress

```tsx
<Progress value={62} label="Uploading assets" showValue />
<Progress value={null} label="Scanning dependencies" />
<Progress value={100} variant="success" label="Deploy finished" showValue />
```

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number \| null` (omitted or `null` = indeterminate) | — |
| `variant` | `Variant` | `"primary"` (fill tone) |
| `label` | `ReactNode` | — |
| `showValue` | `boolean` | `false` |
| `min` / `max` | `number` | `0` / `100` |
| `format` / `locale` / `getAriaValueText` | number-format options, locale, `(formatted, value) => string` | runtime default |

The rest of `div`'s props land on the root column, including `className`; the track and
fill style themselves. `children` is not accepted. `ProgressProps` has the full signature,
and the ref is the root `HTMLDivElement`.

- Display-only: no change callback and no internal state, so `value` is rendered from your
  own state as the work advances.
- `label` is the visible label **and** the bar's accessible name. The root element is the
  `progressbar`, so a `div` attribute such as `aria-label` reaches it when no visible label
  is wanted.
- Indeterminate (absent, `null` or non-finite value) announces no value, paints the fill
  as one bar's worth of track and sweeps it on a composited transform loop — which stops,
  leaving the fill in place and still reporting work, under reduced motion.
- `showValue` renders the formatted value opposite the label, and renders nothing while
  the bar is indeterminate.

## Known gaps to plan around

- `Table` has no caption, label or ARIA pass-through; wrap it in a named region.
- `Alert`'s dismissal name is fixed English and there is no `aria-label` prop for it.
- `Avatar` has no fallback slot, and its root is a `<span>` that needs a blockifying
  context to hold its size.
- Only `Button`, `IconButton` and `Progress` expose a ref; `Card`, `Badge`, `Alert`,
  `Table`, `Divider`, `Skeleton`, `Spinner` and `Avatar` cannot be given one.
- `Skeleton` ships no dimensions and no preset shapes; every skeleton is sized by the
  caller.

Sources: [component sources at the pinned revision](https://github.com/Sherick16/sherick-ui/tree/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components),
[public export contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/RELEASE.md#public-export-contract)
and [design language, sections 8–11 and 17–19](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/DESIGN_LANGUAGE.md).
