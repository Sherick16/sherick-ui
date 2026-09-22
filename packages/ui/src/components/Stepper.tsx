"use client";

import { Check as CheckIcon } from "lucide-react";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { elevation, focusRing, material, shape, state, stateLayer, text, tone } from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";

export interface StepperItem {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  complete?: boolean;
  disabled?: boolean;
}

export interface StepperProps
  extends Omit<ComponentProps<"nav">, "children" | "defaultValue" | "onChange"> {
  items: StepperItem[];
  /**
   * The step the workflow has reached. Deliberately controlled, and deliberately nullable: the
   * consumer owns the workflow, and `null` is a workflow that has not started, not its first step.
   */
  value: string | null;
  /**
   * Reports the step a native button activated. Its presence is what makes the list interactive:
   * without it the steps are informative text, and no focusable fake controls are rendered.
   */
  onValueChange?: (value: string) => void;
  /** Horizontal when the container has room; otherwise the same sequence stacks vertically. */
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}

/* A discrete progress track, not a row of floating badges. The groove and fill are the
   same recipes as Progress; each segment describes only its own explicit state, never an
   inferred percentage or completion of earlier items. */
const Stepper = forwardRef<HTMLElement, StepperProps>(
  (
    {
      items,
      value,
      onValueChange,
      orientation = "horizontal",
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...navProps
    },
    ref
  ) => {
    const interactive = onValueChange !== undefined;
    const listDisabled = interactive && disabled;
    const stack = orientation === "vertical";
    /* Native container queries adapt to a sidebar as well as a device. Longer sequences need
       a wider content band before their labels share a line. No measuring or duplicate controls. */
    const long = items.length > 4;
    const rowLayout = cn(
      "grid min-w-0 w-full grid-cols-[0.375rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-2 py-3 text-start text-sm",
      !stack && (long
        ? "[@container(min-width:64rem)]:grid-cols-1"
        : "[@container(min-width:32rem)]:grid-cols-1")
    );

    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={ariaLabel ?? "Progress steps"}
        className={cn(
          "w-full min-w-0 max-w-full p-1 [container-type:inline-size]",
          listDisabled && state.disabled,
          className
        )}
      >
        {/* The DOM order and controls never change when the arrangement changes. */}
        <ol
          role="list"
          className={cn(
            "m-0 flex list-none flex-col p-0",
            !stack && (long ? "[@container(min-width:64rem)]:flex-row" : "[@container(min-width:32rem)]:flex-row")
          )}
        >
          {items.map((item, index) => {
            const current = value !== null && item.value === value;
            const complete = item.complete === true;
            const unavailable = interactive && (disabled || item.disabled === true);
            const dimmed = interactive && !disabled && item.disabled === true;
            const content = (
              <>
                <span
                  aria-hidden="true"
                  data-sui-step-track=""
                  className={cn(
                    "relative overflow-hidden",
                    "w-1.5 self-stretch",
                    !stack && (long
                      ? "[@container(min-width:64rem)]:h-1.5 [@container(min-width:64rem)]:w-full"
                      : "[@container(min-width:32rem)]:h-1.5 [@container(min-width:32rem)]:w-full"),
                    shape.pill,
                    elevation.recessed,
                    material.matteQuiet
                  )}
                >
                  {(current || complete) && (
                    <span
                      data-sui-progress-indicator=""
                      className={cn(
                        "absolute inset-0",
                        shape.pill,
                        motionFeedback,
                        current ? tone.strong.primary : tone.selected.primary
                      )}
                    />
                  )}
                </span>
                <span className={cn("grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-2 gap-y-1")}>
                  <span
                    data-sui-step-mark=""
                    className={cn(
                      "inline-flex h-5 w-4 shrink-0 items-center justify-center text-xs tabular-nums [&>svg]:size-4",
                      interactive && !unavailable && motionInkPress
                    )}
                  >
                    {complete && !current ? (
                      <>
                        <CheckIcon aria-hidden="true" />
                        <span className={cn("sr-only")}>Complete</span>
                      </>
                    ) : index + 1}
                  </span>
                  <span className={cn("leading-5 [overflow-wrap:anywhere]", current && "font-medium")}>
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className={cn(
                      "text-xs leading-5 [overflow-wrap:anywhere]",
                      "col-start-2",
                      !stack && (long ? "[@container(min-width:64rem)]:col-span-2" : "[@container(min-width:32rem)]:col-span-2"),
                      text.medium
                    )}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return (
              <li
                key={item.value}
                aria-current={!interactive && current ? "step" : undefined}
                className={cn(
                  "min-w-0 flex-1",
                  dimmed && state.disabled
                )}
              >
                {onValueChange ? (
                  <button
                    type="button"
                    disabled={unavailable}
                    aria-current={current ? "step" : undefined}
                    onClick={() => onValueChange(item.value)}
                    className={cn(
                      rowLayout,
                      shape.row,
                      !unavailable && "group",
                      motionFeedback,
                      focusRing,
                      stateLayer.quiet,
                      current ? text.high : text.medium,
                      unavailable ? state.disabledDescendant : state.enabled
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cn(rowLayout, current ? text.high : text.medium)}>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Stepper.displayName = "Stepper";

export default Stepper;
