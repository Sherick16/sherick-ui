"use client";

import { Field } from "@base-ui/react/field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import React, { forwardRef, type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  groupFocusRing,
  selectable,
  shape,
  state,
  stateLayer,
  text,
} from "./ui.common";

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue" | "children"> {
  options: RadioGroupOption[];
  /** The group's own label. Naming the group is the group's job, not a field's: an
   *  enclosing `Field` names one control, while every option here is its own control. */
  label?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** A ref to the hidden `<input>` that participates in the form. */
  inputRef?: Ref<HTMLInputElement>;
  /** Styles the labelled group. */
  className?: string;
}

/**
 * One choice out of a list. Base UI owns the value, the roving tab index, the arrow keys,
 * the name and the form participation; Sherick UI owns the labelled column and the rows.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      label,
      value,
      defaultValue,
      onValueChange,
      name,
      form,
      required,
      disabled,
      readOnly,
      inputRef,
      className,
      ...groupProps
    },
    ref
  ) => {
    return (
      // The group owns the field scope its options are labelled in. Base UI scopes each
      // option's label to its own `Field.Item`, which has to sit inside a `Field.Root`.
      <Field.Root className={cn("flex w-full flex-col", className)}>
        {label && (
          <Field.Label className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && (
              <span className={cn("ml-1 text-sherick-danger")} aria-hidden="true">
                *
              </span>
            )}
          </Field.Label>
        )}
        <BaseRadioGroup
          {...groupProps}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(nextValue) => onValueChange?.(nextValue as string)}
          name={name}
          form={form}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          inputRef={inputRef}
          className={cn("flex flex-col")}
        >
          {options.map((option) => {
            const optionDisabled = disabled || option.disabled;

            return (
              <Field.Item
                key={option.value}
                className={cn(
                  "group flex items-stretch",
                  density.normal,
                  optionDisabled ? state.disabled : state.enabled
                )}
              >
                {/* The row is the label, so the whole line an option occupies is its hit area,
                    and the gap after the circle is measured from the circle itself. The circle
                    keeps its own label scope: without a per-option scope, a group sitting inside
                    a `Field` would hand every radio the group's own label. */}
                <Field.Label className={cn("flex flex-1 items-center gap-3")}>
                  <Radio.Root
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "group relative flex size-6 shrink-0 items-center justify-center outline-none"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-6 items-center justify-center",
                        shape.circle,
                        selectable.surface,
                        selectable.rest,
                        selectable.selected,
                        !optionDisabled && stateLayer.track,
                        !optionDisabled && state.groupPressCompact,
                        groupFocusRing
                      )}
                    >
                      <Radio.Indicator className={cn("flex items-center justify-center", selectable.mark)}>
                        <span className={cn("block size-2.5", shape.circle, "bg-current")} />
                      </Radio.Indicator>
                    </span>
                  </Radio.Root>
                  <span className={cn(text.high)}>{option.label}</span>
                </Field.Label>
              </Field.Item>
            );
          })}
        </BaseRadioGroup>
      </Field.Root>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
