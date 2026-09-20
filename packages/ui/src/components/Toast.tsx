"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import React, {
  useMemo,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import { Spinner } from "./Spinner";
import {
  density,
  focusRingInset,
  overlay,
  shape,
  stacking,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress, motionPresenceToast } from "./ui.motion";

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
  /** How long it stays before dismissing itself. `0` keeps it until it is dismissed. */
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

export interface ToastViewportProps {
  /** The corner the stack grows from. It is also the edge a toast enters and leaves through. */
  position?: ToastPosition;
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

const narrow = (base: BaseManagerMethods): ToastManager => ({
  add: (options) => base.add(options),
  update: (id, options) => base.update(id, options),
  close: (id) => base.close(id),
  promise: (value, options) => base.promise(value, options),
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

/* The mark a toast takes from what it is reporting, and the tone that goes with it. Base's promise
   states are in this map because `promise()` sets them itself: loading, success and error are
   states of one lifecycle rather than roles a caller chose, and a state left out of the map would
   silently lose its mark and its tone. `loading` is the one that is not a status glyph — it is
   ongoing work, so it carries the same activity the library's `Spinner` does. */
const markIcon = (Icon: LucideIcon, className: string) => (
  <Icon aria-hidden="true" className={cn("size-5 shrink-0", className)} />
);

const toastMark = (type: string | undefined): ReactNode => {
  switch (type) {
    case "loading":
      return <Spinner size="small" className={cn("size-5")} />;
    case "success":
      return markIcon(CheckCircle2, tone.text.success);
    case "error":
    case "danger":
      return markIcon(XCircle, tone.text.danger);
    case "warning":
      return markIcon(AlertTriangle, tone.text.warning);
    case "info":
      return markIcon(Info, tone.text.primary);
    default:
      return null;
  }
};

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
 * is holding.
 */
export const ToastViewport = ({ position = "bottom-end", className }: ToastViewportProps) => {
  const { toasts } = BaseToast.useToastManager();
  const geometry = positionLayout[position];

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        className={cn(
          "fixed flex w-[calc(100vw-2rem)] flex-col sm:w-[22.5rem]",
          stacking.float,
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
                  "flex items-start gap-3 p-4",
                  motionFeedback,
                  "data-[behind]:opacity-0 data-[expanded]:opacity-100"
                )}
              >
                {/* The status mark is a first-line mark: the slot takes the height of whichever line
                    comes first — the title when there is one, the description otherwise — so the mark
                    is centred on that line and a wrapped toast never pulls it into the middle. */}
                {mark ? (
                  <span className={cn("inline-flex shrink-0 items-center", toast.title ? "h-5" : "h-6")}>{mark}</span>
                ) : null}
                <div className={cn("flex min-w-0 flex-1 flex-col gap-0.5")}>
                  {toast.title ? (
                    <BaseToast.Title className={cn("text-sm font-medium", text.high)} />
                  ) : null}
                  {toast.description ? (
                    <BaseToast.Description className={cn("text-sm leading-6", text.medium)} />
                  ) : null}
                </div>
                {toast.actionProps ? (
                  /* The action is the one control in a toast that does something, so it is a
                     `Button` in its text appearance. The action's label and handler are Base's;
                     only where it sits is the toast's. */
                  <BaseToast.Action
                    render={
                      <Button appearance="text" variant="primary" size="sm">
                        {toast.actionProps.children}
                      </Button>
                    }
                  />
                ) : null}
                {/* The stack has a close control of its own, so a toast can always be dismissed
                    without reaching for the action it happens to carry. */}
                <BaseToast.Close
                  aria-label="Dismiss"
                  className={cn(
                    density.target,
                    shape.circle,
                    /* A first-line affordance again: the 44px target is offset to the first line's centre,
                       and the padding that makes it a target rather than a mark is pulled back at the
                       surface's end edge. Its ring is the inset one, because the stack clips its own root
                       and an outward ring would be cut off at the top of a titled toast. */
                    "group -me-2 inline-flex shrink-0 items-center justify-center",
                    toast.title ? "-mt-3" : "-mt-2.5",
                    text.medium,
                    "hover:text-sherick-ink",
                    motionFeedback,
                    focusRingInset,
                    stateLayer.quiet,
                    state.enabled
                  )}
                >
                  <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
                    <X className={cn("size-4")} aria-hidden="true" />
                  </span>
                </BaseToast.Close>
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
