# Verification architecture

Sherick UI uses complementary verification layers. Each layer has a deliberately different job; passing one is not treated as evidence for another.

## Static repository checks

`bun run lint` and `bun run typecheck` protect source-level correctness, repository conventions and TypeScript compatibility. They do not prove that the package consumers install is correctly assembled.

## Library build

`bun run build` produces the published ESM, CommonJS and declaration artifacts. A successful Rollup build proves that source can be emitted, but not that Node/package export resolution works after publication.

## Showcase production build

`bun run next:build` verifies that the development showcase and the dedicated browser fixtures compile and prerender in production Next.js. The verification routes intentionally import `sherick-ui` through the public package export after the library build, rather than importing component source directly.

## Fast package smoke checks

`bun run test` exercises the local built artifact and protects deterministic design-system invariants such as token availability, Tailwind utility generation and prohibited one-off visual rules. It remains intentionally fast and repository-local.

## Packed-package consumer checks

`bun run test:packed` is the publication contract gate. It runs `npm pack`, installs the resulting tarball into a clean temporary consumer and verifies:

- ESM package import;
- CommonJS `require()` through the advertised `require` export;
- TypeScript declaration resolution under NodeNext;
- public `theme.css` and Tailwind preset exports;
- canonical and compatibility component APIs;
- Phase 2 field, value, checked, tabs and dialog prop contracts from the packed declarations;
- server rendering of initially-open and initially-closed Dialog states;
- representative Prism language registration/highlighting from the published dependency graph.

This layer exists specifically to catch problems that direct `dist` imports can hide, such as invalid file extensions, undeclared runtime dependencies or broken export maps.

## Deterministic style-contract snapshots

`bun run visual` snapshots tokens, generated utilities, component recipe markup and overlay recipes. Despite its historical script name, this is a deterministic **style-contract** regression gate, not a pixel/browser visual test. It is useful for reviewing semantic markup and class-recipe changes without browser rendering noise.

## Browser integration and visual regression

`bun run test:browser` runs Playwright against the production-built Next app in Chromium. The browser suite has two responsibilities.

The visual fixtures retain reviewed light/dark screenshots for:

- a representative core-control composition;
- an initially-open Dialog/overlay composition.

The interaction fixture verifies cross-component contracts through the public `sherick-ui` package API:

- Base-owned Field label, description, invalid and error relationships;
- controlled Search values while asynchronous/loading work is in progress;
- controlled Tabs and disabled-tab behavior;
- Base-owned Select and Switch native form submission;
- explicit Dialog descriptions;
- nested Select/Tooltip/Dialog composition, including child-overlay Escape handling before parent dismissal.

All browser tests fail on uncaught page errors or browser console errors, so hydration and runtime warnings are regressions rather than ignored noise. The closed visual fixture also asserts that a closed Dialog remains absent after hydration.

Browser snapshots are generated on Linux/Chromium in CI and committed with the test. Update them only after reviewing the visual change against `docs/DESIGN_LANGUAGE.md`.

## CI order

The normal immutable CI path is:

```bash
bun install --frozen-lockfile
cd apps/showcase && bunx playwright install --with-deps chromium
cd ../.. && bun run verify
```

`bun run verify` executes lint, typecheck, the library build, the production Next build, fast package smoke checks, packed-package verification, deterministic style-contract snapshots and browser verification.
