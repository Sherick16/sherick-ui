"use client";

import { useState } from "react";
import { Button, Calendar, DatePicker, DateRangePicker, DirectionProvider, type CalendarDate, type DateRange } from "sherick-ui";
import { cn, material, shape, text } from "sherick-ui/dev";

const leapMonth: CalendarDate = "2024-02-15";
const rangeStart: DateRange = { start: "2024-01-08", end: "2024-01-12" };
const pickerUnavailable = (date: CalendarDate) => date === "2024-06-18" || date === "2024-06-19";

const Panel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(shape.surface, material.matte, "inline-flex min-w-0 max-w-full flex-col gap-3 p-3", className)}>
    {children}
  </div>
);

const Readout = ({ testId, children }: { testId: string; children: React.ReactNode }) => (
  <p data-testid={testId} className={cn("text-xs", text.medium)}>
    {children}
  </p>
);

export default function DateFamilySpecimen({ verification = false }: { verification?: boolean }) {
  const Heading = verification ? "h2" : "h4";
  const [single, setSingle] = useState<CalendarDate | null>(leapMonth);
  const [range, setRange] = useState<DateRange>(rangeStart);
  const [controlled, setControlled] = useState<CalendarDate | null>("2024-03-10");
  const [controlledMonth, setControlledMonth] = useState<CalendarDate>("2024-03-01");
  const [rejectMonth, setRejectMonth] = useState(false);

  const [picker, setPicker] = useState<CalendarDate | null>("2024-06-14");
  const [rangePicker, setRangePicker] = useState<DateRange>({ start: "2024-06-03", end: "2024-06-07" });
  const [formResult, setFormResult] = useState("");

  return (
    <div className={verification ? "space-y-12" : "grid grid-cols-1 items-start gap-8 lg:grid-cols-2"}>
      <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Single calendar</Heading>
        <div data-testid="single-calendar">
          <Panel>
            <Calendar
              defaultValue={leapMonth}
              today="2024-02-20"
              onValueChange={(next) => setSingle(next)}
            />
            <Readout testId="single-value">{single ?? "none"}</Readout>
          </Panel>
        </div>
      </section>

      <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Range calendar</Heading>
        <div data-testid="range-calendar">
          <Panel>
            <Calendar
              mode="range"
              value={range}
              onValueChange={(next) => setRange(next)}
              today="2024-01-15"
              min="2024-01-05"
              max="2024-01-31"
              isDateUnavailable={(date) => date === "2024-01-24" || date === "2024-01-25"}
            />
            <Readout testId="range-value">
              {range.start ?? "none"} → {range.end ?? "none"}
            </Readout>
          </Panel>
        </div>
      </section>

      {verification && <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Controlled month and value</Heading>
        <div data-testid="controlled-calendar">
          <Panel>
            <Calendar
              value={controlled}
              onValueChange={(next) => setControlled(next)}
              month={controlledMonth}
              onMonthChange={(next) => {
                if (!rejectMonth) setControlledMonth(next);
              }}
              today="2024-03-15"
            />
            <Readout testId="controlled-value">{controlled ?? "none"}</Readout>
            <Readout testId="controlled-month">{controlledMonth}</Readout>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                appearance="tonal"
                variant="secondary"
                onClick={() => setControlled("2024-05-04")}
                data-testid="controlled-set"
              >
                Set May 4
              </Button>
              <Button
                size="sm"
                appearance="tonal"
                variant="secondary"
                onClick={() => setControlled(null)}
                data-testid="controlled-clear"
              >
                Clear
              </Button>
              <label className="flex items-center gap-2 text-xs text-sherick-ink-muted">
                <input
                  type="checkbox"
                  checked={rejectMonth}
                  onChange={(event) => setRejectMonth(event.target.checked)}
                  data-testid="controlled-reject"
                />
                Reject month changes
              </label>
            </div>
          </Panel>
        </div>
      </section>}

      {verification && <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Bounds, disabled and invalid</Heading>
        <div className="flex flex-wrap items-start gap-6">
          {verification && <>
          <Panel>
            <span className="text-xs text-sherick-ink-muted">First month of the value format</span>
            <div data-testid="bounds-calendar">
              <Calendar month="0001-01-01" today="0001-01-01" />
            </div>
          </Panel>
          <Panel>
            <span className="text-xs text-sherick-ink-muted">Last month of the value format</span>
            <div data-testid="last-bounds-calendar">
              <Calendar month="9999-12-01" today="9999-12-31" />
            </div>
          </Panel>
          </>}
          <Panel>
            <span className="text-xs text-sherick-ink-muted">Disabled</span>
            <div data-testid="disabled-calendar">
              <Calendar disabled defaultValue="2024-04-10" today="2024-04-10" />
            </div>
          </Panel>
          <Panel>
            <span className="text-xs text-sherick-ink-muted">Invalid value</span>
            <div data-testid="invalid-calendar">
              <Calendar invalid defaultValue="2024-04-10" today="2024-04-10" />
            </div>
          </Panel>
        </div>
      </section>}

      {verification && <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Locale and week start</Heading>
        <div data-testid="locale-calendar">
          <Panel>
            <Calendar
              defaultValue="2024-07-04"
              today="2024-07-04"
              locale="de-DE"
              weekStartsOn={0}
              labels={{ previousMonth: "Voriger Monat", nextMonth: "Nächster Monat" }}
            />
          </Panel>
        </div>
      </section>}

      {verification && <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Narrow container and right-to-left</Heading>
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-64 max-w-full" data-testid="narrow-calendar">
            <Calendar
              mode="range"
              defaultValue={{ start: "2024-08-05", end: "2024-08-09" }}
              today="2024-08-07"
            />
          </div>
          <div dir="rtl" data-testid="rtl-calendar">
            <DirectionProvider direction="rtl">
              <Calendar
                defaultValue="2024-09-11"
                today="2024-09-11"
                labels={{ selectDate: "اختر تاريخًا" }}
              />
            </DirectionProvider>
          </div>
        </div>
      </section>}

      <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Date field</Heading>
        <div className="flex flex-wrap items-start gap-6">
          <div className="w-72 max-w-full space-y-2" data-testid="picker-field">
            <DatePicker
              label="Arrival date"
              description="The day you arrive on site."
              value={picker}
              onValueChange={setPicker}
              min="2024-06-01"
              max="2024-06-30"
              isDateUnavailable={pickerUnavailable}
              today="2024-06-14"
            />
            <Readout testId="picker-value">{picker ?? "none"}</Readout>
          </div>
          {verification && <>
          <div className="w-72 max-w-full" data-testid="picker-default-field">
            <DatePicker
              label="Review date"
              defaultValue="2024-10-31"
              required
              description="Defaults to the last day of October."
            />
          </div>
          <div className="w-72 max-w-full" data-testid="picker-error-field">
            <DatePicker label="Cut-off date" error="Choose a date in the current cycle." required />
          </div>
          <div className="w-72 max-w-full" data-testid="picker-disabled-field">
            <DatePicker label="Archived date" defaultValue="2023-02-28" disabled />
          </div>
          <div className="w-72 max-w-full" data-testid="picker-locale-field">
            <DatePicker label="Anreisedatum" defaultValue="2024-07-04" locale="de-DE" />
          </div>
          </>}
        </div>
      </section>

      <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Date range field</Heading>
        <div className="w-[36rem] max-w-full" data-testid="range-picker-field">
          <DateRangePicker
            label="Release window"
            description="Two endpoints, one calendar."
            value={rangePicker}
            onValueChange={setRangePicker}
            startName="releaseStart"
            endName="releaseEnd"
            min="2024-06-01"
            max="2024-06-30"
            isDateUnavailable={(date) => date === "2024-06-18"}
            today="2024-06-10"
          />
        </div>
        <Readout testId="range-picker-value">
          {rangePicker.start ?? "none"} → {rangePicker.end ?? "none"}
        </Readout>
      </section>

      {verification && <section className="space-y-3">
        <Heading className="text-lg font-medium text-sherick-ink">Native form, submission and reset</Heading>
        <form
          data-testid="leap-form"
          className="flex w-[30rem] max-w-full flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setFormResult(`leap=${String(data.get("leapDay") ?? "")}`);
          }}
        >
          <DatePicker
            label="Leap day"
            name="leapDay"
            defaultValue="2024-02-29"
            min="2024-01-01"
            max="2024-12-31"
            required
            today="2024-02-20"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" appearance="filled">
              Submit
            </Button>
            <Button type="reset" size="sm" appearance="tonal" variant="secondary">
              Reset
            </Button>
            <span data-testid="form-result" className="text-xs text-sherick-ink-muted">
              {formResult}
            </span>
          </div>
        </form>
      </section>}
    </div>
  );
}
