"use client";

import { Field as BaseField } from "@base-ui/react/field";
import { Popover as BasePopover } from "@base-ui/react/popover";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
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
import { state, text, tone } from "./ui.common";
import {
  DateCalendarPopup,
  DateFieldTrigger,
  dateFieldRowClassName,
  dateInputClassName,
} from "./date-field";
import {
  compareCalendarDates,
  normalizeCalendarDate,
  normalizeDateRange,
  parseCalendarDate,
  rangeIncludesDate,
  resolveCalendarLabels,
  type CalendarDate,
  type CalendarLabels,
  type DateRange,
} from "./date-family";

export interface DateRangePickerProps {
  /** The selected range. `{ start: null, end: null }` is an empty selection; a start without an
   *  end is a range that is still being chosen. Undefined makes the picker uncontrolled. */
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  /** Receives the next range; clearing reports both endpoints as `null`. */
  onValueChange?: (value: DateRange) => void;
  /** Names the range group. */
  label: string;
  /** The first field's own label. */
  startLabel?: string;
  /** The second field's own label. */
  endLabel?: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Styles the range group. */
  className?: string;
  /** The first field's own id. The second derives its id from it. */
  id?: string;
  /** The form that owns the fields, when they render outside it. */
  form?: string;
  /** Identifies the range's start when it is submitted. */
  startName?: string;
  /** Identifies the range's end when it is submitted. */
  endName?: string;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BasePopover.Root.Props["onOpenChange"];
  /** The earliest acceptable date, inclusive. */
  min?: CalendarDate;
  /** The latest acceptable date, inclusive. */
  max?: CalendarDate;
  /** Whether a date cannot be chosen. A range may not span an unavailable date. */
  isDateUnavailable?: (date: CalendarDate) => boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  today?: CalendarDate;
  labels?: Partial<CalendarLabels>;
}

const mergeInputRef = (ref: ForwardedRef<HTMLInputElement>, local: React.RefObject<HTMLInputElement | null>) =>
  (node: HTMLInputElement | null) => {
    local.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

/**
 * A range of dates: two independently labelled native date fields in one named group, and one
 * calendar they share.
 *
 * Each endpoint is the browser's own `type=date` control, so entry, mobile UI, submission and the
 * `required` and `min`/`max` constraints belong to the platform. The picker's own rule is that a
 * range which reverses its endpoints or spans a date the application refuses is never accepted:
 * the typed value stays on screen, the field reports why, and the calendar's selection does not
 * move. The calendar itself refuses the same spans, so a pointer and a keyboard cannot reach a
 * range the field would reject.
 */
const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(({
  value,
  defaultValue,
  onValueChange,
  label,
  startLabel = "Start date",
  endLabel = "End date",
  description,
  error,
  required = false,
  disabled = false,
  className,
  id,
  form,
  startName,
  endName,
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
  const [internalRange, setInternalRange] = useState<DateRange>(() => normalizeDateRange(defaultValue));
  const currentRange = isControlled ? normalizeDateRange(value) : internalRange;
  const [typedIssue, setTypedIssue] = useState<"start" | "end" | null>(null);
  const [resetNonce, setResetNonce] = useState(0);

  const minDate = normalizeCalendarDate(min);
  const maxDate = normalizeCalendarDate(max);

  const startInputRef = useRef<HTMLInputElement | null>(null);
  const endInputRef = useRef<HTMLInputElement | null>(null);
  const popupActionsRef = useRef<BasePopover.Root.Actions | null>(null);
  const initialRange = useRef(normalizeDateRange(defaultValue));
  const assignStartRef = useCallback(mergeInputRef(ref, startInputRef), [ref]);

  const descriptionId = useId();
  const errorId = useId();
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    const input = startInputRef.current;
    if (!input) return;
    const next = currentRange.start ?? "";
    if (input.value !== next) input.value = next;
  }, [currentRange.start, resetNonce]);

  useEffect(() => {
    const input = endInputRef.current;
    if (!input) return;
    const next = currentRange.end ?? "";
    if (input.value !== next) input.value = next;
  }, [currentRange.end, resetNonce]);

  const commitRange = (next: DateRange) => {
    if (!isControlled) setInternalRange(next);
    onValueChange?.(next);
  };

  const isUnavailableDate = useCallback(
    (date: CalendarDate) => {
      if (minDate && compareCalendarDates(date, minDate) < 0) return true;
      if (maxDate && compareCalendarDates(date, maxDate) > 0) return true;
      return Boolean(isDateUnavailable?.(date));
    },
    [minDate, maxDate, isDateUnavailable]
  );

  const spanIsRefused = (from: CalendarDate, to: CalendarDate) => {
    const fromParts = parseCalendarDate(from);
    const toParts = parseCalendarDate(to);
    if (!fromParts || !toParts) return true;
    return rangeIncludesDate(fromParts, toParts, isUnavailableDate);
  };

  const isRangeAcceptable = (range: DateRange) => {
    if (range.start && isUnavailableDate(range.start)) return false;
    if (range.end && isUnavailableDate(range.end)) return false;
    if (range.start && range.end) {
      if (compareCalendarDates(range.end, range.start) < 0) return false;
      return !spanIsRefused(range.start, range.end);
    }
    return true;
  };

  /* Each field reports the problem from its own perspective, so whichever endpoint was typed last
     is the one that explains it. Bounds and emptiness are the browser's own validation. */
  const validateStart = (candidate: unknown) => {
    const date = typeof candidate === "string" ? normalizeCalendarDate(candidate) : null;
    if (!date) return null;
    if (isDateUnavailable?.(date)) return labels.unavailableRange;
    const end = currentRange.end;
    if (!end) return null;
    if (compareCalendarDates(date, end) > 0) return labels.unavailableRange;
    return spanIsRefused(date, end) ? labels.unavailableRange : null;
  };

  const validateEnd = (candidate: unknown) => {
    const date = typeof candidate === "string" ? normalizeCalendarDate(candidate) : null;
    if (!date) return null;
    if (isDateUnavailable?.(date)) return labels.unavailableRange;
    const start = currentRange.start;
    if (!start) return null;
    if (compareCalendarDates(date, start) < 0) return labels.unavailableRange;
    return spanIsRefused(start, date) ? labels.unavailableRange : null;
  };

  const handleStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const typedText = input.value;

    if (typedText === "") {
      if (input.validity.badInput) return;
      setTypedIssue(null);
      commitRange({ start: null, end: currentRange.end });
      return;
    }

    const date = normalizeCalendarDate(typedText);
    if (!date || !isRangeAcceptable({ start: date, end: currentRange.end })) {
      setTypedIssue("start");
      return;
    }

    setTypedIssue(null);
    commitRange({ start: date, end: currentRange.end });
  };

  const handleEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const typedText = input.value;

    if (typedText === "") {
      if (input.validity.badInput) return;
      setTypedIssue(null);
      commitRange({ start: currentRange.start, end: null });
      return;
    }

    const date = normalizeCalendarDate(typedText);
    if (!date || !isRangeAcceptable({ start: currentRange.start, end: date })) {
      setTypedIssue("end");
      return;
    }

    setTypedIssue(null);
    commitRange({ start: currentRange.start, end: date });
  };

  const handleReset = () => {
    const restored = normalizeDateRange(defaultValue);
    setResetNonce((nonce) => nonce + 1);
    setTypedIssue(null);
    if (restored.start !== currentRange.start || restored.end !== currentRange.end) {
      commitRange(restored);
    }
  };

  const handleCalendarChange = (next: DateRange) => {
    setTypedIssue(null);
    commitRange(next);
    /* A range is chosen when both ends exist; the surface has then done its job. */
    if (next.start && next.end) popupActionsRef.current?.close();
  };

  const row = (
    inputRef: React.Ref<HTMLInputElement>,
    inputId: string | undefined,
    inputName: string | undefined,
    inputLabel: string,
    initialValue: CalendarDate | null,
    invalid: boolean,
    validate: (candidate: unknown) => string | null,
    handleChange: (event: ChangeEvent<HTMLInputElement>) => void
  ) => (
    <Field label={inputLabel} invalid={invalid} validate={validate} validationMode="onChange">
      <div
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        className={cn(dateFieldRowClassName(disabled))}
      >
        <BaseField.Control
          render={<input type="date" ref={inputRef} />}
          id={inputId}
          name={inputName}
          form={form}
          required={required}
          disabled={disabled}
          min={minDate ?? undefined}
          max={maxDate ?? undefined}
          defaultValue={initialValue ?? ""}
          onChange={handleChange}
          className={cn(dateInputClassName)}
        />
        <DateFieldTrigger label={`Open ${inputLabel}`} disabled={disabled} />
      </div>
    </Field>
  );

  return (
    <fieldset
      disabled={disabled || undefined}
      aria-describedby={describedBy}
      onReset={handleReset}
      className={cn("m-0 min-w-0 p-0", disabled && state.disabled, className)}
    >
      <legend className={cn("p-0 text-sm font-medium", text.high)}>
        {label}
        {required && (
          <span className={cn("ms-1", tone.text.danger)} aria-hidden="true">
            *
          </span>
        )}
      </legend>

      <BasePopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        actionsRef={popupActionsRef}
        modal={false}
      >
        <div className={cn("mt-2 grid gap-4 sm:grid-cols-2")}>
          {row(
            assignStartRef,
            id,
            startName,
            startLabel,
            initialRange.current.start,
            typedIssue === "start" || Boolean(error),
            validateStart,
            handleStartChange
          )}
          {row(
            endInputRef,
            id ? `${id}-end` : undefined,
            endName,
            endLabel,
            initialRange.current.end,
            typedIssue === "end" || Boolean(error),
            validateEnd,
            handleEndChange
          )}
        </div>

        <DateCalendarPopup title={label}>
          <Calendar
            mode="range"
            value={currentRange}
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

      {description && (
        <p id={descriptionId} className={cn("mt-2 text-xs leading-5", text.medium)}>
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className={cn("mt-2 text-xs leading-5", tone.text.danger)}>
          {error}
        </p>
      )}
    </fieldset>
  );
});

DateRangePicker.displayName = "DateRangePicker";

export default DateRangePicker;
