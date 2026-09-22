"use client";

import { Check as CheckIcon } from "lucide-react";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { edge, focusRing, shape, state, stateLayer, text, tone } from "./ui.common";
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
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}

/* The step's mark: a small round well that holds the step's own position, or the tick that replaces
   it. The box is fixed and the artwork is sized by the slot, so substituting one mark for the other
   cannot change the step's geometry. */
const StepMark = ({
  index,
  complete,
  current,
  pressable,
}: {
  index: number;
  complete: boolean;
  current: boolean;
  pressable: boolean;
}) => (
  <span
    className={cn(
      "flex size-8 shrink-0 items-center justify-center text-sm font-medium tabular-nums [&>svg]:size-4",
      shape.circle,
      pressable ? motionInkPress : motionFeedback,
      current
        ? tone.strong.primary
        : complete
          ? cn(tone.tonal.primary, tone.text.primary)
          : cn(tone.tonal.secondary, text.medium)
    )}
  >
    {complete && !current ? (
      <>
        <CheckIcon aria-hidden="true" />
        <span className={cn("sr-only")}>Complete</span>
      </>
    ) : (
      index + 1
    )}
  </span>
);

/* A sequence of steps and where the workflow has got to. It is one model for the informative and
   the interactive list rather than two components: `onValueChange` decides which of the two it is,
   because a workflow nobody is listening to has nothing to activate and must not render a row of
   buttons that do nothing.

   The current step is the consumer's `value` and completion is the item's own `complete` flag:
   neither is inferred from position, so moving `value` never marks an earlier step done, and a
   value that matches no item — including `null` — simply leaves every step uncurrent. There is no
   wizard state here, no panel contract and no validation machine: a `Stepper` reports a requested
   step and renders whatever step the consumer then says the workflow is on.

   The mark states its step three ways, and colour is never the only one of them:
     - the current step takes the opaque accent and keeps its own position, and publishes
       `aria-current="step"` — it wins over completion visually, because where the workflow is
       matters more than the fact that this step is already done;
     - a complete step takes the accent tint and a tick, whose artwork is silent and whose meaning a
       reader hears as the word `Complete`;
     - every other step keeps its ordered number.
   The numbers are readable text rather than decoration: the ordered list carries the positions.

   `disabled` is meaningful exactly where a control exists. On the interactive list an item's own
   flag disables that one native button, the whole list's flag disables every one of them, and the
   disabled subtree dims once — at the root when the list is disabled, on the row when only that
   step is. On the informative list there is nothing to disable, so the flag has no effect at all
   rather than drawing a disabled control that is not there. */
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
    const notify = onValueChange;
    const interactive = notify !== undefined;
    const listDisabled = interactive && disabled;
    const stack = orientation === "vertical";
    const rowLayout = cn(
      "flex min-w-0 w-full gap-3 px-3 py-3 text-start text-sm",
      stack ? "items-start" : "flex-col items-start"
    );
    const connector = stack && (
      <span aria-hidden="true" className={cn("pointer-events-none absolute start-7 top-[3.25rem] -bottom-1 border-s", edge.rule)} />
    );

    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={ariaLabel ?? "Progress steps"}
        className={cn("min-w-0", listDisabled && state.disabled, className)}
      >
        {/* An explicit list role survives `list-none`: the positions this component draws are its own
            marks, so the native markers are removed and the list semantics stay. */}
        <ol
          role="list"
          className={cn(
            "m-0 list-none p-0",
            stack ? "flex flex-col" : "grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-x-2 gap-y-4"
          )}
        >
          {items.map((item, index) => {
            const current = value !== null && item.value === value;
            const complete = item.complete === true;
            const unavailable = interactive && (disabled || item.disabled === true);
            const dimmed = interactive && !disabled && item.disabled === true;
            const content = (
              <>
                <StepMark index={index} complete={complete} current={current} pressable={interactive && !unavailable} />
                <span className={cn("flex min-w-0 flex-col")}>
                  {/* The label carries no tone of its own: it takes the row's, so a row that answers
                      the pointer brightens its label with it. */}
                  <span className={cn("[overflow-wrap:anywhere]", stack ? "leading-8" : "leading-5", current && "font-medium")}>
                    {item.label}
                  </span>
                  {item.description ? (
                    <span className={cn("mt-1 text-xs leading-5 [overflow-wrap:anywhere]", text.medium)}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </>
            );

            if (notify === undefined) {
              return (
                <li
                  key={item.value}
                  aria-current={current ? "step" : undefined}
                  className={cn("relative min-w-0 w-full")}
                >
                  <div className={cn(rowLayout, current ? text.high : text.medium, stack && "w-full")}>
                    {content}
                  </div>
                  {index < items.length - 1 && connector}
                </li>
              );
            }

            const change = notify;

            return (
              <li key={item.value} className={cn("relative min-w-0 w-full", dimmed && state.disabled)}>
                <button
                  type="button"
                  disabled={unavailable}
                  aria-current={current ? "step" : undefined}
                  onClick={() => change(item.value)}
                  className={cn(
                    rowLayout,
                    stack && "w-full",
                    shape.row,
                    !unavailable && "group",
                    motionFeedback,
                    focusRing,
                    stateLayer.quiet,
                    current ? text.high : text.medium,
                    !unavailable && !current && "hover:text-sherick-ink",
                    unavailable ? state.disabledDescendant : state.enabled
                  )}
                >
                  {content}
                </button>
                {index < items.length - 1 && connector}
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
