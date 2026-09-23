# Toasts, direction and rich content

Use this reference for three related families:

- the toast surface: `ToastProvider`, `ToastViewport`, `useToast`, `createToastManager()`
  and the exported Toast types;
- writing direction: `DirectionProvider` and `DirectionProviderProps`;
- the ESM-only rich-content subpath: `Markdown`, `CodeBlock`, `MarkdownProps`,
  `CodeBlockProps`.

It owns their props, defaults, states and component-specific caveats. Design, composition,
theming and accessibility rules live in [design language](../design-language.md),
[composition](../composition.md), [theming](../theming.md) and
[accessibility](../accessibility.md).

Release availability: the toast exports and `DirectionProvider` are part of the stable
`2.0.0` root barrel (`sherick-ui`), together with `ToastProviderProps`,
`ToastViewportProps`, `ToastOptions`, `ToastActionOptions`, `ToastUpdateOptions`,
`ToastPromiseOptions`, `ToastType`, `ToastPosition`, `ToastManager` and
`DirectionProviderProps`. None was added by the v2.1 wave. `Markdown` and
`CodeBlock` are stable but live only on `sherick-ui/content`, which is **ESM only**.

```tsx
import {
  DirectionProvider,
  ToastProvider,
  ToastViewport,
  createToastManager,
  useToast,
  type DirectionProviderProps,
  type ToastActionOptions,
  type ToastManager,
  type ToastOptions,
  type ToastPosition,
  type ToastPromiseOptions,
  type ToastProviderProps,
  type ToastType,
  type ToastUpdateOptions,
  type ToastViewportProps,
} from "sherick-ui";

// ESM only: CommonJS reaches it with `await import("sherick-ui/content")`.
import { CodeBlock, Markdown, type CodeBlockProps, type MarkdownProps } from "sherick-ui/content";
```

## Toast

Base UI owns the whole lifecycle — the queue and its `limit`, the auto-dismiss timer, the
live region and its priority, swipe dismissal, F6 entry/focus restoration and the
stack's own open/limited/expanded state. Sherick UI owns the surface and how the stack
moves.

### Provider, viewport and the two ways to raise

`ToastProvider` supplies the queue. `ToastViewport` is the renderer: it renders every
toast the manager holds, so **a viewport must be mounted inside the provider** or nothing
is shown. Both belong once, at the application root.

```tsx
export function App({ children }: { children: ReactNode }) {
  return (
    <ToastProvider limit={3} timeout={5000}>
      {children}
      <ToastViewport position="bottom-end" />
    </ToastProvider>
  );
}

function SaveButton() {
  const toast = useToast();

  return (
    <Button
      onClick={() =>
        toast.add({
          type: "success",
          title: "Saved",
          description: "Your changes are live.",
          actionProps: { children: "Undo", onClick: undo },
        })
      }
    >
      Save
    </Button>
  );
}
```

`useToast()` must be called beneath the provider. Its handle is stable for as long as the
provider is, so it is safe in an effect dependency list.

`createToastManager()` builds the same handle **outside** the React tree, for a fetch
wrapper, error boundary or route loader. Hand that manager to `ToastProvider`'s `manager`
prop so the one viewport renders what it raises:

```tsx
// Module scope — no React tree required.
export const toast = createToastManager();

// Anywhere, including outside a component.
toast.add({ type: "danger", title: "Upload failed", timeout: 0 });

function App({ children }: { children: ReactNode }) {
  return (
    <ToastProvider manager={toast}>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
```

Only a manager built by `createToastManager()` may be passed as `manager`; a handle from
`useToast` is already bound to the provider that gave it out, and a hand-built object
throws because it has no queue behind it.

### `ToastManager` — the handle

`add`, `update`, `close` and `promise`. Base's manager object also carries a private
subscriber channel for its store; that channel is deliberately not part of this package's
contract and is not forwarded.

| Method | Signature | Notes |
| --- | --- | --- |
| `add` | `(options: ToastOptions) => string` | Raises a toast, returns its id. |
| `update` | `(id: string, options: ToastUpdateOptions) => void` | Changes an on-screen toast. |
| `close` | `(id?: string) => void` | Dismisses one toast, or every toast when no id is given. |
| `promise` | `<Value>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) => Promise<Value>` | Reports one promise through one toast; resolves with the caller's own value and **re-rejects** on failure. |

A toast is always stacked and never anchored: Base's own add-options also accept a
positioner, a custom data bag and internal presence state, and none of those exist here.

### `ToastOptions`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Raising with an existing id updates it in place and restarts its auto-dismiss timer instead of stacking a duplicate. |
| `type` | `ToastType` (`"info" \| "success" \| "warning" \| "danger"`) | Chooses the mark and its tone. No type renders no mark. Never tints the surface. |
| `title` | `ReactNode` | Named into the toast's own `aria-labelledby`. |
| `description` | `ReactNode` | Read out through the toast's `aria-describedby`. |
| `timeout` | `number` | Milliseconds; `0` keeps the toast until it is dismissed. Falls back to the provider timeout. |
| `priority` | `"low" \| "high"` | Defaults to low. `high` interrupts rather than waiting its turn. |
| `actionProps` | `ToastActionOptions` = `{ children: ReactNode; onClick?: MouseEventHandler<HTMLButtonElement> }` | The one control in the toast that does something. |
| `onClose` | `() => void` | Runs when the toast is dismissed. |
| `onRemove` | `() => void` | Runs once the toast has left the stack, after its exit has finished. |

`ToastUpdateOptions` is `Omit<ToastOptions, "id">`.

### Provider and viewport props

`ToastProviderProps`:

| Prop | Type | Default |
| --- | --- | --- |
| `children` | `ReactNode` (required) | — |
| `limit` | `number` | Base default `3` |
| `timeout` | `number` | Base default `5000` ms |
| `manager` | `ToastManager` | — (a manager from `createToastManager()`) |

`ToastViewportProps`:

| Prop | Type | Default |
| --- | --- | --- |
| `position` | `ToastPosition` (`"bottom-end" \| "bottom-start" \| "top-end" \| "top-start"`) | `"bottom-end"` |
| `className` | `string` | — |

### Promise toasts

`promise()` opens one toast in a `loading` state, then switches it to `success` or
`error` when the promise settles. Each state is a string or a `ToastUpdateOptions`
object, and `success`/`error` may also be a function of the result/error. The loading
toast never auto-dismisses; the settled state takes the timeout from its own options or
the provider default.

```tsx
void toast
  .promise(saveDraft(), {
    loading: "Saving…",
    success: (result) => ({ type: "success", title: `Saved ${result.id}` }),
    error: (error) => ({ type: "danger", title: "Save failed", description: String(error) }),
  })
  .catch(() => undefined); // the returned promise re-rejects on failure
```

`loading`, `success` and `error` are lifecycle states Base sets itself, not roles the
caller chose; each still gets the same mark/tone treatment as the caller-facing `type`.

### State and behaviour to plan around

- The viewport is a polite live region named **Notifications** (`aria-live="polite"`,
  `aria-atomic="false"`) and advertises `aria-keyshortcuts="F6"`. Base owns F6 entry and
  focus restoration, and the region stays available while a modal is open. Keep the
  shortcut discoverable rather than reimplementing it.
- A normal toast is a `dialog`; a `priority: "high"` toast is an `alertdialog`. A toast
  with a `title` is named by that title; without one, the viewport names it from what it
  reports (Information, Success, Warning, Error, Working, or Notification).
- The collapsed stack peeks: roots are clamped to the frontmost toast's height with a
  sliver of each behind it. Hover/focus expands every root to its own height. Swipe and
  the close control are the two ways a toast leaves; the action is a decision, not a
  timeout, so pair an action toast with `timeout: 0`.
- Past `limit`, the oldest toast is not dropped: it stays mounted, is marked
  `data-limited`, becomes `inert` and leaves the reading order so it can retire.
- The surface stays neutral so the copy keeps its normal emphasis; the type's tone
  reaches only the status mark.
- A close control is always present, labelled `Dismiss`; `actionProps` renders as a
  text Button beside the copy.

## Writing direction — `DirectionProvider`

```tsx
/* <html dir="rtl"> is set by the application; the provider carries the same value. */
<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>
```

| Prop | Type | Default |
| --- | --- | --- |
| `direction` | `"ltr" \| "rtl"` (required) | — |
| `children` | `ReactNode` | — |

- It adds **no DOM element**; it declares direction to Base UI's interaction and
  positioning primitives, including portals.
- Keep it synchronized with the document's direction: `<html dir="rtl">` (or the
  application's `dir`) covers CSS and logical properties; the provider covers keyboard
  behavior and portaled placement, which a portaled surface cannot read from the DOM.
  `DirectionProvider` wraps Base UI's own `direction-provider`, whose `direction` is
  required here rather than optional/inherited.
- Physical options stay physical: Drawer sides are `left`/`right` and CodeBlock source is
  always left-to-right. RTL flips logical placements such as the toast stack's
  `start`/`end` corner, not those.

## Rich content — `sherick-ui/content`

`Markdown` and `CodeBlock` are reachable only from `sherick-ui/content`, which is
**ESM only**. The rich stack (Prism, remark/rehype, KaTeX) is a bundle boundary, not an
install boundary: a core-only import never bundles it, but installing the package installs
it regardless. `require("sherick-ui/content")` fails with
`ERR_PACKAGE_PATH_NOT_EXPORTED`; from CommonJS use `await import("sherick-ui/content")`.

### `Markdown`

```tsx
<Markdown>{`## Release notes

A paragraph with a [link](#) and \`inline code\`.

- Item one
- Item two

> A note.
`}</Markdown>
```

| Prop | Type | Notes |
| --- | --- | --- |
| `children` | `string` (required) | The markdown source itself, not React nodes. |

- Only GFM and math are enabled: `remark-gfm` (tables, strikethrough, autolinks) plus
  `remark-math` + `rehype-katex`. There is no prop for extra plugins, custom components
  or a `className`; the root wrapper is internal.
- Math and table styling come from `sherick-ui/styles.css`, which bundles a private
  KaTeX stylesheet and fonts. Without the stylesheet, math renders unstyled.
- A fenced block with a `language-*` class, or a bare fence (which markdown leaves a
  trailing newline on), routes to `CodeBlock` as a block; every other `code` is an inline
  chip.
- Headings, paragraphs, lists, quotes and rules are styled with the library's own text
  and tone roles; list indentation and the quote rule follow the writing direction.

### `CodeBlock`

```tsx
<CodeBlock language="ts">{`export const answer = 42;`}</CodeBlock>
<CodeBlock inline>npm install sherick-ui</CodeBlock>
```

| Prop | Type | Default |
| --- | --- | --- |
| `inline` | `boolean` | `false` |
| `language` | `string` | `"text"` |
| `children` | `ReactNode` | — |
| `className` | `string` | — |

- Block mode renders a surface with the language label, a Copy control, line numbers and
  horizontally scrolling highlighted source. `className` applies to that surface.
- `inline` renders a `<code>` chip; `className` applies to the chip.
- **Only the registered Prism grammars highlight**: `jsx`, `typescript`, `bash`, `css`,
  `diff`, `docker`, `git`, `go`, `graphql`, `java`, `json`, `kotlin`, `markdown`,
  `markup`, `python`, `sql`, `yaml` (plus Prism's plain-text aliases). An unknown
  language does not error — it renders as plain text under its own label. `tsx` is
  aliased to `jsx` for highlighting; the label still shows what you passed.
- Copy uses `navigator.clipboard` and silently does nothing where the API is missing;
  after copying, the control reads `Copied` for about two seconds.
- Block source is `.trim()`ed, so leading and trailing whitespace/newlines are removed.
- Source is always `dir="ltr"` with a physical line-number gutter, whatever the
  document's direction.
- The module sets `Prism.manual = true`, so importing `CodeBlock` stops Prism's own
  automatic document scan from rewriting consumer markup before hydration.

Sources: [Toast source at the pinned revision](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Toast.tsx),
[DirectionProvider](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/DirectionProvider.tsx),
[Markdown](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/Markdown.tsx),
[CodeBlock](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/packages/ui/src/components/CodeBlock.tsx),
and the [public export contract](https://github.com/Sherick16/sherick-ui/blob/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85/docs/RELEASE.md#public-export-contract).
