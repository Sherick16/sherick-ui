"use client";

import { Field as BaseField } from "@base-ui/react/field";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { text } from "./ui.common";

export interface FieldProps
  extends Omit<ComponentProps<typeof BaseField.Root>, "children" | "className" | "ref"> {
  /** The field's label. Base UI associates it with the control and names the group. */
  label?: ReactNode;
  /** Supporting copy beneath the control. */
  description?: ReactNode;
  /**
   * The message shown while the field is invalid. Its presence is what makes the field
   * invalid, so an error can never be rendered without the state that explains it.
   */
  error?: ReactNode;
  /**
   * Renders the required mark beside the label. The control inside is what carries the
   * requirement: pass `required` to it as well, because only the control can report it
   * to a form or to assistive technology.
   */
  required?: boolean;
  /** Styles the field's own column. The control inside styles itself. */
  className?: string;
  /**
   * A Base-backed control that is one control: `Checkbox`, `Slider` or `NumberField`. A
   * group of controls names itself — `RadioGroup` carries its own label — because the
   * field's label belongs to the single control it validates.
   */
  children: ReactNode;
}

/**
 * Labels and validates one form control. Base UI owns the generated IDs and the
 * `aria-describedby` / `aria-invalid` wiring; this component owns only the order and the
 * typography of label, control, description and error.
 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(
  (
    { label, description, error, required, className, children, invalid, ...rootProps },
    ref
  ) => {
    return (
      <BaseField.Root
        {...rootProps}
        ref={ref}
        invalid={Boolean(error) || invalid}
        className={cn("flex w-full flex-col", className)}
      >
        {label && (
          <BaseField.Label className={cn("mb-2 text-sm font-medium", text.high)}>
            {label}
            {required && (
              <span className={cn("ml-1 text-sherick-danger")} aria-hidden="true">
                *
              </span>
            )}
          </BaseField.Label>
        )}
        {children}
        {description && (
          <BaseField.Description className={cn("mt-2 text-xs leading-5", text.medium)}>
            {description}
          </BaseField.Description>
        )}
        {error && (
          <BaseField.Error match className={cn("mt-2 text-xs leading-5 text-sherick-danger")}>
            {error}
          </BaseField.Error>
        )}
      </BaseField.Root>
    );
  }
);

Field.displayName = "Field";

export default Field;
