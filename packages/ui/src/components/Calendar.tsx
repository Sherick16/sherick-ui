"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
} from "react";
import { cn } from "@/libs/utils";
import { density, focusRingInset, shape, state, stateLayer, text, tone } from "./ui.common";
import { motionFeedback, motionInkPress, motionTactile } from "./ui.motion";
import {
  addCalendarDays,
  addCalendarMonths,
  compareCalendarDates,
  createCalendarFormat,
  dayOfWeek,
  daysInMonth,
  normalizeCalendarDate,
  normalizeDateRange,
  parseCalendarDate,
  rangeIncludesDate,
  resolveCalendarLabels,
  toCalendarDate,
  todayCalendarDate,
  type CalendarDate,
  type CalendarLabels,
  type DateParts,
  type DateRange,
} from "./date-family";

export type { CalendarDate, CalendarLabels, DateRange } from "./date-family";

interface CalendarBaseProps
  extends Omit<
    ComponentProps<"div">,
    "children" | "value" | "defaultValue" | "defaultChecked" | "onChange"
  > {
  /** The month on screen, normalized to its first day. Undefined means the calendar owns it. */
  month?: CalendarDate;
  defaultMonth?: CalendarDate;
  /** Receives the month the grid moved to, as a date normalized to its first day. */
  onMonthChange?: (month: CalendarDate) => void;
  /** The earliest selectable date, inclusive. */
  min?: CalendarDate;
  /** The latest selectable date, inclusive. */
  max?: CalendarDate;
  /**
   * Whether a date cannot be chosen. Unavailable dates stay visible, focusable and announced as
   * disabled; they are simply never selected, and a range may not span one.
   */
  isDateUnavailable?: (date: CalendarDate) => boolean;
  disabled?: boolean;
  /** Marks the calendar's own value as not acceptable; the selection wears the danger tone. */
  invalid?: boolean;
  /** A BCP 47 tag. It changes how the grid writes and announces dates, never what they mean. */
  locale?: string;
  /** Which weekday a row starts on: 0 is Sunday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** The civil day this application calls today; defaults to the current UTC day. */
  today?: CalendarDate;
  labels?: Partial<CalendarLabels>;
}

interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onValueChange?: (value: CalendarDate | null) => void;
}

interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (value: DateRange) => void;
}

/** A single-date grid, or a range grid whose selection is a pair of endpoints. */
export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/* The props a discriminated union has in common, which is the shape the component reads its
   runtime state from. Each callback is addressed in the branch its mode owns. */
type CalendarRuntimeProps = Omit<CalendarBaseProps, "mode"> & {
  mode?: "single" | "range";
  value?: CalendarDate | DateRange | null;
  defaultValue?: CalendarDate | DateRange | null;
  onValueChange?: ((value: CalendarDate | null) => void) | ((value: DateRange) => void);
};

const EMPTY_RANGE: DateRange = { start: null, end: null };

/* Icon-only navigation keeps its full target; only its mark answers a press. */
const navigationButtonClassName = `group inline-flex shrink-0 items-center justify-center ${density.target} ${shape.circle} ${text.high} ${motionFeedback} ${focusRingInset} ${stateLayer.quiet}`;

/* A content-width text control, so its corner is the pill. */
const todayButtonClassName = `inline-flex shrink-0 items-center justify-center px-4 ${density.compact} ${shape.pill} ${text.high} ${motionFeedback} ${motionTactile} ${focusRingInset} ${stateLayer.quiet}`;

/* The visual mark of one day. A day is a compact square target, so its corner is the circle, and
   it is flat: depth never announces hover or selection inside a grid. Its press is tone alone —
   the day boundary is what the reader is aiming at, and it does not move. */
const dayButtonClassName = `relative inline-flex size-10 shrink-0 select-none items-center justify-center text-sm tabular-nums ${shape.circle} ${motionFeedback} ${focusRingInset}`;

/**
 * One month of a Gregorian calendar, navigated as a keyboard grid.
 *
 * The grid follows the APG date-picker model: a `grid` of `gridcolumnheader` and `gridcell`
 * elements, exactly one tabbable day, `aria-selected` on the selected cells and `aria-current`
 * on today. Arrow keys move by day and week, Home and End move within the row, PageUp and
 * PageDown move a month, and Shift with them moves a year; every one of those retains a real
 * day under focus, so the grid can be crossed by keyboard alone. The horizontal arrows mirror in
 * a right-to-left page, because the reader's "next day" is the direction the text runs in.
 *
 * Days outside `min` and `max`, or refused by `isDateUnavailable`, stay in the grid — they are
 * discoverable, focusable and announced as disabled — and selection is refused on them. A range
 * may not span one either: an endpoint that would complete such a range is refused and the
 * reason is announced, because a completed range must describe dates the application can accept.
 *
 * Values are `YYYY-MM-DD` civil dates and carry no time; every step the grid takes is calendar
 * arithmetic, so a month crossing, a leap day and a year boundary are all exact.
 */
const Calendar = forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const {
    mode = "single",
    value,
    defaultValue,
    onValueChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    min,
    max,
    isDateUnavailable,
    disabled = false,
    invalid = false,
    locale = "en-US",
    weekStartsOn = 1,
    today: todayProp,
    labels: labelsProp,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...divProps
  } = props as CalendarRuntimeProps & Pick<ComponentProps<"div">, "aria-label" | "aria-labelledby">;

  const isRange = mode === "range";
  const changeSingle = onValueChange as ((value: CalendarDate | null) => void) | undefined;
  const changeRange = onValueChange as ((value: DateRange) => void) | undefined;

  const labels = useMemo(() => resolveCalendarLabels(labelsProp), [labelsProp]);
  const format = useMemo(() => createCalendarFormat(locale), [locale]);
  const direction = useDirection();
  /* Which way a horizontal arrow walks in *time*: the page's reading direction, not the screen's. */
  const mirror = direction === "rtl" ? -1 : 1;

  const today = useMemo(() => normalizeCalendarDate(todayProp) ?? todayCalendarDate(), [todayProp]);
  const todayParts = parseCalendarDate(today)!;
  const minDate = useMemo(() => normalizeCalendarDate(min), [min]);
  const maxDate = useMemo(() => normalizeCalendarDate(max), [max]);

  const readSingle = useCallback(
    (input: CalendarDate | DateRange | null | undefined) =>
      isRange ? null : normalizeCalendarDate(input as CalendarDate | null | undefined),
    [isRange]
  );
  const readRange = useCallback(
    (input: CalendarDate | DateRange | null | undefined) =>
      isRange ? normalizeDateRange(input as DateRange | null | undefined) : EMPTY_RANGE,
    [isRange]
  );

  const [internalValue, setInternalValue] = useState<CalendarDate | null>(() => readSingle(defaultValue));
  const [internalRange, setInternalRange] = useState<DateRange>(() => readRange(defaultValue));

  const selectedValue = value === undefined ? internalValue : readSingle(value);
  const selectedRange = value === undefined ? internalRange : readRange(value);
  const selectionAnchor = isRange
    ? selectedRange.start ?? selectedRange.end
    : selectedValue;

  /* The month on screen. A controlled month is only reported, never mirrored, so a parent that
     refuses a move keeps the grid it had — and the focus it had. */
  const monthParts = parseCalendarDate(monthProp);
  const defaultMonthParts = parseCalendarDate(defaultMonth);
  const anchorParts = parseCalendarDate(selectionAnchor);
  const initialView: DateParts = (() => {
    const source = monthParts ?? defaultMonthParts ?? anchorParts ?? todayParts;
    return { year: source.year, month: source.month, day: 1 };
  })();

  const [internalMonth, setInternalMonth] = useState<DateParts>(initialView);
  const view: DateParts = monthParts
    ? { year: monthParts.year, month: monthParts.month, day: 1 }
    : internalMonth;

  const monthLength = daysInMonth(view.year, view.month);
  const leadingBlanks = (dayOfWeek({ year: view.year, month: view.month, day: 1 }) - weekStartsOn + 7) % 7;

  /* The one tabbable day: the selection when it is on screen, otherwise today, otherwise the
     first of the month. It is a *day*, so a month change carries it and a smaller month clamps
     it rather than losing it. */
  const [activeDayState, setActiveDayState] = useState<number>(() => {
    const onScreen = (parts: DateParts | null) =>
      parts && parts.year === initialView.year && parts.month === initialView.month ? parts.day : null;
    return onScreen(anchorParts) ?? onScreen(todayParts) ?? 1;
  });
  const activeDay = Math.min(activeDayState, monthLength);

  const gridRef = useRef<HTMLTableElement | null>(null);
  // Only explicit grid navigation may move day focus. Native header buttons keep their focus.
  const [pendingDayFocus, setPendingDayFocus] = useState<CalendarDate | null>(null);
  const focusIsInGrid = () => {
    const grid = gridRef.current;
    const focused = typeof document === "undefined" ? null : document.activeElement;
    return Boolean(grid && focused && grid.contains(focused));
  };

  const requestMonth = useCallback(
    (next: DateParts) => {
      if (next.year === view.year && next.month === view.month) return;
      if (monthProp === undefined) setInternalMonth({ year: next.year, month: next.month, day: 1 });
      onMonthChange?.(toCalendarDate({ year: next.year, month: next.month, day: 1 }));
    },
    [monthProp, onMonthChange, view.year, view.month]
  );

  /* A value that changed from the outside — an application update, a form reset — brings the grid
     to it, without moving focus: the calendar is being told what happened, not navigated. */
  const lastAnchor = useRef(selectionAnchor);
  useEffect(() => {
    if (lastAnchor.current === selectionAnchor) return;
    lastAnchor.current = selectionAnchor;
    const parts = parseCalendarDate(selectionAnchor);
    if (!parts) return;
    setActiveDayState(parts.day);
    requestMonth({ year: parts.year, month: parts.month, day: 1 });
  }, [selectionAnchor, requestMonth]);

  useEffect(() => {
    if (!pendingDayFocus) return;
    // A rejected controlled month has no matching day. Preserve both its focus and tab stop.
    if (focusIsInGrid() || document.activeElement === document.body) {
      gridRef.current?.querySelector<HTMLElement>(`[data-day="${pendingDayFocus}"]`)?.focus();
    }
    setPendingDayFocus(null);
  }, [pendingDayFocus, view.year, view.month]);

  const isUnavailableDate = useCallback(
    (date: CalendarDate) => {
      if (minDate && compareCalendarDates(date, minDate) < 0) return true;
      if (maxDate && compareCalendarDates(date, maxDate) > 0) return true;
      return Boolean(isDateUnavailable?.(date));
    },
    [minDate, maxDate, isDateUnavailable]
  );

  const rangeSelectionInvalid = isRange && Boolean(
    (selectedRange.start && isUnavailableDate(selectedRange.start)) ||
    (selectedRange.end && isUnavailableDate(selectedRange.end)) ||
    (selectedRange.start && selectedRange.end && selectedRange.start > selectedRange.end) ||
    (isDateUnavailable && selectedRange.start && selectedRange.end &&
      rangeIncludesDate(parseCalendarDate(selectedRange.start)!, parseCalendarDate(selectedRange.end)!, isDateUnavailable))
  );
  const isSelectedDate = (date: CalendarDate) => {
    if (isUnavailableDate(date) || rangeSelectionInvalid) return false;
    if (isRange) {
      const { start, end } = selectedRange;
      if (!start) return false;
      if (!end) return date === start;
      return compareCalendarDates(date, start) >= 0 && compareCalendarDates(date, end) <= 0;
    }
    return selectedValue === date;
  };

  const isRangeEdge = (date: CalendarDate) =>
    isRange && (selectedRange.start === date || selectedRange.end === date);

  const [rangeMessage, setRangeMessage] = useState<string | null>(null);

  const notifySingle = (next: CalendarDate | null) => {
    if (value === undefined) setInternalValue(next);
    changeSingle?.(next);
  };

  const notifyRange = (next: DateRange) => {
    if (value === undefined) setInternalRange(next);
    changeRange?.(next);
  };

  const selectDate = (date: CalendarDate) => {
    if (disabled || isUnavailableDate(date)) return;

    if (!isRange) {
      setRangeMessage(null);
      notifySingle(date);
      return;
    }

    const { start, end } = selectedRange;
    /* A range that is complete, or absent, starts again from this date. */
    if (!start || (start && end)) {
      setRangeMessage(null);
      notifyRange({ start: date, end: null });
      return;
    }

    const ordered =
      compareCalendarDates(date, start) < 0 ? { start: date, end: start } : { start, end: date };
    const from = parseCalendarDate(ordered.start)!;
    const to = parseCalendarDate(ordered.end)!;

    if (rangeIncludesDate(from, to, isUnavailableDate)) {
      setRangeMessage(labels.unavailableRange);
      return;
    }

    setRangeMessage(null);
    notifyRange(ordered);
  };

  const navigateTo = (next: DateParts) => {
    if (next.year < 1 || next.year > 9999) return;
    const sameMonth = next.year === view.year && next.month === view.month;
    if (monthProp === undefined || sameMonth) setActiveDayState(next.day);
    if (focusIsInGrid()) setPendingDayFocus(toCalendarDate(next));
    requestMonth(next);
  };

  const focusDay = (day: number) => {
    navigateTo(addCalendarDays({ year: view.year, month: view.month, day: 1 }, day - 1));
  };

  const walkMonth = (delta: number, deltaYears = 0) => {
    navigateTo(addCalendarMonths(
      { year: view.year, month: view.month, day: activeDay },
      deltaYears === 0 ? delta : deltaYears * 12
    ));
  };

  const columnOf = (day: number) => (leadingBlanks + day - 1) % 7;

  const goToToday = () => navigateTo(todayParts);

  const handleGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    if (disabled) return;

    const target = (event.target as HTMLElement).dataset.day;
    const parts = parseCalendarDate(target);
    if (!parts) return;

    switch (event.key) {
      case "ArrowLeft":
        focusDay(parts.day - mirror);
        break;
      case "ArrowRight":
        focusDay(parts.day + mirror);
        break;
      case "ArrowUp":
        focusDay(parts.day - 7);
        break;
      case "ArrowDown":
        focusDay(parts.day + 7);
        break;
      case "Home":
        focusDay(parts.day - columnOf(parts.day));
        break;
      case "End":
        focusDay(parts.day + (6 - columnOf(parts.day)));
        break;
      case "PageUp":
        walkMonth(-1, event.shiftKey ? -1 : 0);
        break;
      case "PageDown":
        walkMonth(1, event.shiftKey ? 1 : 0);
        break;
      default:
        /* Enter and Space are the day button's own activation and need no translation. */
        return;
    }

    event.preventDefault();
  };


  const atFirstMonth = view.year === 1 && view.month === 0;
  const atLastMonth = view.year === 9999 && view.month === 11;

  const cells: (number | null)[] = [];
  for (let blank = 0; blank < leadingBlanks; blank += 1) cells.push(null);
  for (let day = 1; day <= monthLength; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) rows.push(cells.slice(index, index + 7));

  const captionId = useId();
  const hintId = useId();

  return (
    <div
      {...divProps}
      ref={ref}
      /* A month grid is inherently seven columns wide. It keeps its own width and scrolls inside
         itself rather than spilling into a parent that is narrower than the grid. */
      className={cn(
        "inline-flex w-max max-w-full flex-col overflow-x-auto",
        disabled && state.disabled,
        className
      )}
    >
      <div className={cn("mb-2 flex items-center justify-between gap-2")}>
        <button
          type="button"
          aria-label={labels.previousMonth}
          disabled={disabled || atFirstMonth}
          onClick={() => walkMonth(-1)}
          className={cn(
            navigationButtonClassName,
            disabled ? state.disabledDescendant : atFirstMonth ? state.disabled : state.enabled
          )}
        >
          <span className={cn("inline-flex", motionInkPress)}>
            <ChevronLeft aria-hidden="true" className={cn("size-5", "[[dir=rtl]_&]:rotate-180")} />
          </span>
        </button>

        {/* The caption is the grid's name and the live region that reports a month crossing. */}
        <div
          id={captionId}
          aria-live="polite"
          className={cn("min-w-0 flex-1 truncate text-center text-sm font-medium", text.high)}
        >
          {format.formatMonthYear(view)}
        </div>

        <button
          type="button"
          aria-label={labels.nextMonth}
          disabled={disabled || atLastMonth}
          onClick={() => walkMonth(1)}
          className={cn(
            navigationButtonClassName,
            disabled ? state.disabledDescendant : atLastMonth ? state.disabled : state.enabled
          )}
        >
          <span className={cn("inline-flex", motionInkPress)}>
            <ChevronRight aria-hidden="true" className={cn("size-5", "[[dir=rtl]_&]:rotate-180")} />
          </span>
        </button>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : ariaLabelledBy ?? captionId}
        aria-describedby={hintId}
        aria-multiselectable={isRange ? true : undefined}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={handleGridKeyDown}
        onBlur={(event) => {
          /* A day is no longer the focus, so a pending refocus must not claim it later. */
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPendingDayFocus(null);
          }
        }}
        className={cn("border-separate border-spacing-0")}
      >
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, index) => {
              const name = format.weekdayNames[(index + weekStartsOn) % 7];
              return (
                <th
                  key={name.long}
                  scope="col"
                  abbr={name.long}
                  className={cn("h-8 px-0 text-center text-xs font-medium", text.medium)}
                >
                  <span aria-hidden="true">{name.short}</span>
                  <span className={cn("sr-only")}>{name.long}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((day, columnIndex) => {
                if (day === null) {
                  return (
                    <td
                      key={`blank-${rowIndex}-${columnIndex}`}
                      role="gridcell"
                      className={cn("p-0 text-center align-middle")}
                    />
                  );
                }

                const date = toCalendarDate({ year: view.year, month: view.month, day });
                const parts: DateParts = { year: view.year, month: view.month, day };
                const unavailable = isUnavailableDate(date);
                const selected = isSelectedDate(date);
                const isToday = date === today;
                const isActive = day === activeDay;
                /* A range's endpoints carry the emphasis; its interior is the span between them.
                   A single selection is an endpoint of its own. */
                const isEdge = !isRange || isRangeEdge(date);
                const joinedRange = selected && isRange && Boolean(selectedRange.end) && selectedRange.start !== selectedRange.end;

                return (
                  <td
                    key={date}
                    role="gridcell"
                    aria-selected={selected || undefined}
                    aria-current={isToday ? "date" : undefined}
                    className={cn("relative p-0 text-center align-middle")}
                  >
                    {joinedRange && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute inset-y-1 inset-x-0",
                          date === selectedRange.start && cn(shape.pill, "rounded-e-none"),
                          date === selectedRange.end && cn(shape.pill, "rounded-s-none"),
                          invalid ? tone.selected.danger : tone.selected.primary
                        )}
                      />
                    )}
                    <button
                      type="button"
                      data-day={date}
                      tabIndex={disabled ? -1 : isActive ? 0 : -1}
                      aria-label={format.formatDate(parts)}
                      aria-disabled={unavailable || undefined}
                      disabled={disabled}
                      onClick={() => selectDate(date)}
                      onFocus={() => {
                        if (day !== activeDayState) setActiveDayState(day);
                      }}
                      className={cn(
                        dayButtonClassName,
                        text.high,
                        isToday && `${tone.text.primary} underline underline-offset-4`,
                        selected && isEdge && "font-medium",
                        selected && !joinedRange && (invalid ? tone.selected.danger : tone.selected.primary),
                        !disabled && !unavailable && `${stateLayer.quiet} ${state.enabled}`,
                        unavailable && !disabled && state.disabled,
                        disabled && state.disabledDescendant
                      )}
                    >
                      {format.formatDayNumber(day)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className={cn("mt-3 flex items-center justify-between gap-3")}>
        <button
          type="button"
          disabled={disabled}
          onClick={goToToday}
          className={cn(todayButtonClassName, disabled ? state.disabledDescendant : state.enabled)}
        >
          {labels.today}
        </button>

        <div role="status" className={cn("min-w-0 text-xs", tone.text.danger)}>
          {rangeMessage ?? ""}
        </div>
      </div>

      <p id={hintId} className={cn("sr-only")}>
        {isRange ? labels.selectRange : labels.selectDate}
      </p>
    </div>
  );
});
Calendar.displayName = "Calendar";

export default Calendar;
