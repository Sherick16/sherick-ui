# Accessibility

Use this reference when composing controls, forms, overlays or directional UI, and
when styling could affect interaction. Sherick's tested component behavior is not
a conformance guarantee for the application around it.

## Names, relationships and form semantics

Supply an accessible name for every control, including icon-only actions. Prefer
visible labels where appropriate; a tooltip supplements discovery and does not replace
a name. Keep the accessible name consistent with the visible wording. Localize the
labels and instructions the application supplies.

Use the component's own label/description/error interface where offered, or the
documented `Field` composition for a single control. Do not add a second field wrapper
around a component that already owns one. Keep generated IDs and descriptive/error
relationships intact; inspect the exact component contract instead of manually
overwriting them. `Field.required` displays the mark only: the actual control must
also receive `required`. A group of controls needs its group-label contract, not a
single-control label attached to an arbitrary member.

Compose one interactive target per action. Do not nest a dismissal button inside
another button or make a clickable container swallow its children's keyboard and
pointer behavior. With supported custom triggers, preserve the props, handlers and
ref the documented composition mechanism supplies.

## Preserve focus and interaction

Sherick uses one 2px focus language. Its placement depends on anatomy: an inset
indicator inside a surface, an outer indicator for a standalone control, or engagement
of a value-holding field. A text field may show focus after a pointer click; a select
can stay indicated while its popup holds focus. Do not force every component into a
uniform keyboard-only rule or add a second outline around a composite field.

Do not clip rings with application overflow or obscure the focused control beneath
sticky content. Preserve the component's keyboard navigation, dismissal and focus
restoration instead of adding parallel focus/keyboard machinery. An unavailable
collection option may remain navigable so it can be discovered and announced: disabled
does not universally mean removed from keyboard navigation. Pass the real disabled or
read-only state through its supported API, not just a visual class.

For RTL, keep `<html dir="rtl">` and
`<DirectionProvider direction="rtl">` (from `sherick-ui`) synchronized. The document
direction covers CSS; the provider covers keyboard behavior and portaled placement.
Use logical properties for application layout. Physical placement options remain
physical, and source-code content remains left-to-right.

## Protect targets and perceptual states

The standalone icon-action target is 2.75rem square (44px at a 16px root). Embedded
field parts have their own geometry; do not reuse their narrower width for a standalone
action. Visible checkbox/radio marks can be smaller than their expanded hit areas:
leave enough space around them so clipping or adjacent rows cannot steal clicks. In
particular, a compact 40px table row does not by itself provide 44px vertical clearance.

This is Sherick's design contract, not a claim that WCAG AA requires 44px everywhere.
[WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
uses a 24×24 CSS-pixel minimum with specified exceptions, including spacing.

Keep labels, icons or position alongside meaningful color. After theme/opacity changes,
check text against its actual composited surface, including hover/pressed states:
normal text needs 4.5:1, large text 3:1, and meaningful non-text indicators generally
3:1 against adjacent colors. The authored palette's tested pairings do not certify
new application pairings. See WCAG [text contrast](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Preserve forced-colors fallbacks: Sherick replaces lost tone/depth with system-color
selection and focus boundaries. A decorative-border cleanup must not remove these.
Respect `prefers-reduced-motion`: remove nonessential travel/interpolation while
retaining the resulting state and status information, not by hiding feedback entirely.

## Check the composed result

Use the application's existing accessibility/browser checks, then exercise the changed
flow with keyboard and pointer. Check names and errors, focus entering/leaving overlays,
nested popups, and reachability at narrow widths and increased text/zoom. Include RTL,
forced colors and reduced motion when the change touches those contracts. A clean
automated scan does not replace these interaction checks.

Sources: [design language, sections 13–14 and 17–19](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/DESIGN_LANGUAGE.md),
[Field implementation](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Field.tsx),
[WAI naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
and [WCAG focus-not-obscured guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).
