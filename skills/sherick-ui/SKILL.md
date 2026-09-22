---
name: sherick-ui
description: >-
  Builds, integrates and reviews React application UI using the sherick-ui package.
  Use when setting up Sherick UI or changing screens, component composition, styling,
  themes or accessibility in an application that uses it. Not a guide to maintaining
  the library itself or to unrelated backend work.
metadata:
  source-revision: "b1c201bc0ef2c755b508a968b90f8a02f2cd2d85"
---

# Consuming Sherick UI

Sherick UI is a React component library with a soft tonal visual language and
integrated interaction mechanics. Build application UI with its public components;
this skill explains how to preserve the system when composing them.

## How to work with Sherick UI

1. Inspect the application's instructions, resolved `sherick-ui` dependency, CSS entry
   point, theme owner and existing UI patterns. A manifest range is not an installed
   version; a component on repository `main` is not proof it has been released.
2. Load only the references relevant to the task below. For an unfamiliar API, follow
   the component index. Installed exports and declarations determine availability;
   verify behavior against matching-version documentation/source, not another library's
   similarly named API. Report a mismatch rather than inventing a prop or alias.
3. Reuse the application's established compositions and change only the requested UI.
   Run its relevant type/build checks and inspect affected rendered states at the
   widths, themes and input modes the change touches. Report checks not performed.

## Consumer rules

- Use `sherick-ui` for core components and types. Rich content uses
  `sherick-ui/content`, which is ESM-only. Do not depend on `sherick-ui/dev`, internal
  recipes, private classes such as `.sui-scope`, or Base UI imports to use Sherick UI.
- Prefer existing Sherick components to local lookalikes. The application owns page
  layout and content; components own their anatomy and widget mechanics. Customize
  through declared public props and supported theme variables, not private DOM hooks.
- Keep UI **quiet by default, expressive where it matters**. Emphasis follows task
  priority, semantic color carries meaning, and hover is not selection.
- Preserve accessible names, semantic relationships, keyboard operation, visible
  focus and usable hit areas when composing or overriding a component.

## Load by task

Paths are relative to this skill folder. Do not load the whole reference set or the
repository's maintainer documentation for every task.

| Task | Read |
| --- | --- |
| Create or substantially restyle UI; judge visual consistency | [Design language](references/design-language.md) |
| Assemble screens, forms, navigation or nested/responsive surfaces | [Composition](references/composition.md) |
| Install/integrate CSS; debug styling; change themes or tokens | [Theming and integration](references/theming.md) |
| Add/change controls, labels, focus, overlays, direction or accessibility | [Accessibility](references/accessibility.md) |
| Choose/configure a component or check its API and states | [Component index](references/components/index.md) |

The component index is a foundation-only handoff until the component-reference pass
populates it. It supplies an installed-package lookup path in the meantime.
