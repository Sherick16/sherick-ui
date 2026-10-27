"use client";

import { Field as BaseField } from "@base-ui/react/field";
import React, { forwardRef, useEffect, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/libs/utils";
import { density, fieldLabel, fieldLayout, fieldMessage } from "./ui.common";
import FieldLabel from "./FieldLabel";

/** The density a field takes: `sm` for a dense row, `md` the default and `lg` a prominent field. */
export type FieldSize = "sm" | "md" | "lg";

/** The height and type step a field's own box takes, so a row of fields and buttons shares one rhythm. */
export const fieldDensity: Record<FieldSize, string> = {
  sm: density.compact,
  md: density.normal,
  lg: density.prominent,
};

/* A setting row: its label and description at the start, its control at the end, centred on the
   block of text. The gap is the one a row of settings needs, and the text block keeps the column
   rhythm of `fieldLayout`, so the label and its description still touch at 4px. */
const settingRow = "flex min-w-0 w-full items-center justify-between gap-6";

export interface FieldProps
  extends Omit<ComponentProps<typeof BaseField.Root>, "children" | "className" | "ref"> {
  /** The field's label. Base UI associates it with the control and names the group. */
  label?: ReactNode;
  /** Supporting copy beneath the control. In a horizontal field it sits beneath the label. */
  description?: ReactNode;
  /**
   * The message shown while the field is invalid. Its presence is what makes the field invalid,
   * so an error can never be rendered without the state that explains it. Omit it and Base UI's
   * own validation message is shown instead.
   */
  error?: ReactNode;
  /**
   * Renders the required mark beside the label. This is presentational only: the requirement
   * itself can only be declared by the control, so pass `required` to the control as well —
   * every example, fixture and test in this repository does.
   */
  required?: boolean;
  /**
   * `vertical` stacks the label, the control, the description and the error in one column. `horizontal`
   * is a setting row: the label and its description sit at the start and the control at the end.
   */
  orientation?: "vertical" | "horizontal";
  /** Styles the field's own column. The control inside styles itself. */
  className?: string;
  /**
   * A Base-backed control that is one control: `Checkbox`, `Switch`, `Slider`, `NumberField`, `Select`
   * or `Combobox`. A group of controls names itself — `RadioGroup` carries its own label — because
   * the field's label belongs to the single control it validates.
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
    { label, description, error, required, orientation = "vertical", className, children, invalid, ...rootProps },
    ref
  ) => {
    const horizontal = orientation === "horizontal";

    const labelNode = label ? (
      <BaseField.Label className={cn(fieldLabel)}>
        <FieldLabel required={required}>{label}</FieldLabel>
      </BaseField.Label>
    ) : null;

    const descriptionNode = description ? (
      <BaseField.Description className={cn(fieldMessage.description)}>{description}</BaseField.Description>
    ) : null;

    /* Mounted whether or not a message was passed: without `match` this part renders whatever
       Base's own validation reports, so `validate`/`validationMode` are usable on their own,
       and `match` pins a caller-supplied message in its place. */
    const errorNode = (
      <BaseField.Error
        match={error ? true : undefined}
        className={cn(fieldMessage.error)}
        {...(error ? { children: error } : {})}
      />
    );

    return (
      <BaseField.Root
        {...rootProps}
        ref={ref}
        invalid={Boolean(error) || invalid}
        className={cn(horizontal ? settingRow : fieldLayout, className)}
      >
        {horizontal ? (
          <>
            {/* The text block is one column, so its label, description and error keep the vertical rhythm. */}
            <div className={cn(fieldLayout, "flex-1")}>
              {labelNode}
              {descriptionNode}
              {errorNode}
            </div>
            <div className={cn("flex shrink-0 items-center")}>{children}</div>
          </>
        ) : (
          <>
            {labelNode}
            {children}
            {descriptionNode}
            {errorNode}
          </>
        )}
      </BaseField.Root>
    );
  }
);

Field.displayName = "Field";

/*
 * Development-only check for a Checkbox or Switch that nothing names. A control outside a `Field` has
 * no name unless it is given `aria-label` or `aria-labelledby`, and a screen reader then announces it
 * as an unlabelled toggle. Inside a `Field` Base wires `aria-labelledby` itself, so that is what is
 * looked for on the mounted element, and production builds never run the check.
 */
export const useControlNameWarning = (
  ref: RefObject<HTMLButtonElement | null>,
  control: "Checkbox" | "Switch",
  namedByProps: boolean
) => {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || namedByProps) return;
    const element = ref.current;
    if (!element) return;
    const named =
      element.hasAttribute("aria-labelledby") ||
      (element.labels?.length ?? 0) > 0 ||
      element.closest("label") !== null;
    if (!named) {
      console.warn(
        `Sherick UI: ${control} has no accessible name. Give it an aria-label, or place it in a Field with a label.`
      );
    }
    // Checked once, when the control mounts: the name it is given is the name it keeps.
  }, []);
};

export default Field;
