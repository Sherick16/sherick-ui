# Component index

Start from the task, not the component name. Read the linked family reference for the
matching contract; load a cross-cutting reference only when the task also changes its
topic. Availability describes the version that introduced an export, not the consuming
app's installed package. Verify installed exports before using any `2.1.0` addition.

## Choose a component

| Need | Choose | API reference | Availability |
| --- | --- | --- | --- |
| A labelled action, submit action, or loading action | `Button` | [Actions and display](actions-display.md) | Stable 2.0.0 |
| An icon-only action | `IconButton` | [Actions and display](actions-display.md) | Stable 2.0.0 |
| A short status label, person image/initials, or grouped content surface | `Badge`, `Avatar`, `Card` | [Actions and display](actions-display.md) | Stable 2.0.0 |
| Present a content or decorative image or native video with Sherick styling | `Media.Image`, `Media.Video` | [Actions and display](actions-display.md#media) | From 2.1.0 |
| Separate content or show a passive message | `Divider`, `Alert` | [Actions and display](actions-display.md) | Stable 2.0.0 |
| Show tabular data | `Table` | [Actions and display](actions-display.md) | Stable 2.0.0 |
| Show loading activity, a placeholder, or measured completion | `Spinner`, `Skeleton`, `Progress` respectively | [Actions and display](actions-display.md) | Stable 2.0.0 |
| Label a control or compose field text/errors | `Field` | [Forms](forms.md) | Stable 2.0.0 |
| Enter text, multiline text, search, or a number | `Input`, `Textarea`, `Search`, `NumberField` | [Forms](forms.md) | Stable 2.0.0 |
| Choose checked state, one radio option, or a continuous value | `Checkbox`, `Switch`, `RadioGroup`, `Slider` | [Forms](forms.md) | Stable 2.0.0 |
| Pick one fixed option vs search among options | `Select` vs `Combobox` | [Selection](selection.md) | Stable 2.0.0 |
| Hold tags vs choose one/many compact toggles | `Chip`/`ChipGroup` vs `SegmentedControl`/`ToggleGroup` | [Selection](selection.md) | Stable 2.0.0 |
| Search and invoke an action inline vs in a modal palette | `Command` vs `CommandPalette` | [Selection](selection.md) | From 2.1.0 |
| Choose a date vs a date range | `Calendar`, `DatePicker`, `DateRangePicker` | [Selection](selection.md) | From 2.1.0 |
| Link to a destination, show a location trail, or paginate results | `NavGroup`/`NavItem`, `Breadcrumb`, `Pagination` | [Navigation and overlays](navigation-overlays.md) | NavGroup/NavItem from 2.0.0; Breadcrumb/Pagination from 2.1.0 |
| Select a panel vs disclose content in place | `Tabs` vs `Accordion`/`Collapsible` | [Navigation and overlays](navigation-overlays.md) | Stable 2.0.0 |
| Browse a hierarchy vs show workflow steps | `TreeView` vs `Stepper` | [Navigation and overlays](navigation-overlays.md) | From 2.1.0 |
| Confirm one destructive choice, complete a modal task, or attach a task to an edge | `AlertDialog`, `Dialog`, `Drawer` | [Navigation and overlays](navigation-overlays.md) | Stable 2.0.0 |
| Open a command menu, anchored interactive content, or a short hint | `Menu`, `Popover`, `Tooltip` | [Navigation and overlays](navigation-overlays.md) | Stable 2.0.0 |
| Report success/activity to the user | Toast API | [Feedback, direction and rich content](feedback-content.md) | Stable 2.0.0 |
| Configure text direction | `DirectionProvider` | [Feedback, direction and rich content](feedback-content.md) | Stable 2.0.0 |
| Render Markdown or a syntax-highlighted code block | `Markdown`, `CodeBlock` | [Feedback, direction and rich content](feedback-content.md) | Stable `sherick-ui/content` subpath; ESM only |
| Select files (not upload them) | `FileUpload` | [Forms](forms.md) | From 2.1.0 |

## Public types and boundaries

Family references also document the props and related public types exported with their
components, including `Variant` and `MediaImageProps`/`MediaVideoProps` in actions and
display; `FileUploadProps`/`FileRejection` in forms; selection option/date/item types;
navigation item/part props, `DrawerSide`, `OverlayAlign` and `OverlaySide`; and
toast/provider/manager types. `sherick-ui/content`
exports only `Markdown`, `CodeBlock`, `MarkdownProps` and `CodeBlockProps`. Rich content
is not part of the root barrel. Do not document or import `sherick-ui/dev` as consumer API.

`Select` is the fixed-choice control; `Combobox` is the searchable choice control. A
`Tooltip` is a short hint, not an accessible name or a place for interactive content.
`Spinner` indicates activity without a known completion amount; `Progress` communicates
determinate completion. `FileUpload` selects local `File` objects but does not transmit
them. Date-family values are civil `YYYY-MM-DD` strings, not timestamps. See the linked
references for exact behavior and composition.

## Version check

The consuming application's resolved package is authoritative. Read its `exports` and
declaration files, not just its semver range. Repository source is not proof of what
the app installed. Follow the [installed-version workflow](../../SKILL.md#how-to-work-with-sherick-ui)
if a reference conflicts with the installation.
