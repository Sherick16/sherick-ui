# Forms and value controls

Use this reference for the field, text-entry and value-selection exports: `Field`, `Input`,
`Textarea`, `Search`, `NumberField`, `Checkbox`, `Switch`, `RadioGroup`, `Slider` and
`FileUpload`. It owns their props, defaults, callbacks and controlled/uncontrolled
semantics. Composition guidance lives in [composition](../composition.md); naming, focus
and error relationships live in [accessibility](../accessibility.md).

Release availability: every component above except `FileUpload` is part of the
`2.0.0` root export. `FileUpload` arrives in `2.1.0` under the same import path;
confirm it exists in the installed package before using it.

```tsx
import {
  Checkbox, Field, FileUpload, Input, NumberField, RadioGroup, Search, Slider, Switch, Textarea,
  type CheckboxProps, type FieldProps, type FileRejection, type FileUploadProps,
  type InputProps, type NumberFieldProps, type RadioGroupOption, type RadioGroupProps,
  type SearchProps, type SliderProps, type SwitchProps, type TextareaProps,
} from "sherick-ui";
```

## Two field composition forms

Both forms render Base UI's Field parts and produce the same label/description/error
relationships, and both are part of the stable contract rather than a migration.

- **Convenience props.** `Input`, `Textarea` and `Search` compose `Field.Root` internally
  and take `label` / `description` / `error` themselves. `RadioGroup` and `FileUpload`
  also own their field and take their own `label`.
- **Exported `Field`.** Selection and value controls (`Checkbox`, `Slider`, `NumberField`,
  `Select`, `Combobox`) compose through the exported `Field` so the application supplies
  one label/description/error wrapper.

Do not nest one form inside the other. Inside a `Field`, the control's own field cannot
see the wrapper: `Field.Label` is not associated with a control that owns another
`Field.Root` (`Input`, `Textarea`, `Search`, `RadioGroup`, `FileUpload`), and the wrapper's
`validate` / `invalid` / `disabled` do not reach it. A `Field` labels exactly one control;
a group of controls names itself.

## Callbacks: native `onChange` versus value callbacks

- **Native `onChange`.** `Input`, `Textarea` and `Search` extend `InputHTMLAttributes` /
  `TextareaHTMLAttributes`, so `onChange` is React's normal DOM handler (`event.target.value`,
  `event.target.checked`) passed through to the real `<input>` / `<textarea>`. Nothing in
  Sherick remaps it. Use it when you want the event; for a controlled control the value
  still has to be written back to `value` yourself.
- **Value callbacks.** `onValueChange` (`Input`, `Textarea`, `Search`, `NumberField`,
  `Slider`, `RadioGroup`) and `onCheckedChange` (`Checkbox`, `Switch`) are Base UI's
  callbacks: they receive the new value first and an `eventDetails` second
  (`{ reason, event, cancel(), isCanceled, allowPropagation() }`). Cancelling there is how a
  consumer refuses a change.
- **Both fire on the text controls.** On `Input`, `Textarea` and `Search` the native
  `onChange` and the value callback are merged on the same element, so passing both is
  legitimate — they are not alternatives. `NumberField`, `Slider` and `RadioGroup` declare
  only their value callbacks.
- **Commit callbacks.** `Slider.onValueCommitted` and `NumberField.onValueCommitted` fire
  when a change settles (drag released, stepper pressed, blur), not on every keystroke or
  drag frame. Prefer them for saves and analytics; use `onValueChange` for live state.
- **`FileUpload.onFilesChange`** receives the whole next selection, not a delta, and is the
  only place the selection is reported. `onReject` receives the refused items
  (`{ file, code: "type" | "size" | "count", message }`).

## Controlled or uncontrolled

Every value control follows one rule: **omitting the state prop leaves it uncontrolled;
passing it makes it controlled**, and a controlled control only moves when you write the
value back.

| Component | State prop | Initial value | Change callback |
| --- | --- | --- | --- |
| `Input`, `Textarea`, `Search` | `value` | `defaultValue` | `onValueChange` and/or native `onChange` |
| `NumberField` | `value` (`number \| null`) | `defaultValue` | `onValueChange`, `onValueCommitted` |
| `Checkbox`, `Switch` | `checked` | `defaultChecked` | `onCheckedChange` |
| `RadioGroup` | `value` (`string`) | `defaultValue` | `onValueChange` |
| `Slider` | `value` (`number`) | `defaultValue` | `onValueChange`, `onValueCommitted` |
| `FileUpload` | `files` (`File[]`) | `defaultFiles` | `onFilesChange` |

## `Field`

Labels and validates one control. Base UI owns the generated IDs and the
`aria-describedby` / `aria-invalid` wiring; `Field` owns the order and typography of label,
control, description and error. Ref is the root `<div>`.

- `label?`, `description?`, `error?` (`ReactNode`), `required?`, `className?` (the field's
  own column), and exactly one control as `children`.
- **`error` is the state, not just a message.** Its presence sets `invalid`, so an error can
  never render without the state that explains it. Omit it and the error part still exists,
  showing Base UI's own validation message.
- `required` renders the mark beside the label only. The requirement itself has to be
  declared on the control (`required` on `NumberField`, `Checkbox`, `RadioGroup`, …).
- It passes through Base UI's field props: `name`, `disabled`, `invalid`, `dirty`,
  `touched`, `validate(value, formValues)`, `validationMode` (`"onSubmit"` default,
  `"onBlur"`, `"onChange"`), `validationDebounceTime`, `actionsRef`.
- `disabled` on the field reaches the control and its styling even when the control never
  received `disabled` itself.
- Children are single controls: `Checkbox`, `Slider`, `NumberField` and the same-shaped
  `Select` / `Combobox`. A `RadioGroup` is not one of them — it carries its own label.

```tsx
// A field can validate on its own: no `error` prop, the message is Base's own
<Field label="Priority" validate={(value) => (Number(value) > 5 ? "Choose five or fewer" : null)} validationMode="onChange">
  <NumberField defaultValue={2} min={1} max={10} />
</Field>

// Or pin a caller-supplied message; its presence is what makes the field invalid
<Field label="Seats" description="Between 1 and 10." error="Choose between 1 and 10 seats." required>
  <NumberField min={1} max={10} defaultValue={3} required />
</Field>
```

## `Input` and `Textarea`

A styled single-line `<input>` and a resizable multi-line `<textarea>`, each composing its
own field. Both extend the native element's attributes, so `type`, `placeholder`,
`autoComplete`, `inputMode`, `readOnly`, `name` and the rest pass straight through; the ref
is the native element.

- `label?`, `description?`, `error?: boolean` (default `false`), `errorMessage?: ReactNode`,
  `required?`.
- `className` styles the field's column; `inputClassName` (`Input`) / `textareaClassName`
  (`Textarea`) styles the control itself.
- Unlike `Field.error`, `error` here is a **boolean** and the message is a separate prop.
  The message renders only while `error` is true, and with `error` alone the control is
  marked invalid with no visible message.
- Here `required` does both jobs: it marks the label and sets the requirement on the
  control. There is no `validate` / `validationMode` on `Input` / `Textarea`.
- `onValueChange(value, eventDetails)` is Base's callback; native `onChange` also works, on
  the same input. `Textarea` reads `value` / `defaultValue` itself, so controlled and
  uncontrolled use behave exactly like `Input`.
- `disabled` dims the control and ignores interaction; `readOnly` is the native one — still
  focusable and selectable, and styled as an enabled field.

```tsx
<Input label="Email" name="email" type="email" required description="We only use it for receipts." />
<Textarea label="Notes" defaultValue="" description="Optional." />
<Input label="Project name" defaultValue="Sherick UI" error errorMessage="Project names must be unique." />
```

## `Search`

A text field with its own submit control. `Search` composes the field itself, so it has no
`label` prop: give it `aria-label` / `aria-labelledby`, or the search field is unnamed.

- `onSearch: (value: string) => void` is **required** — the value that was searched, after
  debouncing and on submit.
- `debounceMs` defaults to `300`; `0` fires on every change. A pending timer is dropped on
  submit and on unmount.
- `loading` defaults to `false`: it swaps the submit glyph for a `Spinner` and marks the
  input `aria-busy`. **Typing stays enabled while loading**; only the submit control is
  disabled.
- `variant` defaults to `"secondary"` (`primary | secondary | danger | warning | success`)
  and tints the submit glyph. `placeholder` defaults to `"Search..."`.
- `onValueChange(value, eventDetails)` reports every change (already wired to the debounce);
  native `onChange` also passes through, which is how the fixture drives a controlled field.
  `className` styles the field root, `inputClassName` the input.
- `onSearch` fires with the latest value, whether or not the value was controlled.

```tsx
const [query, setQuery] = useState("");

<Search
  aria-label="Search projects"
  value={query}
  onValueChange={setQuery}
  onSearch={runSearch}
  debounceMs={300}
  loading={pending}
/>
```

## `NumberField`

A number typed or stepped. Base UI owns parsing, stepping, clamping, spinbutton semantics
and locale formatting; Sherick owns the groove and the two 44px steppers. The ref is the
visible input; `inputRef` is the hidden `<input type="number">` that participates in the
form.

- `value?: number | null`, `defaultValue?: number`, `onValueChange`, `onValueCommitted`.
- `min`, `max`, `step` (`step` defaults to `1`), `disabled`, `readOnly`, `required`, `name`,
  `form`.
- `className` styles the field container, `inputClassName` the text input.
- The native `value`, `defaultValue`, `onChange`, `min`, `max`, `step` and `type` props are
  removed from the inherited input attributes: these controls go through Base.
- Out-of-range typed input is clamped on blur (type `40` into a `max={10}` field and it
  becomes `10`). Steppers disable at their bound and take no focus ring.
- `readOnly` disables both steppers (Base treats them as disabled) while the value still
  submits. `disabled` dims the field and removes all interaction.

```tsx
<NumberField aria-label="Form seats" name="formSeats" defaultValue={2} min={1} max={10} step={1} />
```

## `Checkbox`

A ticked, unticked or mixed choice. The ref is the visible `<button>`; the form input Base
UI keeps beside it is reached through `inputRef`.

- `checked`, `defaultChecked`, `onCheckedChange(checked, eventDetails)`.
- `indeterminate` defaults to `false` and is reported as `mixed`, not as a ticked box.
- `value?: string` is what the form submits when ticked; `uncheckedValue?: string` is what
  it submits when not. By default an unticked box is omitted from the form, as native.
- `readOnly`, `required`, `disabled`, `name`, `form`, `inputRef`, `className`, plus
  `aria-label` and the other button attributes.
- There is no `onChange` here: a checkbox is a value, so it reports `onCheckedChange`.
- `readOnly` leaves the box focusable and announces read-only, but refuses toggling and
  does not dim it — only `disabled` does.
- The visible mark is 24px; its hit area is expanded around it, so give rows real spacing
  rather than assuming adjacent 24px marks never overlap.

```tsx
<Checkbox name="notify" value="yes" checked={notify} onCheckedChange={setNotify} aria-label="Form notifications" />
<Checkbox indeterminate aria-label="Partial selection" />
```

## `Switch`

A boolean control with a track and a travelling thumb. Same contract shape as `Checkbox`
(ref is the visible `<button>`, `inputRef` the form input), plus:

- `variant` defaults to `"primary"` (`primary | secondary | danger | warning | success`)
  and tints the checked track.
- `readOnly` / `required` / `disabled` behave as on `Checkbox`; `value` / `uncheckedValue`
  / `name` / `form` carry the same form participation.
- `onCheckedChange(checked, eventDetails)` is the state callback.
- With no `checked`, the switch is genuinely uncontrolled.

```tsx
<Switch name="enabled" value="yes" checked={enabled} onCheckedChange={setEnabled} aria-label="Enabled" />
```

## `RadioGroup`

One choice out of a list. Base UI owns the value, the roving tab index, the arrow keys, the
name and the form participation; Sherick owns the labelled column and the rows. The ref is
the group `<div>`; `inputRef` is the hidden form input.

- `options: { value: string; label: ReactNode; disabled?: boolean }[]` is required; each
  option is its own control and can be disabled individually.
- `label?` is the **group's** label (it renders its own field), `value` / `defaultValue`
  (`string`), `onValueChange(value, eventDetails)`, `name`, `form`, `required`, `disabled`,
  `readOnly`, `className`.
- Do not put a `RadioGroup` inside a `Field`: it names itself, and a `Field` label belongs to
  a single control.
- The whole row is the pointer target and the label, so wrapped text keeps the circle on its
  first line. `readOnly` refuses a new selection without dimming; `disabled` disables the
  group.

```tsx
<RadioGroup
  label="Region"
  name="region"
  value={region}
  onValueChange={setRegion}
  options={[
    { value: "eu", label: "Europe" },
    { value: "us", label: "United States" },
    { value: "apac", label: "Asia Pacific", disabled: true },
  ]}
/>
```

## `Slider`

A single handle on a groove. The ref is the handle, which is the part a user grabs.

- `value?: number`, `defaultValue?: number`, `onValueChange`, `onValueCommitted`,
  `min`, `max`, `step`, `disabled`, `name`, `form`.
- `label?` gives a visible label for a slider that is not inside a `Field`; without one,
  pass `aria-label` / `aria-labelledby`, which `Slider` forwards to the handle — the only
  part that can name a slider.
- `className` styles the slider column, `thumbClassName` the handle. Other root props
  (`orientation`, `format`, `minStepsBetweenValues`, range values, …) are not part of the
  declared surface: this is one handle, horizontally, with `min={0}` / `max={100}` /
  `step={1}` when you set none.
- There is no `readOnly`; a non-editable slider is `disabled`.
- Keyboard operation: arrows step, `Home`/`End` reach the bounds; the value still submits
  through `name`, both controlled and uncontrolled.

```tsx
<Slider label="Budget" name="budget" min={0} max={100} step={10} defaultValue={40} onValueCommitted={save} />
<Slider aria-label="Width" defaultValue={40} className="w-32" />
```

## `FileUpload` (from 2.1.0)

A labelled field that selects files from the native picker or by dropping them on its zone.
The ref is the native file `<input>`.

- **Required:** `label: string`. Also `description?`, `error?` (`ReactNode` — its presence
  makes the field invalid, as on `Field`).
- `files?: File[]` / `defaultFiles?: File[]` own the **presented** selection.
  `onFilesChange?: (files: File[]) => void` reports the whole next selection after every
  accepted change. `onReject?: (items: FileRejection[]) => void` reports the refused ones.
- `multiple` defaults to `false`; `accept` is the native comma-separated MIME/extension
  value (a UX restriction only); `maxSize` is bytes per file; `maxFiles` is the total and is
  only meaningful with `multiple`; `disabled` defaults to `false`.
- `selectLabel` defaults to `"Select files"`, `clearLabel` to `"Clear files"`, and
  `removeLabel` defaults to `Remove <file name>`.
- The zone builds its own hint line from `accept`, `maxSize`, `multiple` and `maxFiles`.
- **There is no `name` / `required` submission contract.** The picker is deliberately
  uncontrolled and is emptied after every read, so choosing the same file twice reports
  twice; files are never mirrored into hidden inputs. Build `FormData` from
  `onFilesChange`.
- One policy covers both doors: a file the picker's `accept` refuses cannot enter by drop,
  the valid part of a mixed batch still enters, and duplicate identity is
  name + size + type + lastModified. Type, size and count failures are visible and
  announced; successful changes are announced only (no visible activity log).
- Controlled semantics are honest: if the consumer does not apply the update, the field
  does not pretend it did. `defaultFiles` is read when the field mounts, so seeded `File`s
  have to be created on the client — a `File` cannot exist during a server render.
- `disabled` closes the picker, the drop, the removals and the clear control. Empty MIME
  can match an extension but never a MIME-only token. Uploading, progress and previews are
  out of scope.

```tsx
const [files, setFiles] = useState<File[]>([]);

<FileUpload
  label="Attachments"
  description="Up to two files."
  multiple
  accept=".pdf,image/*"
  maxSize={1024 * 1024}
  maxFiles={2}
  selectLabel="Add attachments"
  clearLabel="Remove all"
  files={files}
  onFilesChange={setFiles}
  onReject={reportRejections}
/>
```

## Sources

[`Field.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Field.tsx),
[`Input.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Input.tsx),
[`Textarea.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Textarea.tsx),
[`Search.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Search.tsx),
[`NumberField.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/NumberField.tsx),
[`Checkbox.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Checkbox.tsx),
[`Switch.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Switch.tsx),
[`RadioGroup.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/RadioGroup.tsx),
[`Slider.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Slider.tsx),
[`FileUpload.tsx`](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/FileUpload.tsx),
[field-family verification spec](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/fields.spec.ts),
[FileUpload spec](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/apps/showcase/tests/browser/v2-1-d.spec.ts)
and the [release contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/RELEASE.md).
