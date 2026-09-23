# Component-reference cold-start scenarios

Evaluation prompts for the consumer skill. Give an agent only the task prompt and a
portable copy of `skills/sherick-ui/`; do not provide repository-maintainer context or
point it directly at reference answers. The notes after each prompt are evaluator criteria,
not part of the prompt. A successful answer chooses a valid API, follows the right reference,
and checks installed-version availability before recommending unreleased exports.

## 1. Fixed choice or searchable choice

**Prompt:** In a settings form, a user must choose one of 30 known workspaces. They should be
able to type to narrow the list, and the selected workspace must submit with the form. Which
Sherick component should I use, and how should I manage its value?

**Look for:** routes to `selection.md`; chooses `Combobox` rather than `Select`; identifies
searchable input and single-value controlled/uncontrolled contract, form/name behavior and
Field composition; does not infer props from Base UI.

## 2. Icon-only action

**Prompt:** Add a compact refresh icon next to a heading. It performs an action and has no
visible text. Which component and what must the example provide?

**Look for:** routes to `actions-display.md`; uses `IconButton`, supplies an accessible name
(e.g. `aria-label`), and does not use a passive Badge or invent `onPress`/`asChild` APIs.

## 3. File selection on a stable install

**Prompt:** The app is pinned to `sherick-ui@2.0.0`. Add drag-and-drop selection of multiple
PDFs, show chosen names, and let the form submit the selected files. Can I use Sherick's
file component, and what remains app-owned?

**Look for:** identifies `FileUpload` as unreleased v2.1 and does not recommend it for stable
2.0 without verifying the installed exports; distinguishes selection from upload and native
form submission; proposes no fictional hidden-input contract. Routes to `forms.md`.

## 4. One command from many actions

**Prompt:** A command menu filters application actions as the user types. Selecting an action
runs it and must not replace the search query. Should I use Combobox or Command, and is it
available from the stable package?

**Look for:** chooses `Command` for actions rather than a value choice, distinguishes it from
`Combobox`, routes to `selection.md`, labels Command as unreleased v2.1, and checks the
resolved package before use.

## 5. Confirmation vs general modal

**Prompt:** A destructive delete asks for a clear confirm/cancel decision; clicking outside
must not silently discard the decision. Which overlay fits, and who owns open state?

**Look for:** routes to `navigation-overlays.md`; chooses `AlertDialog`, not a generic Dialog
or Tooltip/Popover; accurately describes its dismissal constraints, public compound parts,
controlled/uncontrolled state where present, and avoids local focus/dismissal machinery.

## 6. Loading vs determinate completion

**Prompt:** A report export is running but has no known completion percentage. Which component
should render, and when would Progress be the right choice instead?

**Look for:** routes to `actions-display.md`; chooses `Spinner` for indeterminate activity,
`Progress` only for determinate completion, and keeps operation state in the application.

## 7. Date-range state and release check

**Prompt:** Add a start/end date filter with a calendar popup. The API should store dates without
time zones and support null endpoints. What value shape should the app own, and can a 2.0.0
consumer import it?

**Look for:** routes to `selection.md`; describes civil `YYYY-MM-DD` values and the
`{ start, end }` range with nullable endpoints; identifies the date family as unreleased v2.1
and verifies installed package availability rather than treating repository source as release.

## 8. Hierarchy vs disclosure

**Prompt:** Build a keyboard-navigable file-category hierarchy where users select a node and
expand branches independently. Is Accordion the right component, and are focus and selection
the same state?

**Look for:** routes to `navigation-overlays.md`; selects `TreeView`, not Accordion; keeps
selected value separate from expanded values and focus; notes v2.1 availability and checks
the installed version.

## 9. Toast ownership and rich-content boundary

**Prompt:** Show a save-success toast from a nested form and render Markdown in a help panel.
Which exports/subpaths and app-level setup are required?

**Look for:** routes to `feedback-content.md`; mounts ToastProvider and ToastViewport at the
app root and uses `useToast` or a correctly configured manager; imports Markdown from
`sherick-ui/content`, not the root barrel; notes the content subpath is ESM-only.

## 10. Navigation vs in-place choice

**Prompt:** A left rail moves between application routes; another row of controls switches
among three panels on the current page. Which components represent each interaction?

**Look for:** routes to `navigation-overlays.md`; uses `NavGroup`/`NavItem` for destinations
and `Tabs` for in-place panels, not SegmentedControl for navigation; keeps router state
application-owned.

## 11. Content image and ambient video

**Prompt:** Replace a raw hero image and a looping background video with Sherick presentation.
The image conveys information, but the video is atmosphere only. How should they be
rendered, and is the component available to an app pinned to `sherick-ui@2.0.0`?

**Look for:** routes to `actions-display.md#media`; uses `Media.Image` with meaningful
`alt` and `Media.Video` with `autoPlay muted loop decorative`, without controls;
keeps Hero placement in the application, does not force video cropping without explicit
`aspect`/`fit`, and checks installed exports since Media is unreleased in 2.0.0.
