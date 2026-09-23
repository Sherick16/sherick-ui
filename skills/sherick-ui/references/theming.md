# Theming and integration

Use this reference for installation, stylesheet problems, theme selection and visual
customization. It owns the integration procedure and CSS-variable contract.

## Integrate the finished CSS

Add `sherick-ui` using the application's package manager. Check the installed
package's peer dependencies; the source baseline supports React and React DOM 18/19.
Load the complete stylesheet once at the application's CSS entry point:

```tsx
import "./app.css";
import "sherick-ui/styles.css";
```

Any host/framework/reset/Tailwind CSS goes first, Sherick second. The first import is
unnecessary when the application has no stylesheet. A dedicated application override
stylesheet may follow Sherick. Do not reverse the host/Sherick order to fix a local
conflict: independently emitted host utilities can otherwise change component anatomy.

Consumers need no Tailwind preset, package scanning, Base UI setup or host reset.
Sherick ships compiled, scoped CSS; it does not style arbitrary application children
or generate utility classes supplied by callers. Application Tailwind classes still
need the application's own build. `styles.css` already includes theme variables;
`sherick-ui/theme.css` is for token-only use, not a replacement for component styling.

## One document-level theme owner

There is no required React theme provider. Select the theme on the document root:

```ts
// Force a theme.
document.documentElement.dataset.sherickTheme = "light";
document.documentElement.dataset.sherickTheme = "dark";

// Return to the operating-system preference.
document.documentElement.removeAttribute("data-sherick-theme");
```

Absence of the attribute follows `prefers-color-scheme`. Do not set its value to
`"system"` or assume a host `.dark` class controls Sherick. Integrate with the
application's existing preference owner rather than adding competing theme state.
Persistence is application-owned; apply a stored choice before first paint using
the framework's supported mechanism, and tolerate unavailable storage.

Overlays portal outside ordinary application wrappers. Set theme variables at
document/root level so fields and their popups agree. Nested isolated theme islands
are not a supported contract, even though CSS variables can inherit locally.

## Consume roles, not copied palette values

Application-owned content can use the same semantic variables:

```css
body {
  background-color: oklch(var(--sui-canvas));
  color: oklch(var(--sui-ink));
}

.supporting-copy {
  color: oklch(var(--sui-ink-muted));
}
```

Core color variables contain **OKLCH channels**, not complete CSS colors. For example,
`--sui-primary` expects `L C H`; consume it as `oklch(var(--sui-primary))`. Do not put
`#hex`, `rgb(...)` or `oklch(...)` into a channel-valued variable.

Not every variable has that format: `--sui-code-*` values are complete colors,
`--sui-elevation-*` complete shadow values, durations carry time units and blur values
carry lengths. Inspect the installed `theme.css` before overriding an unfamiliar role.
Use `var(--sui-elevation-raised)` as a shadow, not as an OKLCH color.

The main role families are canvas/surfaces, readable ink, non-text detail, primary and
semantic colors with their `on-*` foregrounds, focus, lighting/elevation, acrylic,
motion and rich-content syntax colors. Shape and density recipe names are not public
imports or evidence of CSS variables named after them. Do not invent `--sui-radius`
or a spacing-token API that the package does not publish.

## Override at the theme boundary

Theme defaults occupy the low-priority `sherick-ui-theme` layer. Ordinary unlayered
root CSS can override documented `--sui-*` variables without `!important`. Scope a
forced-dark palette to `:root[data-sherick-theme="dark"]`; to support system dark too,
apply the same overrides to `:root:not([data-sherick-theme])` inside
`@media (prefers-color-scheme: dark)`. A root override without a condition affects both
themes. Light and dark are separately designed palettes, not an automatic inversion.

Retune related roles together: primary, primary-strong, on-primary and focus must
remain coherent. Check the resulting compositions, including pressed states, rather
than judging a brand swatch alone. [Accessibility](accessibility.md#protect-targets-and-perceptual-states)
owns contrast checks.

`--sui-light-top` and `--sui-light-bottom` retune the shared elevation lighting.
Acrylic uses its separate `--sui-glass-*` family and `--sui-overlay-fill`; changing the
light pair does not retune every acrylic value. Preserve floating-content isolation
over busy backgrounds even without backdrop blur. Motion uses the existing duration
and easing variables, not per-component animation replacements.

Use `className`/`style` where the public type declares them for application-specific
adjustments. Supported Tailwind conflicts are merged by the component. Scope selector
overrides to application-owned classes and preserve anatomy/state treatment. Do not
edit generated CSS or copy the showcase's private recipes as a consumer theming layer.

Sources: [consumer integration](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/README.md),
[authored tokens](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/styles/tokens.ts)
and [stylesheet generation](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/scripts/build-styles.ts).
