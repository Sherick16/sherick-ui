# Design language

Use this reference for visual decisions. These are consumer consequences of Sherick
UI's canonical language, not a second set of component-authoring rules.

## Hierarchy, material and depth

Ordinary information and fields stay neutral and matte. Reserve the strong accent
fill for the primary task; supporting actions should not compete with it. `primary`
carries interaction and priority, `accent` supporting emphasis, and danger/warning/
success task or data meaning. Put semantic emphasis on the relevant alert, badge or
cell, not an entire page or table.

Material, elevation and edge answer different questions: what fills a surface, how
far it sits from the page, and where two parts meet. A different surface tone does
not imply a different elevation.

- Grounded content uses matte surfaces, separated by tone. Passive cards stay flat;
  grooves and wells can be recessed because that is their anatomy.
- Tactile controls have shallow depth. Held choices have a selected surface, while
  transient hover/highlight and navigation-only current rows do not acquire depth.
- Acrylic belongs to genuinely floating UI, not an important-looking grounded card.
  Anchored popups and viewport-owning overlays already have appropriate shells.
- Structural hairlines separate parts within a surface. Use the public `Divider`
  rather than decorating cards or filled controls with rims. Focus and forced-colors
  indicators are accessibility treatment, not decorative borders.

Depth follows one overhead light source. Keep the library's related shadows and
highlights rather than adding unrelated drop shadows to make something stand out.

## Text, shape and density

There are two readable text roles: `--sui-ink` for labels/values and
`--sui-ink-muted` for supporting copy. `--sui-detail` is non-text graphical detail,
not a faint third text color. Do not mute readable copy with arbitrary opacity.

The runtime is font-agnostic. The application chooses its font and content type
hierarchy; the showcase's font is not a dependency. A control's density owns its type
step, not the typography of the whole application.

Shape follows the object's extent and role: compact marks/rows are tighter than
fields, content surfaces are softer, and free-floating dialogs differ from
edge-attached sheets. Keep equivalent siblings consistent. Do not turn every object
into a pill or apply a blanket radius override to unrelated components.

The control rhythm is compact (2.5rem), normal (3rem) and prominent (3.5rem) minimum
height. Use sizes the particular component actually exposes; this is not a universal
`density` prop. Interaction-target constraints belong to [accessibility](accessibility.md#protect-targets-and-perceptual-states).

Spacing, padding, intrinsic size, responsive arrangement and content typography are
anatomy, not a published universal spacing scale. Keep the component's intentional
internal spacing; choose application gaps around it. Do not derive every button's
padding from a field's or remove breathing room to simulate consistency.

## Alignment and constrained layouts

Judge the rendered result, not just equal CSS numbers. In application-owned rows,
align an icon that belongs to text with its first readable line; an affordance that
owns the whole row, such as a disclosure chevron, stays centered on that row.
Keep icon-slot geometry stable when content changes to a loading mark. Artwork's
internal whitespace is not a reason to apply a global icon translation.

Responsive decisions follow available container width, not the device name. Let
readable copy wrap and preserve the next action instead of shrinking controls or
clipping a desktop layout. Inherently wide content may scroll locally; detailed
layout choices belong to [composition](composition.md#let-content-determine-the-layout).

## Interaction and motion

Hover changes tonality, not size, borders or elevation. Selection, keyboard highlight
and the current navigation destination are different states; do not repaint all of
them as the same opaque primary fill. Press responses already account for whether
the part is raised, flat or floating. Disabled treatment must not be compounded by
additional wrapper opacity.

Motion follows intent: feedback, tactile response, mark arrival, orientation,
relocation, direct manipulation, disclosure, surface presence or activity. Preserve
the library's existing responses instead of layering on row staggering, bouncing
panels or a second transform on an animated part. Large surfaces and moving value
controls do not spring past their destination. Reduced-motion behavior belongs to
[accessibility](accessibility.md#protect-targets-and-perceptual-states).

Source: [canonical design language, sections 1–13 and 16–19](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/DESIGN_LANGUAGE.md).
