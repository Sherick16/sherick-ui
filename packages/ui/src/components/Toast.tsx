"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import React, { type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import {
  density,
  focusRing,
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
 * What a toast is reporting. The type lands on the toast's icon and its tone — never on the
 * surface, which stays neutral so the copy is still read at its normal emphasis.
 */
export type ToastType = "info" | "success" | "warning" | "danger";

/** The corner the stack grows from. */
export type ToastPosition = "bottom-end" | "bottom-start" | "top-end" | "top-start";

/** The handle `useToast` returns, and the one `createToastManager` builds outside React. */
export type ToastManager = ReturnType<typeof BaseToast.createToastManager>;

/** Everything a toast can be raised with. */
export type ToastOptions = Parameters<ToastManager["add"]>[0];

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

const typeIcons: Record<ToastType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const typeTones: Record<ToastType, string> = {
  info: tone.text.primary,
  success: tone.text.success,
  warning: tone.text.warning,
  danger: tone.text.danger,
};

/* Where the stack sits, where a toast rests inside the viewport, and which way it grows. A stack
   anchored to the bottom grows upward and a toast leaves downward, so one signed factor carries
   both the resting offset and the edge a new toast arrives from. */
const positionLayout: Record<
  ToastPosition,
  { viewport: string; anchor: string; sign: string; from: string }
> = {
  "bottom-end": {
    viewport: "bottom-6 right-6",
    anchor: "bottom-0 right-0 origin-bottom",
    sign: "[--sui-toast-stack-sign:-1]",
    from: "[--sui-toast-from-y:150%]",
  },
  "bottom-start": {
    viewport: "bottom-6 left-6",
    anchor: "bottom-0 left-0 origin-bottom",
    sign: "[--sui-toast-stack-sign:-1]",
    from: "[--sui-toast-from-y:150%]",
  },
  "top-end": {
    viewport: "top-6 right-6",
    anchor: "top-0 right-0 origin-top",
    sign: "[--sui-toast-stack-sign:1]",
    from: "[--sui-toast-from-y:-150%]",
  },
  "top-start": {
    viewport: "top-6 left-6",
    anchor: "top-0 left-0 origin-top",
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
  <BaseToast.Provider {...props} toastManager={manager}>
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
          const type = toast.type as ToastType | undefined;
          const Icon = type ? typeIcons[type] : undefined;
          const semanticTone = type ? typeTones[type] : undefined;

          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              className={cn(
                /* The stack's own geometry: each toast is anchored to the same viewport corner,
                   sits one shortened step behind the one in front of it, and is clamped to the
                   frontmost toast's height so a collapsed stack shows one surface with a sliver of
                   each of the others. Expanding rests every toast at its own height again. The
                   signed factor is the only difference between a stack that grows up and one that
                   grows down. */
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
              {/* A collapsed stack hides the copy of every toast behind the frontmost one, and
                  restores it when the stack expands: what is read is what can be read. */}
              <BaseToast.Content
                className={cn(
                  "flex h-full items-start gap-3 p-4",
                  motionFeedback,
                  "data-[behind]:opacity-0 data-[expanded]:opacity-100"
                )}
              >
                {Icon ? (
                  <Icon
                    aria-hidden="true"
                    className={cn("mt-0.5 size-5 shrink-0", semanticTone)}
                  />
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
                    "group -mr-1 -mt-1 inline-flex shrink-0 items-center justify-center",
                    text.medium,
                    "hover:text-sherick-ink",
                    motionFeedback,
                    focusRing,
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
 * Raises, updates and closes toasts from inside the React tree.
 *
 * `add` returns the toast's id; `update` and `close` take one. Passing an id that already exists
 * updates that toast in place instead of stacking a duplicate, and `promise` reports a promise's
 * loading, success and error states through one toast.
 */
export const useToast = () => BaseToast.useToastManager();

/* A manager built here lives outside the React tree, so a plain function — a fetch wrapper, an
   error boundary, a route loader — can raise a toast. Hand it to `ToastProvider`'s `manager` so
   the same viewport renders it. Re-exported rather than wrapped: it already has exactly the shape
   this API promises. */
export const createToastManager = BaseToast.createToastManager;
