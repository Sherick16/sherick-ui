# Selection, chips and choice

Use this reference for the choice/value exports `Select`, `Combobox`, `Chip`, `ChipGroup`,
`SegmentedControl`, `ToggleGroup`, `Calendar`, `DatePicker`, `DateRangePicker`, `Command` and
`CommandPalette`. Field composition lives in [forms](forms.md); page structure and when to reach
for an overlay live in [composition](../composition.md).

Release availability: `Select`, `Combobox`, `Chip`, `ChipGroup`, `SegmentedControl` and
`ToggleGroup` are part of the `2.0.0` root export. `Calendar`, `DatePicker`,
`DateRangePicker`, `Command` and `CommandPalette` arrive in `2.1.0` under the same
`sherick-ui` import; confirm each exists in the installed package before using it.

```tsx
import {
  Calendar, Chip, ChipGroup, Combobox, Command, CommandPalette, DatePicker, DateRangePicker,
  SegmentedControl, Select, ToggleGroup,
  type CalendarDate, type CalendarLabels, type CalendarProps, type ChipGroupProps, type ChipProps,
  type ComboboxOption, type ComboboxProps, type CommandItem, type CommandPaletteProps, type CommandProps,
  type DatePickerProps, type DateRange, type DateRangePickerProps, type SelectOption, type SelectProps,
  type SegmentedControlOption, type SegmentedControlProps, type ToggleGroupItemProps, type ToggleGroupProps,
} from "sherick-ui";
```

## Pick by what the choice is

The distinction is the control's semantics, not its styling:

| Need | Use | Native control |
| --- | --- | --- |
| Pick one of a fixed, known list | `Select` | a `<button>` trigger + popup listbox |
| Pick one of a list, narrowed by typing | `Combobox` | a real `<input>` filtering a popup listbox |
| Repeatedly perform one of a list of actions | `Command` | an inline search field + listbox (never a popup) |
| Hold a small selection as chips | `Chip` / `ChipGroup` | toggle buttons sharing one group value |
| One choice out of a few, always one | `SegmentedControl` | a `ToggleGroup` with exclusivity |
| Several independent toggles in one track | `ToggleGroup` | grouped toggle buttons |
| Choose a date, or a span of dates | `Calendar` / `DatePicker` / `DateRangePicker` | a grid, or native `type=date` inputs |

`Select` and `Combobox` share the option shape and the single-value contract; `Command` shares the
filter shape but is not a value control at all.

## `Select`

Options come from `options` (`{ label, value, disabled? }[]`) and the choice is one `string`.
Base UI owns the popup, the listbox semantics, keyboard navigation, the hidden form input and the
Escape ordering; Sherick owns the field surface and the selected row's tone.

- `value?: string | null`, `defaultValue?: string | null`, `onValueChange(value, eventDetails)`.
  Omit `value` and it is uncontrolled. `eventDetails` is Base's own object, so a change can be
  refused before it commits.
- `placeholder` defaults to `"Select an option"` and shows until something is chosen.
- `variant` defaults to `"primary"` (`primary | secondary | danger | warning | success`) and names
  the tone the selected row takes — selection is a tone, never a depth.
- `disabled`, `readOnly`, `required`, `name`, `form` and `id` are forwarded to the primitive. A
  `name` submits the selected value through the hidden input.
- `readOnly` locks the value, not the interaction: the popup still opens and browses, but a choice
  does not commit. `disabled` removes interaction entirely.
- The ref is the trigger `<button>`; other button attributes (`aria-label`, `type`, `onClick`) pass
  to it, which is also how a bare `Select` gets its name.
- There is no `multiple`, no search and no custom row rendering here — that is `Combobox`.

```tsx
const [project, setProject] = useState<string | null>(null);

<Select
  aria-label="Project type"
  placeholder="Choose a project"
  value={project}
  onValueChange={setProject}
  options={[
    { value: "design", label: "Design system" },
    { value: "dashboard", label: "Dashboard" },
    { value: "legacy", label: "Legacy", disabled: true },
  ]}
/>
```

## `Combobox`

The searchable sibling of `Select`: the same option shape, the same single value, and an `<input>`
instead of a trigger. Typing filters the list, and the input reports `aria-autocomplete="list"`
and `aria-haspopup="listbox"` where `Select`'s button reports neither.

- `value?: string | null`, `defaultValue?: string | null`, `onValueChange(value, eventDetails)`.
  The reported value is the selected option's own `value`, so two equal options compare equal.
- `inputValue` / `defaultInputValue` / `onInputValueChange` and `open` / `defaultOpen` /
  `onOpenChange` control the query and the popup independently of the value.
- `filter?: ((option, query) => boolean) | null` replaces the default label matching; `null` turns
  filtering off and lists every option. Filtering is local — remote results, debounce and loading
  are the application's.
- `emptyMessage` defaults to `"No results found."`; `placeholder` to `"Select an option"`.
- `autoHighlight` pre-highlights the first match so `Enter` chooses it.
- The field renders a clear control (`aria-label="Clear selection"`) and a trigger
  (`aria-label="Show options"`). A read-only combobox still opens and browses; only the clear
  control is disabled, because clearing is what would change the value.
- It renders no element of its own root and drops props it does not declare, so `aria-label` on the
  root is silently lost. Name it with a `Field` label or a native `<label htmlFor>` against `id`.
- `name` / `form` submit the value through the primitive's hidden input; the ref is the `<input>`.

```tsx
<Field label="Project">
  <Combobox options={options} defaultValue="dashboard" emptyMessage="No projects match."
    onValueChange={(next) => setProject(next)} />
</Field>
```

## `Chip` and `ChipGroup`

A `Chip` is exactly one of two things and never both:

- a **toggle chip** when any of `checked`, `defaultChecked`, `onCheckedChange` or `value` is
  supplied — a `<button>` that holds a selection; or
- a **tag** when `onRemove` is supplied — a passive `<span>` whose only control is its dismiss
  button. A tag has no `checked`/`value`/`disabled`, because a passive label is not a control.

The two cannot be combined: a toggle is a button and a tag's dismiss control is a button nested
inside it, and a button cannot legally nest in a button.

- Toggle chip: `checked` / `defaultChecked`, `onCheckedChange(pressed, eventDetails)`, `value`
  (its identity in a group), `variant` (tone of the held state; the rest state is the neutral matte
  control step), `icon`, `disabled`.
- Tag: `onRemove()` renders the dismiss control, whose name defaults to `Remove <text>` when
  `children` is a string and `Remove` otherwise, overridable with `removeLabel`. Its icon carries
  the tone; its copy keeps normal emphasis.
- `ChipGroup` is a `ToggleGroup` with a chip row's anatomy (no track). It owns one shared value, and
  Arrow keys rove between its members. Its one deliberate difference: `multiple` defaults to `true`,
  because a filter row usually holds several.
- Membership is by `value`: a chip inside a group needs one to take part. A tag in a group is not a
  toggle, takes no part in the value or the roving focus, and its dismiss control is a normal Tab
  stop (it keeps its own keys).
- Chips hold UI selection, not form values: there is no `name`/submission contract, so keep the
  value in application state via the callbacks.

```tsx
<ChipGroup aria-label="Filters" value={filters} onValueChange={setFilters}>
  <Chip value="design">Design</Chip>
  <Chip value="code">Code</Chip>
  <Chip value="ops" disabled>Ops</Chip>
</ChipGroup>

<Chip variant="success" icon={<Check />} onRemove={() => drop(id)}>Verified</Chip>
```

## `SegmentedControl` and `ToggleGroup`

`ToggleGroup` is the exposed compound: a recessed track holding equally weighted segments, with all
of Base's own group props passing through except `className` (styles the track) and `render`.
Because Base's semantics are a set of held values, `value` / `defaultValue` are **arrays** and
`onValueChange(groupValue: string[], eventDetails)` reports the whole next set. `multiple` defaults
to `false`, so an unconfigured group is single-choice.

```tsx
<ToggleGroup aria-label="Text format" multiple value={formats} onValueChange={setFormats}>
  <ToggleGroup.Item value="bold" aria-label="Bold"><BoldIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroup.Item>
</ToggleGroup>
```

`SegmentedControl` is the single-choice form with an options array; it renders the same group and
items rather than a second implementation, and adds two rules:

- **It can never be empty.** Uncontrolled with no `defaultValue`, it starts on the first
  non-disabled option; and the press that would release the held option is vetoed instead of
  clearing the control. A controlled `value` is the caller's to keep inside `options`.
- **It is one control holding one value**, so it names itself like a tab list — through `aria-label`
  / `aria-labelledby` — and `onValueChange(value: string, eventDetails)` reports a single value,
  not an array. Each option is `{ value, label, icon?, disabled? }`; the icon is decorative and the
  label is the accessible name.

```tsx
<SegmentedControl
  aria-label="Range"
  value={range}
  onValueChange={setRange}
  options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month", disabled: true },
  ]}
/>
```

Neither control participates in a form: they report state through callbacks, so the application
owns the value.

## `Calendar` (from 2.1.0)

One month of a Gregorian calendar, navigated as a keyboard grid. Values are `YYYY-MM-DD` civil dates
(`CalendarDate`) with no time or timezone; every step is calendar arithmetic, so leap days, month
crossings and year bounds (`0001`–`9999`) are exact.

- `CalendarProps` is a discriminated union. `mode?: "single"` (the default) takes `value` /
  `defaultValue` of `CalendarDate | null` and `onValueChange(value: CalendarDate | null)`.
  `mode: "range"` takes the same names with `DateRange` (`{ start, end }`, either endpoint `null`).
- Omit the state prop and it is uncontrolled. Unlike the Base-backed controls, these domain
  callbacks take the next value only — no event details.
- Grid behavior: a `grid` of weekday headers and day cells, exactly one tab stop; `aria-selected` on
  selected cells and `aria-current="date"` on today. Arrows move by day and week, `Home`/`End`
  within the row, `PageUp`/`PageDown` by month, `Shift` with them by year, retaining or clamping the
  day at a month boundary; `Enter`/`Space` select. Horizontal arrows mirror in a right-to-left page.
- `min`/`max` are inclusive, and `isDateUnavailable(date)` refuses a date. Refused days stay
  visible, focusable and announced as disabled; they are never selected, and a range may not span
  one — a completing endpoint is refused and the reason is announced.
- Range selection starts with `{ start, end: null }`; a second selection sorts both endpoints;
  selecting again after a complete range starts another range.
- `month` / `defaultMonth` control the visible month and `onMonthChange(month)` reports it
  normalized to day `01`. A refused controlled month keeps both the grid and the focus.
- `disabled`, `invalid` (the selection wears the danger tone), `locale` (default `"en-US"`),
  `weekStartsOn` (default `1`, Monday), `today` (override when the application's civil day differs
  from UTC) and `labels` for the navigation/today/range wording. `locale` changes how dates are
  written and announced, never what they mean.
- The ref is the root `<div>` and native div attributes pass through. With no `aria-label` /
  `aria-labelledby` the grid names itself from the visible month caption.

```tsx
const [date, setDate] = useState<CalendarDate | null>("2024-02-15");

<Calendar mode="single" value={date} onValueChange={setDate} min="2024-01-01" weekStartsOn={1} />

<Calendar
  mode="range"
  value={range}
  onValueChange={setRange}
  isDateUnavailable={(day) => day === "2024-12-25"}
/>
```

## `DatePicker` and `DateRangePicker` (from 2.1.0)

Both compose a native `type=date` field (so the browser owns entry, mobile UI, submission and the
`required` / `min` / `max` constraints) with a named trigger that opens the shared `Calendar` in a
non-modal popover, threaded through Sherick's `Field`.

- **`DatePicker`**: `label: string` (required; it names the input, the trigger and the popup),
  `description?`, `error?` (its presence makes the field invalid), `required?`, `disabled?`,
  `name?`, `form?`, `id?`, `className?`; the ref is the native input.
- **`DateRangePicker`**: `label: string` names the range **group** (a native `fieldset`/`legend`),
  `startLabel` defaults to `"Start date"` and `endLabel` to `"End date"`, `startName?` / `endName?`
  carry the two submissions, and `id` gives the start input its id while the end derives from it.
  The ref is the start input.
- Both take `value` / `defaultValue` / `onValueChange` (a domain value — `CalendarDate | null`, or
  `DateRange`), `open` / `defaultOpen` / `onOpenChange` (Base's popover signature), and the shared
  `min` / `max` / `isDateUnavailable` / `locale` / `weekStartsOn` / `today` / `labels`.
- A date the picker would refuse is never committed: the typed text stays on screen, the field
  explains why through its own validation, and the calendar's selection does not move. A preserved
  invalid draft stays invalid until a fresh accepted edit or selection, a form reset, or a
  controlled-value replacement — relaxing the constraints does not silently accept it. Clearing uses
  `null`.
- A `DateRangePicker` likewise refuses a reversed range or one that spans an unavailable date, and
  its calendar refuses the same spans, so pointer and keyboard cannot reach a range the field would
  reject.

```tsx
<DatePicker label="Start date" name="start" value={date} onValueChange={setDate} min="2024-01-01" required />

<DateRangePicker
  label="Billing period"
  startLabel="From"
  endLabel="To"
  startName="from"
  endName="to"
  value={range}
  onValueChange={setRange}
/>
```

## `Command` and `CommandPalette` (from 2.1.0)

`Command` is a search field and the commands it filters, **inline on the surface they belong to** —
deliberately never a popup. That is what makes a command repeatable without reopening anything;
`Select` holds a value and `Combobox` chooses one, and both dismiss.

- `items: CommandItem[]` (`{ value, label, disabled?, group?, shortcut?, icon?, keywords? }`) and
  `label: string` (required) name the list and the search field. Values are unique.
- `value` / `defaultValue` / `onValueChange(value, eventDetails)` are the **query**, never a
  retained selection. The ref is the search input.
- `onAction(value: string)` is what choosing a command does. Activation fires exactly once by
  pointer or `Enter`, never submits a surrounding form, and **does not replace the query with the
  command's label** — the list stays where it is. A disabled command stays in the list and
  highlightable but cannot activate.
- Default matching uses the primitive's collator over `label` and `keywords`; `locale` is the
  comparison locale. `filter` replaces it, or `null` lists every command whatever the query.
- `group` becomes the row's heading; commands without one keep a group of their own, and group order
  follows first appearance. `shortcut` and `icon` are metadata — a hint and a mark, not a registered
  shortcut or a nested action. `renderItem(item)` replaces the row's content with non-interactive
  content (the row itself is the control).
- `emptyMessage` defaults to `"No commands found."`, `placeholder` to `"Search commands…"`.
  `disabled` dims the control once; `locale`, `className`, `inputClassName` and `id` are available.
- `CommandPalette` is the same list as a `Dialog` (Base dialog root + the shared `DialogSurface`):
  Command props except `className` / `id`, plus `title: string` (required, names the dialog),
  `description?`, `trigger?` (the element that opens it, usually a `Button`), `open` /
  `defaultOpen` / `onOpenChange` (Base's dialog signature) and `className?` for the surface. The
  search field takes the initial focus; running a command reports it and dismisses the surface on
  the first Escape, and an uncontrolled query resets when the palette unmounts. A controlled query
  stays the consumer's.

```tsx
<Command label="Search commands" items={commands} onAction={run} filter={null} />

<CommandPalette
  title="Run a command"
  description="Search the commands, then press Enter."
  label="Search palette commands"
  items={commands}
  onAction={run}
  trigger={<Button appearance="filled">Open command palette</Button>}
/>
```

## Sources

[`Select.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Select.tsx),
[`Combobox.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Combobox.tsx),
[`Chip.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Chip.tsx),
[`ChipGroup.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/ChipGroup.tsx),
[`SegmentedControl.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/SegmentedControl.tsx),
[`ToggleGroup.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/ToggleGroup.tsx),
[`Calendar.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Calendar.tsx),
[`DatePicker.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/DatePicker.tsx),
[`DateRangePicker.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/DateRangePicker.tsx),
[`Command.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Command.tsx),
[`CommandPalette.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/CommandPalette.tsx),
the [Combobox/Select fixtures](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/floating-surfaces.spec.ts),
[chip and toggle fixtures](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/toggles.spec.ts),
[date fixtures](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-a.spec.ts),
[command fixtures](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-b.spec.ts),
and the [release contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/RELEASE.md).
