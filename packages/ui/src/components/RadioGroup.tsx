"use client";

import { Field } from "@base-ui/react/field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import React, { forwardRef, useId, type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "@/libs/utils";
import {
  fieldLabel,
  fieldLayout,
  fieldMessage,
  groupFocusRing,
  selectable,
  shape,
  stateLayer,
} from "./ui.common";
import { motionArrive } from "./ui.motion";
import FieldLabel from "./FieldLabel";
import {
  ChoiceCopy,
  choiceItemClasses,
  choiceLabelClasses,
  choiceLineClassName,
  type ChoiceAppearance,
} from "./choice-row";

export interface RadioGroupOption {
  value: string;
  label: ReactNode;
  /** Supporting copy beneath the label. It describes the choice rather than naming it. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue" | "children"> {
  options: RadioGroupOption[];
  /** Gives each choice its own selectable surface. The default keeps the compact, unfilled rows. */
  appearance?: ChoiceAppearance;
  /** The group's own label. Naming the group is the group's job, not a field's: an
   *  enclosing `Field` names one control, while every option here is its own control. */
  label?: ReactNode;
  /** Supporting copy beneath the group. */
  description?: ReactNode;
  /**
   * The message shown while the group is invalid. Its presence is what makes the group invalid; omit
   * it and the group shows what Base reports, including an error a `Form` returns for its `name`.
   */
  error?: ReactNode;
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
      appearance = "default",
      label,
      description,
      error,
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
    const idBase = useId();

    return (
      // The group owns the field scope its options are labelled in. Base UI scopes each
      // option's label to its own `Field.Item`, which has to sit inside a `Field.Root`.
      <Field.Root className={cn(fieldLayout, className)} invalid={error ? true : undefined}>
        {label && (
          <Field.Label className={cn(fieldLabel)}>
            <FieldLabel required={required}>{label}</FieldLabel>
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
                    <Radio.Root
                      value={option.value}
                      disabled={option.disabled}
                      {...(option.description != null ? { "aria-labelledby": labelId } : {})}
                      className={cn(
                        "group relative my-0.5 flex size-5 shrink-0 items-center justify-center [outline-style:none]",
                        shape.circle
                      )}
                    >
                      {/* An empty socket is identified by its rim; a selected one fills and holds a light thumb. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-5 items-center justify-center",
                          shape.circle,
                          selectable.markSurface,
                          selectable.mark,
                          selectable.selected,
                          stateLayer.mark,
                          appearance === "default" && groupFocusRing
                        )}
                      >
                        {/* Positioned so the thumb paints above the socket's hover layer. */}
                        <Radio.Indicator className={cn("relative flex items-center justify-center", motionArrive)}>
                          <span data-sui-radio-dot="" className={cn("block size-2", shape.circle, selectable.thumb)} />
                        </Radio.Indicator>
                      </span>
                    </Radio.Root>
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
        </BaseRadioGroup>
        {description && (
          <Field.Description className={cn(fieldMessage.description)}>{description}</Field.Description>
        )}
        {/* Mounted whether or not a message was passed: without `match` this part renders what Base
            reports — a missing required choice, or the error a `Form` returns for this group's name. */}
        <Field.Error
          match={error ? true : undefined}
          className={cn(fieldMessage.error)}
          {...(error ? { children: error } : {})}
        />
      </Field.Root>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
