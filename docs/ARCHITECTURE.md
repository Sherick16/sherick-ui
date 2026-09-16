# Sherick UI architecture

## Repository boundaries

Sherick UI is a two-workspace repository by design:

- `packages/ui` is the only publishable package. It owns reusable source, package metadata, tokens, Tailwind preset, Rollup/declaration builds and package-level verification.
- `apps/showcase` is a private Next.js workbench and browser fixture. It owns Next configuration, showcase-only layout, Playwright tests and visual specimens.
- `docs` and repository policy remain at the root. No monorepo orchestrator is required; Bun workspaces provide the dependency graph and script routing.

## Dependency direction

The allowed direction is `apps/showcase -> sherick-ui`. Library source must never import Next.js, showcase code or application aliases. Internal library modules import sibling/private modules rather than the package's public barrel.

The showcase consumes `sherick-ui` through package exports. Its only privileged surface is `sherick-ui/dev`, an explicitly unstable development-only export for the workbench's design-language specimens (recipes and `cn`). Production consumers should not depend on that subpath.

## Build and client boundaries

The library build starts at `packages/ui/src/index.ts` (plus the development-only `src/dev.ts`) and emits preserved ESM/CJS modules. Rollup does not add a package-wide `"use client"` banner. Source modules that genuinely require a client boundary keep their own directive; passive components remain server-usable.

The library TypeScript configs contain no Next plugin or generated `.next` types. The showcase has its own Next-specific TypeScript config.

## Styling ownership

`docs/DESIGN_LANGUAGE.md` remains canonical. `packages/ui/src/components/ui.common.ts` owns reusable recipes and `packages/ui/theme.css` owns runtime tokens. The workspace split does not change the visual language or the current Tailwind consumer contract.

## Adding components

Reusable components belong under `packages/ui/src/components` and are exported from that package's public barrel. Showcase specimens belong under `apps/showcase`; application-only layout never enters the published package. A new component must not require Next.js or showcase code to build, typecheck, test or publish.

## Verification

The root `bun run verify` builds the library before the showcase, then runs the Phase 0 package/tarball/style/browser gates. The packed-package test remains the publication boundary: workspace resolution alone is never accepted as proof that npm consumers can install the package. See `docs/VERIFICATION.md`.
