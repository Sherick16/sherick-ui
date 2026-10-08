"use client";

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field } from "@base-ui/react/field";
import { Check } from "lucide-react";
import React, { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  fieldLayout,
  fieldMessage,
  groupFocusRing,
  selectable,
  shape,
  stateLayer,
  text,
} from "./ui.common";
import { motionArrive } from "./ui.motion";
import {
  ChoiceCopy,
  choiceItemClasses,
  choiceLabelClasses,
  choiceLineClassName,
  type ChoiceAppearance,
} from "./choice-row";

export interface CheckboxGroupOption {
  value: string;
  label: ReactNode;
  /** Supporting copy beneath the label, such as the domains a casino answers on. */
  description?: ReactNode;
  disabled?: boolean;
}

type CheckboxGroupChangeDetails = Parameters<NonNullable<BaseCheckboxGroup.Props["onValueChange"]>>[1];

export interface CheckboxGroupProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue" | "children"> {
  options: CheckboxGroupOption[];
  /** Gives each choice its own selectable surface. The default keeps the compact, unfilled rows. */
  appearance?: ChoiceAppearance;
  /** The group's own label. Base names the group from it. */
  label?: ReactNode;
  /** Supporting copy beneath the group. */
  description?: ReactNode;
  /**
   * The message shown while the group is invalid. Its presence is what makes the group invalid; omit
   * it and the group shows what Base reports, including an error a `Form` returns for its `name`.
   */
  error?: ReactNode;
  /** The ticked options' values. */
  value?: string[];
  defaultValue?: string[];
  /** Base's own change callback, event details included. */
  onValueChange?: (value: string[], eventDetails: CheckboxGroupChangeDetails) => void;
  /** Identifies the group when a form is submitted: one entry per ticked option. */
  name?: string;
  /**
   * At least one option must be ticked. It marks the label and is checked when a `Form` validates;
   * the message is `requiredMessage`.
   */
  required?: boolean;
  /** The message a required group shows when nothing is ticked. */
  requiredMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Styles the labelled group. */
  className?: string;
}

/**
 * Any number of choices out of a list — the options-API sibling of `RadioGroup`, with the same rows,
 * the same opt-in `surface` row and the same labelled column. Base UI owns the value, the group
 * semantics and the form participation; Sherick UI owns the rows and the marks.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      options,
      appearance = "default",
      label,
      description,
      error,
      value,
      defaultValue,
      onValueChange,
      name,
      required,
      requiredMessage = "Choose at least one option.",
      disabled,
      readOnly,
      className,
      ...groupProps
    },
    ref
  ) => {
    const idBase = useId();

    return (
      // The group is the field's one control, so the field takes its name and its validation; each
      // option is scoped to its own `Field.Item`, which labels and describes that checkbox alone.
      <Field.Root
        className={cn(fieldLayout, className)}
        name={name}
        disabled={disabled}
        invalid={error ? true : undefined}
        validate={
          required
            ? (current) => (Array.isArray(current) && current.length > 0 ? null : requiredMessage)
            : undefined
        }
      >
        {label && (
          <Field.Label className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && (
              <span className={cn("ms-1 text-sherick-danger")} aria-hidden="true">
                *
              </span>
            )}
          </Field.Label>
        )}
        <BaseCheckboxGroup
          {...groupProps}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          className={cn("flex flex-col", appearance === "surface" && "gap-2")}
        >
          {options.map((option, index) => {
            const labelId = `${idBase}-option-${index}`;
            return (
              <Field.Item
                key={option.value}
                {...(appearance === "surface" && readOnly ? { "data-readonly": "" } : {})}
                className={cn(...choiceItemClasses(appearance))}
              >
                <Field.Label className={cn(...choiceLabelClasses(appearance))}>
                  <span className={cn(choiceLineClassName)}>
                    <BaseCheckbox.Root
                      value={option.value}
                      disabled={option.disabled}
                      readOnly={readOnly}
                      {...(option.description != null ? { "aria-labelledby": labelId } : {})}
                      className={cn(
                        // The control takes the mark's corner so a forced-colors outline follows the
                        // box rather than squaring it off. The whole row is its label and its target.
                        "group relative my-0.5 flex size-5 shrink-0 items-center justify-center outline-none",
                        shape.mark
                      )}
                    >
                      {/* An empty box is identified by its rim; a ticked one fills edge to edge. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-5 items-center justify-center",
                          shape.mark,
                          selectable.markSurface,
                          selectable.mark,
                          selectable.selected,
                          stateLayer.mark,
                          appearance === "default" && groupFocusRing
                        )}
                      >
                        {/* Positioned so the tick paints above the box's hover layer. */}
                        <BaseCheckbox.Indicator className={cn("relative flex items-center justify-center", motionArrive)}>
                          {/* A heavier stroke than the icon default: at 14px the default draws a hairline tick. */}
                          <Check className={cn("size-3.5")} strokeWidth={3} />
                        </BaseCheckbox.Indicator>
                      </span>
                    </BaseCheckbox.Root>
                    <ChoiceCopy
                      appearance={appearance}
                      label={option.label}
                      description={option.description}
                      labelId={labelId}
                    />
                  </span>
                </Field.Label>
              </Field.Item>
            );
          })}
        </BaseCheckboxGroup>
        {description && (
          <Field.Description className={cn(fieldMessage.description)}>{description}</Field.Description>
        )}
        {/* Mounted whether or not a message was passed: without `match` this part renders what Base
            reports — a required group left empty, or the error a `Form` returns for this name. */}
        <Field.Error
          match={error ? true : undefined}
          className={cn(fieldMessage.error)}
          {...(error ? { children: error } : {})}
        />
      </Field.Root>
    );
  }
);

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
