"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import Calendar from "./Calendar";
import Field from "./Field";
import { state } from "./ui.common";
import {
  DateCalendarPopup,
  DateFieldTrigger,
  dateFieldRowClassName,
  dateInputClassName,
} from "./date-field";
import {
  compareCalendarDates,
  normalizeCalendarDate,
  resolveCalendarLabels,
  type CalendarDate,
  type CalendarLabels,
} from "./date-family";

export interface DatePickerProps {
  /** The selected date, or `null` for no selection. Undefined makes the picker uncontrolled. */
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  /** Receives the next date, or `null` when the field is cleared. */
  onValueChange?: (value: CalendarDate | null) => void;
  /** The field's label. It names the native field, its control and the calendar popup. */
  label: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Styles the field's own column. */
  className?: string;
  id?: string;
  /** The form that owns the field, when it renders outside it. */
  form?: string;
  /** Identifies the field when it is submitted. */
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BasePopover.Root.Props["onOpenChange"];
  /** The earliest acceptable date, inclusive. */
  min?: CalendarDate;
  /** The latest acceptable date, inclusive. */
  max?: CalendarDate;
  /** Whether a date cannot be chosen. Unavailable dates stay visible and are never selected. */
  isDateUnavailable?: (date: CalendarDate) => boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  today?: CalendarDate;
  labels?: Partial<CalendarLabels>;
}

/* The input is the form's own control, so the picker owns its text without making it a controlled
   React input: the DOM value is written from the value that is actually held, and a form reset
   restores the defaults the field was given. */
const mergeInputRef = (ref: ForwardedRef<HTMLInputElement>, local: React.RefObject<HTMLInputElement | null>) =>
  (node: HTMLInputElement | null) => {
    local.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

/**
 * A date field: a native `type=date` input, with a named control beside it that opens the shared
 * `Calendar` in a popover.
 *
 * The native input stays the field's control, so the browser owns its entry, its mobile UI, its
 * form submission and the `required` and `min`/`max` constraints; `isDateUnavailable` is reported
 * through the field's own validation, and a date the calendar would refuse is never accepted as a
 * value — the input keeps what was typed and the field says why. The calendar gives the same
 * value a grid, a keyboard and a month of context.
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  value,
  defaultValue,
  onValueChange,
  label,
  description,
  error,
  required = false,
  disabled = false,
  className,
  id,
  form,
  name,
  open,
  defaultOpen,
  onOpenChange,
  min,
  max,
  isDateUnavailable,
  locale = "en-US",
  weekStartsOn = 1,
  today,
  labels: labelsProp,
}, ref) => {
  const labels = useMemo(() => resolveCalendarLabels(labelsProp), [labelsProp]);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDate | null>(() =>
    normalizeCalendarDate(defaultValue)
  );
  const currentValue = isControlled ? normalizeCalendarDate(value) : internalValue;
  /* Whether what is on screen is a date this field cannot accept. It is the field's own reading
     of a typed value, so the row takes the error ladder while the message comes from Base's
     validation of the same value. */
  const [typedIssue, setTypedIssue] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);

  const minDate = normalizeCalendarDate(min);
  const maxDate = normalizeCalendarDate(max);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupActionsRef = useRef<BasePopover.Root.Actions | null>(null);
  /* The input's own default, captured once: it is what the browser's `form.reset()` restores
     before this component restores the default the field was given. */
  const initialText = useRef(currentValue ?? "");
  const assignInputRef = useCallback(mergeInputRef(ref, inputRef), [ref]);

  /* One writer for the input's DOM value. The field is not a controlled React input, so typing is
     never rewritten while it is in progress; a value that changes from the outside — the calendar,
     an application update, a form reset — is what lands. */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const next = currentValue ?? "";
    if (input.value !== next) input.value = next;
  }, [currentValue, resetNonce]);

  const commitValue = (next: CalendarDate | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const isSelectableDate = (date: CalendarDate) => {
    if (minDate && compareCalendarDates(date, minDate) < 0) return false;
    if (maxDate && compareCalendarDates(date, maxDate) > 0) return false;
    return !isDateUnavailable?.(date);
  };

  /* What the native constraints cannot express. `min`/`max` and `required` are the browser's own
     validation, so reporting them here as well would produce the field's message twice. */
  const validateValue = (candidate: unknown) => {
    const date = typeof candidate === "string" ? normalizeCalendarDate(candidate) : null;
    if (!date) return null;
    return isDateUnavailable?.(date) ? labels.unavailableRange : null;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const text = input.value;

    if (text === "") {
      /* An empty value with bad input is a date still being typed segment by segment: it is not a
         cleared field, and the value must not move under the caret. */
      if (input.validity.badInput) return;
      setTypedIssue(false);
      commitValue(null);
      return;
    }

    const date = normalizeCalendarDate(text);
    if (!date || !isSelectableDate(date)) {
      setTypedIssue(true);
      return;
    }

    setTypedIssue(false);
    commitValue(date);
  };

  const handleReset = () => {
    const restored = normalizeCalendarDate(defaultValue);
    setResetNonce((nonce) => nonce + 1);
    setTypedIssue(false);
    if (restored !== currentValue) commitValue(restored);
  };

  const handleCalendarChange = (next: CalendarDate | null) => {
    setTypedIssue(false);
    commitValue(next);
    /* A date is the whole of a single selection, so the surface has done its job. */
    if (next) popupActionsRef.current?.close();
  };

  const fieldInvalid = Boolean(error) || typedIssue;

  return (
    <Field
      label={label}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
      invalid={typedIssue}
      validate={validateValue}
      validationMode="onChange"
      onReset={handleReset}
      className={cn(disabled && state.disabled, className)}
    >
      <BasePopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        actionsRef={popupActionsRef}
        /* Non-modal: the field, the page and the browser's own date entry all stay reachable
           while the grid is open. */
        modal={false}
      >
        <div
          data-disabled={disabled || undefined}
          data-invalid={fieldInvalid || undefined}
          className={cn(dateFieldRowClassName(disabled))}
        >
          <BaseField.Control
            render={<input type="date" ref={assignInputRef} />}
            id={id}
            name={name}
            form={form}
            required={required}
            disabled={disabled}
            min={minDate ?? undefined}
            max={maxDate ?? undefined}
            defaultValue={initialText.current}
            onChange={handleInputChange}
            className={cn(dateInputClassName)}
          />
          <DateFieldTrigger label={`Open ${label}`} disabled={disabled} />
        </div>

        <DateCalendarPopup title={label}>
          <Calendar
            mode="single"
            value={currentValue}
            onValueChange={handleCalendarChange}
            min={min}
            max={max}
            isDateUnavailable={isDateUnavailable}
            locale={locale}
            weekStartsOn={weekStartsOn}
            today={today}
            labels={labelsProp}
          />
        </DateCalendarPopup>
      </BasePopover.Root>
    </Field>
  );
});

DatePicker.displayName = "DatePicker";

export default DatePicker;
