# Composition

Use this reference when assembling an application interface from Sherick components.
It owns composition decisions, not component signatures or the visual token system.

## Keep the application and component responsibilities separate

The application owns page structure, landmarks, content widths, grids, surrounding
spacing, product state and content typography. Sherick owns the controls' internal
arrangement, visual states and widget mechanics. Use existing application layout
primitives before introducing a new wrapper; extract a reusable composition when it
represents an actual repeated product pattern, not just to rename a Sherick component.

Use a component's declared props and compound parts before recreating its behavior.
Verify the available composition API rather than assuming Radix/shadcn conventions
such as `asChild`, or that every Sherick wrapper exposes all Base UI props. Use the
[component index](components/index.md) for the exact contract.

## Group by purpose, not by wrappers

Use spacing and headings to relate content before adding another surface. A `Card`
is a matte content surface, not a compulsory wrapper for every section. Navigation
groups bring structure into their parent surface; enclosing each in another card
changes that hierarchy. Use `Divider` when two parts of one surface need a join,
not as a substitute for spacing around every element.

For example, a settings section can have an application heading, a group of Sherick
fields and a local action row. It does not need a separate card around each field or
equally strong styling for Save and Cancel. Keep labels, supporting copy and errors
with the control they explain; use [accessibility](accessibility.md#names-relationships-and-form-semantics)
for naming/validation composition rather than adding a second label system.

Choose interactions by purpose: a destination is navigation, a command performs an
action, and a choice holds a value. A short non-interactive hint belongs in a
`Tooltip`; interactive supplemental content needs a `Popover` or an appropriate
modal surface. Do not hide essential instructions in a tooltip.

## Let content determine the layout

Give shrinkable application flex/grid children `min-width: 0` where their automatic
minimum would cause overflow; use shrinkable grid tracks such as `minmax(0, 1fr)`.
The components cannot repair a fixed-width application child or an oversized grid
column around them.

Allow descriptions, errors and body copy to wrap, including long identifiers. Do
not truncate explanatory text to conceal overflow. Bounded values and navigation
labels may use their component's intentional truncation. Preserve local scrolling
for inherently wide tables, code and tracks; do not apply blanket `overflow: hidden`
to the page, clip focus indicators or hide the next action offscreen.

Adapt the surrounding layout when a sidebar or phone column is too narrow. Keep
the component's own responsive behavior and reachable scroll origin in long modal
content instead of forcing fixed heights or shrinking targets. Check long labels,
validation messages and loading content, not only empty default specimens.

## Compose overlays without rebuilding their infrastructure

Let Sherick own portals, positioning, dismissal and focus behavior. Existing nested
interaction surfaces use portal ordering at a shared stacking level; ranking dialogs
above menus with application CSS can hide a menu opened inside a dialog. Notifications
have a separate persistent stacking role, not a pattern to copy for every overlay.

Avoid extra focus traps, Escape listeners, exit timers or portal reparenting around
an existing component. Application-controlled open state is legitimate where the API
supports it; duplicating the primitive's internal lifecycle is not.

Keep application CSS away from internal overlay geometry. Test a nested popup in its
actual parent surface; looking correct in isolation does not verify clipping,
stacking, theme inheritance or focus restoration.

## When a primitive does not cover the requirement

First check the installed API and the application's existing compositions. Use native
semantics for ordinary application content rather than inventing a widget. A genuinely
missing reusable visual/behavioral primitive is a library gap to report, not permission
to import workbench recipes or patch private descendants. Keep unavoidable application
extensions local and explicit; do not describe them as supported Sherick API.

Sources: [design language, sections 7–11 and 16–19](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/DESIGN_LANGUAGE.md)
and [published consumer contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/README.md).
