/* The date family's own calendar arithmetic, labels and Intl formatting.
   ====================================================================
   `Calendar`, `DatePicker` and `DateRangePicker` share one definition of what a date *is*, so a
   calendar grid, a native `type=date` input and a range span all agree.

   A `CalendarDate` is a zero-padded Gregorian civil date (`YYYY-MM-DD`, years `0001`–`9999`) and
   carries no time. Every arithmetic step below reads and writes calendar fields directly, through
   the pure helpers in this module, rather than going through a timestamp: a local-midnight
   `Date` would shift a day under a daylight-saving transition, and `Date.UTC` silently maps a
   year below 100 onto `1900 + year`. The only `Date` objects here are the ones `Intl` needs to
   *format* a value, and they are built through `setUTCFullYear` so year `0001` survives.

   This module is private to the date family. The public date types are re-exported from
   `Calendar.tsx`, which is the family's public entry. */

export type CalendarDate = string;

export interface DateRange {
  start: CalendarDate | null;
  end: CalendarDate | null;
}

/** A parsed civil date. `month` is 0-based, as every `Intl` and `Date` API expects. */
export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** Inclusive year bounds of the value format: `0001-01-01` through `9999-12-31`. */
export const MIN_CALENDAR_YEAR = 1;
export const MAX_CALENDAR_YEAR = 9999;

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number, length: number) => String(value).padStart(length, "0");

export const isLeapYear = (year: number) =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export const daysInMonth = (year: number, month: number) =>
  month === 1 && isLeapYear(year) ? 29 : DAYS_PER_MONTH[month];

/**
 * The only way a value becomes a date. A value that is not zero-padded, not a real civil date
 * (including a day that does not exist in its month) or outside the year bounds is not a date at
 * all, so callers never have to reason about a half-valid value.
 */
export const parseCalendarDate = (value: CalendarDate | null | undefined): DateParts | null => {
  if (typeof value !== "string") return null;

  const match = DATE_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (year < MIN_CALENDAR_YEAR || year > MAX_CALENDAR_YEAR) return null;
  if (month < 0 || month > 11) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;

  return { year, month, day };
};

export const isValidCalendarDate = (value: CalendarDate | null | undefined) =>
  parseCalendarDate(value) !== null;

export const toCalendarDate = ({ year, month, day }: DateParts): CalendarDate =>
  `${pad(year, 4)}-${pad(month + 1, 2)}-${pad(day, 2)}`;

/** A calendar date, or `null` when the input is not one. */
export const normalizeCalendarDate = (value: CalendarDate | null | undefined): CalendarDate | null => {
  const parts = parseCalendarDate(value);
  return parts ? toCalendarDate(parts) : null;
};

export const normalizeDateRange = (range: DateRange | null | undefined): DateRange => ({
  start: normalizeCalendarDate(range?.start),
  end: normalizeCalendarDate(range?.end),
});

export const emptyDateRange = (): DateRange => ({ start: null, end: null });

/* Zero-padded dates order lexicographically exactly as they order in time, so comparison needs no
   parsing. */
export const compareCalendarDates = (left: CalendarDate, right: CalendarDate) =>
  left === right ? 0 : left < right ? -1 : 1;

/** Day of week, `0` for Sunday. Sakamoto's algorithm: pure integer arithmetic, so it is exact for
 *  the whole year range rather than only for the years a `Date` round-trip happens to preserve. */
export const dayOfWeek = ({ year, month, day }: DateParts): number => {
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 2 ? year - 1 : year;

  return (
    (adjustedYear +
      Math.floor(adjustedYear / 4) -
      Math.floor(adjustedYear / 100) +
      Math.floor(adjustedYear / 400) +
      offsets[month] +
      day) %
    7
  );
};

export const addCalendarDays = ({ year, month, day }: DateParts, delta: number): DateParts => {
  let nextYear = year;
  let nextMonth = month;
  let nextDay = day + delta;

  while (nextDay < 1) {
    nextMonth -= 1;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    nextDay += daysInMonth(nextYear, nextMonth);
  }

  while (nextDay > daysInMonth(nextYear, nextMonth)) {
    nextDay -= daysInMonth(nextYear, nextMonth);
    nextMonth += 1;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
  }

  return { year: nextYear, month: nextMonth, day: nextDay };
};

/** Moves by whole months and **clamps** the day to the target month, which is what keeps
 *  `2024-01-31` a real date when the grid walks into February. The result never leaves the year
 *  bounds, so month and year navigation cannot escape `0001`–`9999`. */
export const addCalendarMonths = ({ year, month, day }: DateParts, delta: number): DateParts => {
  const minIndex = MIN_CALENDAR_YEAR * 12;
  const maxIndex = MAX_CALENDAR_YEAR * 12 + 11;
  const index = Math.min(maxIndex, Math.max(minIndex, year * 12 + month + delta));
  const nextYear = Math.floor(index / 12);
  const nextMonth = index % 12;

  return { year: nextYear, month: nextMonth, day: Math.min(day, daysInMonth(nextYear, nextMonth)) };
};

/** Walks an inclusive span once and reports whether any date in it matches `predicate`. */
export const rangeIncludesDate = (
  from: DateParts,
  to: DateParts,
  predicate: (date: CalendarDate) => boolean
): boolean => {
  const last = toCalendarDate(to);
  let cursor = from;

  while (!predicate(toCalendarDate(cursor))) {
    if (toCalendarDate(cursor) === last) return false;
    cursor = addCalendarDays(cursor, 1);
  }

  return true;
};

/** Today in UTC calendar fields — the value an application overrides through `today` when its own
 *  civil day differs from UTC. */
export const todayCalendarDate = (): CalendarDate => {
  const now = new Date();
  return toCalendarDate({
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
    day: now.getUTCDate(),
  });
};

/* A `Date` only so `Intl` can format; the calendar fields are set through `setUTCFullYear`, which
   keeps year `0001` intact instead of folding it into the 1900s. */
const utcDate = ({ year, month, day }: DateParts) => {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month, day);
  return date;
};

export interface CalendarFormat {
  /** The visible and announced month caption, e.g. `January 2024`. */
  formatMonthYear: (parts: DateParts) => string;
  /** The day number as the locale writes digits. */
  formatDayNumber: (day: number) => string;
  /** Weekday headings, indexed from Sunday. `short` is shown, `long` is the heading's name. */
  weekdayNames: { short: string; long: string }[];
  /** The day's full accessible name, e.g. `Monday, January 15, 2024`. */
  formatDate: (parts: DateParts) => string;
}

/* 2024-01-07 is a Sunday, which is what anchors the weekday headings: asking `Intl` for a weekday
   name needs a date, and a fixed one keeps the headings independent of the visitor's clock. */
const WEEKDAY_ANCHOR: DateParts = { year: 2024, month: 0, day: 7 };

/**
 * The locale's month, weekday and full-date wording, with the Gregorian calendar and UTC fixed.
 * Values stay Gregorian and zero-padded whatever the locale is, so a locale changes how a date is
 * written and announced, never what it means.
 */
export const createCalendarFormat = (locale: string): CalendarFormat => {
  const shared = { timeZone: "UTC", calendar: "gregory" } as const;
  const monthYear = new Intl.DateTimeFormat(locale, { ...shared, month: "long", year: "numeric" });
  const fullDate = new Intl.DateTimeFormat(locale, { ...shared, dateStyle: "full" });
  const dayNumber = new Intl.NumberFormat(locale, { useGrouping: false });
  const shortWeekday = new Intl.DateTimeFormat(locale, { ...shared, weekday: "short" });
  const longWeekday = new Intl.DateTimeFormat(locale, { ...shared, weekday: "long" });

  const weekdayNames = Array.from({ length: 7 }, (_, index) => {
    const date = utcDate(addCalendarDays(WEEKDAY_ANCHOR, index));
    return { short: shortWeekday.format(date), long: longWeekday.format(date) };
  });

  return {
    formatMonthYear: (parts) => monthYear.format(utcDate(parts)),
    formatDayNumber: (day) => dayNumber.format(day),
    weekdayNames,
    formatDate: (parts) => fullDate.format(utcDate(parts)),
  };
};

export interface CalendarLabels {
  /** The control that moves the grid to the previous month. */
  previousMonth: string;
  /** The control that moves the grid to the next month. */
  nextMonth: string;
  /** The control that navigates to today without selecting it. */
  today: string;
  /** Describes a single-date grid to assistive technology. */
  selectDate: string;
  /** Describes a range grid to assistive technology. */
  selectRange: string;
  /** Reported when a date — or a range — cannot be selected or is not acceptable. */
  unavailableRange: string;
}

export const defaultCalendarLabels: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  today: "Today",
  selectDate: "Select a date",
  selectRange: "Select a range",
  unavailableRange: "That range includes an unavailable date",
};

export const resolveCalendarLabels = (labels?: Partial<CalendarLabels>): CalendarLabels => ({
  ...defaultCalendarLabels,
  ...labels,
});
