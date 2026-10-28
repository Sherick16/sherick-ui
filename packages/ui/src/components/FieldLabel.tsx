import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { tone } from "./ui.common";

export interface FieldLabelProps {
  children: ReactNode;
  /** Adds the required mark. The control itself declares the requirement, so the mark is decorative. */
  required?: boolean;
}

/*
 * The words of a field's name and, when the control is required, the mark that says so. The wrapper
 * that names the control is the caller's — Base's `Field.Label`, a `legend`, a `Slider` label — so the
 * typography (`fieldLabel`) stays with that wrapper. The mark lives here once, and is hidden from
 * assistive technology because the control's own `required` already announces it.
 */
export const FieldLabel = ({ children, required = false }: FieldLabelProps) => (
  <>
    {children}
    {required && (
      <span className={cn("ms-1", tone.text.danger)} aria-hidden="true">
        *
      </span>
    )}
  </>
);

FieldLabel.displayName = "FieldLabel";

export default FieldLabel;
