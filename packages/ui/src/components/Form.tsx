"use client";

import { Form as BaseForm } from "@base-ui/react/form";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";

/** Messages keyed by each field's `name`: one message, or several. */
export type FormErrors = Record<string, string | string[]>;

export interface FormProps
  extends Omit<ComponentProps<typeof BaseForm>, "className" | "render" | "errors" | "children" | "ref"> {
  /**
   * Errors returned from outside the form — typically a server's answer to a submission — keyed by
   * each field's `name`. Each field shows its own message, the form moves focus to the first field
   * that has one, and a field's entry clears as soon as its value changes.
   */
  errors?: FormErrors;
  /** Styles the form's own column. The fields inside it style themselves. */
  className?: string;
  children?: ReactNode;
}

/**
 * A form whose fields report what is wrong where it is wrong. On submit, Base UI validates every
 * field it holds, keeps the submission from leaving while any is invalid and moves focus to the
 * first invalid field in document order, so a submit button at the bottom of a long form never
 * answers with nothing. The same happens when `errors` arrive after a submission.
 *
 * Every Sherick field takes part through its `name`: `Input`, `Textarea`, `RadioGroup` and
 * `CheckboxGroup` carry their own; `Select`, `Combobox`, `NumberField`, `Checkbox`, `Switch` and
 * `Slider` take part inside a `Field` given the `name`. Base UI owns validation, the errors map and
 * the focus move; Sherick UI owns only the column the fields stand in.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(({ className, ...formProps }, ref) => (
  <BaseForm {...formProps} ref={ref} className={cn("flex min-w-0 flex-col gap-6", className)} />
));

Form.displayName = "Form";

export default Form;
