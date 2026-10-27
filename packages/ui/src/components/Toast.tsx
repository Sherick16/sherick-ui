"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import React, {
  useMemo,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import DismissButton from "./DismissButton";
import { Spinner } from "./Spinner";
import { StatusMark } from "./StatusMark";
import { overlay, stacking, text, type } from "./ui.common";
import { motionFeedback, motionPresenceToast } from "./ui.motion";

/**
 * What a toast is reporting. The type lands on the toast's mark and its tone — never on the surface,
 * which stays neutral so the copy is still read at its normal emphasis.
 */
export type ToastType = "info" | "success" | "warning" | "danger";

/** The corner the stack grows from, named by its **inline** ends. */
export type ToastPosition = "bottom-end" | "bottom-start" | "top-end" | "top-start";

/** What choosing a toast's action does. */
export interface ToastActionOptions {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Everything a toast can be raised with. This is the whole of what this package's renderer
 * supports: Base's own add-options also carry a positioner, a custom data bag and its internal
 * presence state, and none of those exist here — a toast is always stacked, never anchored.
 */
export interface ToastOptions {
  /**
   * Identifies the toast. Raising one with an id that already exists updates it in place and
   * restarts its auto-dismiss timer instead of stacking a duplicate.
   */
  id?: string;
  /** What it is reporting. */
  type?: ToastType;
  title?: ReactNode;
  description?: ReactNode;
  /**
   * How long it stays before dismissing itself. `0` keeps it until it is dismissed. Left unset, a
   * toast with an action or a `danger` type is sticky: its action is a decision to make and its
   * danger is one to acknowledge, so it waits. Any other toast keeps the provider's timeout.
   */
  timeout?: number;
  /** How urgently it is announced. `high` interrupts rather than waiting its turn. */
  priority?: "low" | "high";
  /** The one control in the toast that does something. */
  actionProps?: ToastActionOptions;
  /** Runs when the toast is dismissed. */
  onClose?: () => void;
  /** Runs once the toast has left the stack, after its exit has finished. */
  onRemove?: () => void;
}

/** What `update` takes: the same contract as raising one, without an id to identify it by. */
export type ToastUpdateOptions = Omit<ToastOptions, "id">;

/** The three states one promise is reported through. Each is a line or a change to the toast. */
export interface ToastPromiseOptions<Value> {
  loading: string | ToastUpdateOptions;
  success: string | ToastUpdateOptions | ((result: Value) => string | ToastUpdateOptions);
  error: string | ToastUpdateOptions | ((error: unknown) => string | ToastUpdateOptions);
}

/**
 * The handle for raising toasts. It is deliberately narrow: Base's own manager object also exposes
 * a subscriber channel for its store, which is internal machinery rather than a capability this
 * package promises to hold steady.
 */
export interface ToastManager {
  /** Raises a toast and returns its id. */
  add: (options: ToastOptions) => string;
  /** Changes a toast that is already on screen. */
  update: (id: string, options: ToastUpdateOptions) => void;
  /** Dismisses one toast, or every toast when no id is given. */
  close: (id?: string) => void;
  /**
   * Reports one promise through one toast: it arrives as `loading`, and becomes `success` or
   * `error` when the promise settles. The returned promise resolves with the caller's own value,
   * so an existing `.then` chain keeps working.
   */
  promise: <Value>(
    promise: Promise<Value>,
    options: ToastPromiseOptions<Value>
  ) => Promise<Value>;
}

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * How many toasts are shown at once. A toast past the limit stays mounted but is marked
   * `limited`, so it can retire rather than be dropped.
   */
  limit?: number;
  /** How long a toast stays before dismissing itself. `0` keeps it until it is dismissed. */
  timeout?: number;
  /** A manager built with `createToastManager`, for raising a toast from outside React. */
  manager?: ToastManager;
}

/**
 * The words a toast gives its own status when it has no title, so an assistive technology can name it.
 * Each one is the English default, and each can be replaced with the application's own wording.
 */
export interface ToastLabels {
  info: string;
  success: string;
  warning: string;
  danger: string;
  error: string;
  loading: string;
  /** The name of a toast that reports no type this library knows. */
  notification: string;
}

export interface ToastViewportProps {
  /** The corner the stack grows from. It is also the edge a toast enters and leaves through. */
  position?: ToastPosition;
  /** The accessible name of every toast's dismissal control. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** The words a toast without a title is named by, one per status. Each one overrides its English default. */
  labels?: Partial<ToastLabels>;
  /** Adds to the viewport's own layer. The toasts style themselves. */
  className?: string;
}

type BaseManager = ReturnType<typeof BaseToast.createToastManager>;

/* The four methods a Sherick manager is a view of. Base's own manager object also carries a
   subscriber channel for its store — its key is literally `" subscribe"` — and `useToastManager`
   returns the same four without it. Neither is a capability this package holds steady, so the
   view never forwards one. */
type BaseManagerMethods = Omit<BaseManager, " subscribe">;

/* The provider needs Base's own object back, and the only managers that can be handed to it are
   the ones this module built. Keeping the pair in a map rather than on the wrapper leaves the
   public type free of anything a consumer could reach for and depend on. */
const baseManagers = new WeakMap<ToastManager, BaseManager>();

/* A toast that asks for a decision, or reports a failure, must not leave before it has been read: an
   action waits to be taken and a danger waits to be acknowledged. A caller that names a timeout keeps
   it, so this is a default and not a rule. */
const stickyUnlessTimed = <T extends ToastUpdateOptions>(options: T): T =>
  options.timeout === undefined && (options.actionProps !== undefined || options.type === "danger")
    ? { ...options, timeout: 0 }
    : options;

/* A promise state is either a line, which needs no default, or an options object that can be sticky. */
const stickyState = (state: string | ToastUpdateOptions): string | ToastUpdateOptions =>
  typeof state === "string" ? state : stickyUnlessTimed(state);

const narrow = (base: BaseManagerMethods): ToastManager => ({
  add: (options) => base.add(stickyUnlessTimed(options)),
  update: (id, options) => base.update(id, stickyUnlessTimed(options)),
  close: (id) => base.close(id),
  promise: (value, options) => {
    const { loading, success, error } = options;
    return base.promise(value, {
      loading: stickyState(loading),
      success: typeof success === "function" ? (result) => stickyState(success(result)) : stickyState(success),
      error: typeof error === "function" ? (reason) => stickyState(error(reason)) : stickyState(error),
    });
  },
});

const baseOf = (manager: ToastManager): BaseManager => {
  const base = baseManagers.get(manager);
  if (!base) {
    throw new Error(
      "ToastProvider's `manager` must be one built by createToastManager(); a hand-built object has no queue behind it."
    );
  }
  return base;
};

/* The mark a toast takes from what it is reporting. Base's promise states are in this map because
   `promise()` sets them itself: loading, success and error are states of one lifecycle rather than
   roles a caller chose, and a state left out of the map would silently lose its mark and its tone.
   `loading` is the one that is not a status glyph — it is ongoing work, so it carries the same
   activity the library's `Spinner` does. Every status glyph comes from `StatusMark`, so a toast and an
   alert draw the same mark for the same status. */
const toastMark = (status: string | undefined): ReactNode => {
  switch (status) {
    case "loading":
      return <Spinner size="small" label="Loading" className={cn("size-5")} />;
    case "success":
      return <StatusMark variant="success" />;
    case "error":
    case "danger":
      return <StatusMark variant="danger" />;
    case "warning":
      return <StatusMark variant="warning" />;
    case "info":
      return <StatusMark variant="primary" />;
    default:
      return null;
  }
};

/* A toast is a dialog, and a dialog has to be named. Base names it from the `Toast.Title` part,
   so a toast raised with only a description would publish an unnamed dialog — a role with no
   accessible name. The state it reports names it instead in that case, which is what an
   assistive technology has left to announce; the description is still what it reads out, because
   Base points the toast's own `aria-describedby` at it. A toast raised with a title is untouched. */
const defaultLabels: ToastLabels = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  danger: "Error",
  error: "Error",
  loading: "Working",
  notification: "Notification",
};

const nameFor = (names: ToastLabels, status: string | undefined): string =>
  status !== undefined && Object.prototype.hasOwnProperty.call(names, status)
    ? names[status as keyof ToastLabels]
    : names.notification;

/* Where the stack sits, where a toast rests inside the viewport, and which way it grows. A stack
   anchored to the bottom grows upward and a toast leaves downward, so one signed factor carries
   both the resting offset and the edge a new toast arrives from. The horizontal inset is
   **inline**: the corner is named by the writing direction's own ends, so `bottom-end` is the
   right on a left-to-right page and the left on a right-to-left one, and the stack never sits
   against the wrong edge. */
const positionLayout: Record<
  ToastPosition,
  { viewport: string; anchor: string; sign: string; from: string }
> = {
  "bottom-end": {
    viewport: "bottom-6 end-6",
    anchor: "bottom-0 end-0 origin-bottom",
    sign: "[--sui-toast-stack-sign:-1]",
    from: "[--sui-toast-from-y:150%]",
  },
  "bottom-start": {
    viewport: "bottom-6 start-6",
    anchor: "bottom-0 start-0 origin-bottom",
    sign: "[--sui-toast-stack-sign:-1]",
    from: "[--sui-toast-from-y:150%]",
  },
  "top-end": {
    viewport: "top-6 end-6",
    anchor: "top-0 end-0 origin-top",
    sign: "[--sui-toast-stack-sign:1]",
    from: "[--sui-toast-from-y:-150%]",
  },
  "top-start": {
    viewport: "top-6 start-6",
    anchor: "top-0 start-0 origin-top",
    sign: "[--sui-toast-stack-sign:1]",
    from: "[--sui-toast-from-y:-150%]",
  },
};

/**
 * Supplies the queue a toast is raised into. Wrap the application: a toast is raised by calling
 * `useToast` anywhere beneath this, or by handing `createToastManager`'s manager in as `manager`
 * so code outside React can raise one too.
 *
 * Base UI owns the whole lifecycle — the queue and its limit, the auto-dismiss timer, the live
 * region and its priority, swipe dismissal and the stack's own state; Sherick UI owns the surface
 * and how the stack moves.
 */
export const ToastProvider = ({ children, manager, ...props }: ToastProviderProps) => (
  <BaseToast.Provider {...props} toastManager={manager ? baseOf(manager) : undefined}>
    {children}
  </BaseToast.Provider>
);

/**
 * The stack, and the only place a toast is rendered. Put one inside `ToastProvider` at the root of
 * the application: `useToast().add(...)` raises a toast, and this renders every toast the manager
 * is holding. Base provides F6 entry and focus restoration; the live region remains available
 * while a modal is open. Keep the keyboard shortcut discoverable without reimplementing it.
 */
export const ToastViewport = ({
  position = "bottom-end",
  dismissLabel = "Dismiss",
  labels,
  className,
}: ToastViewportProps) => {
  const { toasts } = BaseToast.useToastManager();
  const geometry = positionLayout[position];
  const names: ToastLabels = { ...defaultLabels, ...labels };

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        aria-keyshortcuts="F6"
        className={cn(
          "fixed flex w-[calc(100%-3rem)] flex-col sm:w-[22.5rem]",
          stacking.notification,
          geometry.viewport,
          className
        )}
      >
        {toasts.map((toast) => {
          const mark = toastMark(toast.type);

          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              aria-label={toast.title ? undefined : nameFor(names, toast.type)}
              className={cn(
                /* The stack's own geometry: each toast is anchored to the same viewport corner,
                   sits one shortened step behind the one in front of it, and the stack clamps every
                   root to the frontmost toast's height so a collapsed stack shows one surface with
                   a sliver of each of the others. Expanding rests every root at its own height
                   again. The signed factor is the only difference between a stack that grows up and
                   one that grows down. */
                "[--gap:0.75rem] [--peek:0.75rem]",
                "[--scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
                "[--shrink:calc(1-var(--scale))]",
                "[--height:var(--toast-frontmost-height,var(--toast-height))]",
                "[--offset-y:calc(var(--sui-toast-stack-sign)*(var(--toast-offset-y)+var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y,0px))]",
                "absolute z-[calc(1000-var(--toast-index))] w-full select-none overflow-hidden",
                geometry.anchor,
                geometry.sign,
                geometry.from,
                "[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)+var(--sui-toast-stack-sign)*(var(--toast-index)*var(--peek)+var(--shrink)*var(--height))))_scale(var(--scale))]",
                "h-[var(--height)] data-[expanded]:h-[var(--toast-height)]",
                "data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--offset-y))]",
                "data-[limited]:opacity-0",
                overlay.toast,
                motionPresenceToast
              )}
            >
              {/* The content is never sized to the root. The root's height is what the stack
                  animates and clamps, and the primitive measures this element's own height to
                  decide both — sizing it to the root would make the measurement follow the value
                  it produces. It is clipped by the root while the stack is collapsed, which is
                  what a peek is. */}
              <BaseToast.Content
                className={cn(
                  "flex max-h-[calc(100dvh-3rem)] items-start gap-3 overflow-y-auto overscroll-contain p-4 [overflow-wrap:anywhere]",
                  motionFeedback,
                  "data-[behind]:opacity-0 data-[expanded]:opacity-100"
                )}
              >
                {/* The status mark is a first-line mark: the slot takes the height of whichever line
                    comes first — the title when there is one, the description otherwise — so the mark
                    is centred on that line and a wrapped toast never pulls it into the middle. */}
                {mark ? (
                  <span className={cn("inline-flex h-6 shrink-0 items-center")}>{mark}</span>
                ) : null}
                {/* The copy beneath the title is one title rhythm (4px) below it, so the two read as one
                    message; the action follows the copy at the next step up. */}
                <div className={cn("flex min-w-0 flex-1 flex-col gap-1")}>
                  {toast.title ? (
                    <BaseToast.Title className={cn(type.title, text.high)} />
                  ) : null}
                  {toast.description ? (
                    <BaseToast.Description className={cn(type.body, text.medium)} />
                  ) : null}
                  {toast.actionProps ? (
                    /* Actions follow the copy instead of squeezing it between three controls.
                       Give back the small text button's start padding, moving the whole target. */
                    <BaseToast.Action
                      render={
                        <Button appearance="text" variant="primary" size="sm" className={cn("-ms-4 mt-1 self-start")}>
                          {toast.actionProps.children}
                        </Button>
                      }
                    />
                  ) : null}
                </div>
                {/* The stack has a close control of its own, so a toast can always be dismissed
                    without reaching for the action it happens to carry. Its target is centred on
                    the first line, with its excess given back on both vertical edges: a top-only
                    offset leaves 10–12px below a one-line toast. The 44px target stays intact, and
                    its inline end padding is compensated separately. */}
                <BaseToast.Close
                  render={
                    <DismissButton
                      label={dismissLabel}
                      size="compact"
                      inRow
                      /* Half the target minus half the first line: the title and the description both
                         set a 24px line, so the target gives back 10px either way. */
                      className={cn("-me-2 -my-2.5")}
                    />
                  }
                />
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
};

/**
 * Raises, updates and closes toasts from inside the React tree. The handle is stable for as long as
 * the provider is, so it can be listed as a dependency without churning an effect.
 */
export const useToast = (): ToastManager => {
  const base = BaseToast.useToastManager();
  return useMemo(() => narrow(base), [base]);
};

/**
 * Builds a manager that lives outside the React tree, so a plain function — a fetch wrapper, an
 * error boundary, a route loader — can raise a toast. Hand it to `ToastProvider`'s `manager` so the
 * same viewport renders what it raises.
 */
export const createToastManager = (): ToastManager => {
  const base = BaseToast.createToastManager();
  const manager = narrow(base);
  /* Only a manager built here can be handed back to a provider, because only this one has a queue
     on the other side of it. A handle from `useToast` is already bound to the provider that gave
     it out, so it is deliberately not registered. */
  baseManagers.set(manager, base);
  return manager;
};
