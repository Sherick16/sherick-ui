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
import { motionArrive } from "./ui.motion";

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
  onValueChange?: BaseRadioGroup.Props<string>["onValueChange"];
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
          onValueChange={onValueChange}
          name={name}
          form={form}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          inputRef={inputRef}
          className={cn("flex flex-col")}
        >
          {options.map((option) => (
            <Field.Item
              key={option.value}
              className={cn(
                "group flex items-stretch",
                density.normal,
                state.enabled,
                state.effectiveDisabled,
                state.disabledRow
              )}
            >
              {/* The row itself is the label, so the whole row stays the pointer target. Inside it the
                  mark and the copy are one first-line group: a wrapped label then aligns the radio to
                  its first line instead of centring it on the block, while a one-line row is still
                  centred in the row's own density height. The copy declares its own line height —
                  `density.normal` sets the type step but no leading, and this package ships no reset —
                  so the mark's 24px slot and the line it is centred on are the same 24px whatever
                  line height a host happens to inherit. */}
              <Field.Label className={cn("flex flex-1 items-center")}>
                <span className={cn("flex w-full items-start gap-3")}>
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
                        stateLayer.track,
                        groupFocusRing
                      )}
                    >
                      <Radio.Indicator className={cn("flex items-center justify-center", motionArrive)}>
                        <span className={cn("block size-2.5", shape.circle, "bg-current")} />
                      </Radio.Indicator>
                    </span>
                  </Radio.Root>
                  <span className={cn(text.high, "leading-6")}>{option.label}</span>
                </span>
              </Field.Label>
            </Field.Item>
          ))}
        </BaseRadioGroup>
      </Field.Root>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
