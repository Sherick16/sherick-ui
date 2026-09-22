"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
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
  useDateFormReset,
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
  // Invalid native entry is an explicit draft, not a second writer of a valid controlled value.
  const [draft, setDraft] = useState<string | null>(null);
  const minDate = normalizeCalendarDate(min);
  const maxDate = normalizeCalendarDate(max);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupActionsRef = useRef<BasePopover.Root.Actions | null>(null);
  const fieldActionsRef = useRef<BaseField.Root.Actions | null>(null);

  useEffect(() => setDraft(null), [currentValue]);
  useDateFormReset(inputRef, form, () => {
    const restored = isControlled ? currentValue : normalizeCalendarDate(defaultValue);
    setDraft(null);
    if (!isControlled) setInternalValue(restored);
    // Native reset has already run and emits no React change event.
    if (inputRef.current) inputRef.current.value = restored ?? "";
  });

  const commitValue = (next: CalendarDate | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const isSelectableDate = (date: CalendarDate) => {
    if (minDate && compareCalendarDates(date, minDate) < 0) return false;
    if (maxDate && compareCalendarDates(date, maxDate) > 0) return false;
    return !isDateUnavailable?.(date);
  };

  const displayText = draft ?? currentValue ?? "";
  const displayedDate = normalizeCalendarDate(displayText);
  const typedIssue = draft !== null || Boolean(
    displayText && (!displayedDate || !isSelectableDate(displayedDate))
  );
  const fieldInvalid = Boolean(error) || typedIssue;
  const validateValue = (candidate: unknown) => {
    if (draft !== null) return labels.unavailableRange;
    if (typeof candidate !== "string" || !candidate) return null;
    const date = normalizeCalendarDate(candidate);
    return !date || isDateUnavailable?.(date) ? labels.unavailableRange : null;
  };

  // Constraints can change while the native text stays the same. Base remains the
  // validation owner; refresh its native custom validity as well as the field's visuals.
  useEffect(() => {
    fieldActionsRef.current?.validate();
  }, [displayText, typedIssue, minDate, maxDate, isDateUnavailable, disabled, labels.unavailableRange]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const next = normalizeCalendarDate(input.value);
    if (input.validity.badInput || (input.value && (!next || !isSelectableDate(next)))) {
      setDraft(input.value);
      return;
    }
    setDraft(null);
    commitValue(next);
  };

  const handleCalendarChange = (next: CalendarDate | null) => {
    if (disabled) return;
    setDraft(null);
    commitValue(next);
    if (next) popupActionsRef.current?.close();
  };

  return (
    <Field
      label={label}
      description={description}
      error={error || (typedIssue ? labels.unavailableRange : undefined)}
      required={required}
      disabled={disabled}
      invalid={typedIssue}
      validate={validateValue}
      validationMode="onChange"
      actionsRef={fieldActionsRef}
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
          <div className={cn("min-w-0 flex-1 overflow-hidden")}>
            <BaseField.Control
              ref={ref}
              render={<input type="date" ref={inputRef} />}
              id={id}
              name={name}
              form={form}
              required={required}
              disabled={disabled}
              min={minDate ?? undefined}
              max={maxDate ?? undefined}
              value={displayText}
              onChange={handleInputChange}
              className={cn(dateInputClassName)}
            />
          </div>
          <DateFieldTrigger label={`Open ${label}`} disabled={disabled} />
        </div>

        <DateCalendarPopup title={label} anchor={() => inputRef.current?.parentElement?.parentElement ?? null}>
          <Calendar
            mode="single"
            value={currentValue}
            onValueChange={handleCalendarChange}
            disabled={disabled}
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
