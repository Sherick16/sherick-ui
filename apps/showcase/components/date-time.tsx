"use client";

import { useState } from "react";
import { Button, DateTimePicker, DirectionProvider, type CalendarDate, type CalendarDateTime } from "sherick-ui";
import { cn, text } from "sherick-ui/dev";

const closedDays = (date: CalendarDate) => date === "2024-06-18" || date === "2024-06-19";

const Readout = ({ testId, children }: { testId: string; children: React.ReactNode }) => (
  <p data-testid={testId} className={cn("text-xs", text.medium)}>
    {children}
  </p>
);

export default function DateTimeSpecimen({ verification = false }: { verification?: boolean }) {
  const Heading = verification ? "h2" : "h4";
  const [departure, setDeparture] = useState<CalendarDateTime | null>("2024-06-14T09:30");
  const [pickup, setPickup] = useState<CalendarDateTime | null>(null);
  const [formResult, setFormResult] = useState("");
  const [lockedOpen, setLockedOpen] = useState(false);
  const [lockedRequests, setLockedRequests] = useState(0);

  return (
    <div className={verification ? "space-y-12" : "grid grid-cols-1 items-start gap-8 lg:grid-cols-2"}>
      <section className="space-y-3">
        <Heading className="text-sm font-medium text-sherick-ink-muted">Date &amp; time field</Heading>
        <div className="w-80 max-w-full space-y-2" data-testid="date-time-field">
          <DateTimePicker
            label="Departure"
            description="Local time at the departure airport."
            value={departure}
            onValueChange={setDeparture}
            min="2024-06-01T06:00"
            max="2024-06-30T22:00"
            isDateUnavailable={closedDays}
            today="2024-06-14"
          />
          <Readout testId="date-time-value">{departure ?? "none"}</Readout>
        </div>
      </section>

      <section className="space-y-3">
        <Heading className="text-sm font-medium text-sherick-ink-muted">24-hour clock</Heading>
        <div className="w-80 max-w-full" data-testid="date-time-locale-field">
          <DateTimePicker
            label="Abfahrt"
            defaultValue="2024-07-04T18:45"
            locale="de-DE"
            minuteStep={15}
            today="2024-07-01"
            labels={{ hour: "Stunde", minute: "Minute", time: "Uhrzeit", done: "Fertig", today: "Heute" }}
          />
        </div>
      </section>

      {verification && <>
        <section className="space-y-3">
          <Heading className="text-sm font-medium text-sherick-ink-muted">Empty, waiting for both halves</Heading>
          <div className="w-80 max-w-full space-y-2" data-testid="date-time-empty-field">
            <DateTimePicker
              label="Pickup"
              value={pickup}
              onValueChange={setPickup}
              min="2024-06-10T08:15"
              max="2024-06-20T17:45"
              today="2024-06-10"
            />
            <Readout testId="date-time-empty-value">{pickup ?? "none"}</Readout>
          </div>
        </section>

        <section className="space-y-3">
          <Heading className="text-sm font-medium text-sherick-ink-muted">States</Heading>
          <div className="flex flex-wrap items-start gap-6">
            <div className="w-80 max-w-full" data-testid="date-time-error-field">
              <DateTimePicker label="Check-in" error="Choose a time after noon." required />
            </div>
            <div className="w-80 max-w-full" data-testid="date-time-disabled-field">
              <DateTimePicker label="Archived at" defaultValue="2023-02-28T16:20" disabled />
            </div>
            <div className="w-80 max-w-full space-y-2" data-testid="date-time-locked-field">
              <DateTimePicker
                label="Locked"
                defaultValue="2024-05-01T08:00"
                disabled
                open={lockedOpen}
                onOpenChange={setLockedOpen}
                onValueChange={() => setLockedRequests((count) => count + 1)}
              />
              <Button size="sm" appearance="tonal" variant="secondary" onClick={() => setLockedOpen(true)}>
                Open locked picker
              </Button>
              <Readout testId="date-time-locked-requests">{lockedRequests}</Readout>
            </div>
            <div className="w-80 max-w-full" data-testid="date-time-twelve-field">
              <DateTimePicker label="Reminder" defaultValue="2024-03-09T07:07" hourCycle={12} locale="en-GB" />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <Heading className="text-sm font-medium text-sherick-ink-muted">Right to left</Heading>
          <div dir="rtl" className="w-80 max-w-full" data-testid="date-time-rtl-field">
            <DirectionProvider direction="rtl">
              <DateTimePicker label="موعد" defaultValue="2024-09-11T13:00" locale="ar-EG" today="2024-09-11" />
            </DirectionProvider>
          </div>
        </section>

        <section className="space-y-3">
          <Heading className="text-sm font-medium text-sherick-ink-muted">Native form, submission and reset</Heading>
          <form
            data-testid="date-time-form"
            className="flex w-80 max-w-full flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setFormResult(`meeting=${String(data.get("meeting") ?? "")}`);
            }}
          >
            <DateTimePicker
              label="Meeting"
              name="meeting"
              defaultValue="2024-02-29T10:00"
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
              <span data-testid="date-time-form-result" className="text-xs text-sherick-ink-muted">
                {formResult}
              </span>
            </div>
          </form>
        </section>
      </>}
    </div>
  );
}
