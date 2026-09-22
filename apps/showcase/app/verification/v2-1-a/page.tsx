"use client";

import { useState } from "react";
import { Calendar, DatePicker, DateRangePicker, type DateRange } from "sherick-ui";
import DateFamilySpecimen from "../../../components/v2-1/a";

/* Browser harness for v2.1 unit A. The specimens live in the component so they can be reused as a
   showcase section; this page is the address the browser suite visits. */
export default function VerificationDateFamilyPage() {
  const [month, setMonth] = useState("2024-03-01");
  const [rejectMonth, setRejectMonth] = useState(true);
  const [monthRequests, setMonthRequests] = useState<string[]>([]);
  const [dateRequests, setDateRequests] = useState<(string | null)[]>([]);
  const [rangeRequests, setRangeRequests] = useState<DateRange[]>([]);
  const [cancelReset, setCancelReset] = useState(false);
  const [disabledPopup, setDisabledPopup] = useState<"single" | "range" | null>(null);
  const [disabledRequests, setDisabledRequests] = useState(0);
  return (
    <main
      data-testid="verification-v2-1-a"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <div className="mx-auto flex max-w-5xl min-w-0 flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Date family verification</h1>
          <p className="text-sherick-ink-muted">
            Calendar, DatePicker and DateRangePicker: selection, keyboard, constraints, native entry
            and the popup contract.
          </p>
        </header>

        <DateFamilySpecimen />
        <section data-testid="date-regressions" className="grid min-w-0 gap-6">
          <Calendar data-testid="month-retry" month={month} defaultValue="2024-03-31" today="2024-03-15"
            onMonthChange={(next) => {
              setMonthRequests((previous) => [...previous, next]);
              if (!rejectMonth) setMonth(next);
            }} />
          <button type="button" onClick={() => setRejectMonth(false)}>Accept month requests</button>
          <output data-testid="month-requests">{JSON.stringify(monthRequests)}</output>
          <form id="reject-date-form" data-testid="reject-date-form">
            <DatePicker label="Held date" name="held" value="2024-06-10" defaultValue="2024-01-01"
              today="2024-06-10" onValueChange={(next) => setDateRequests((previous) => [...previous, next])} />
            <DateRangePicker label="Held range" startName="start" endName="end"
              startLabel="Held start" endLabel="Held end" today="2024-06-10"
              value={{ start: "2024-06-10", end: "2024-06-20" }}
              onValueChange={(next) => setRangeRequests((previous) => [...previous, next])} />
            <button type="reset">Reset held dates</button>
          </form>
          <output data-testid="date-requests">{JSON.stringify(dateRequests)}</output>
          <output data-testid="range-requests">{JSON.stringify(rangeRequests)}</output>
          <form id="external-date-form" data-testid="external-date-form"
            onReset={(event) => { if (cancelReset) event.preventDefault(); }}>
            <button type="reset">Reset external dates</button>
          </form>
          <label><input type="checkbox" checked={cancelReset} onChange={(event) => setCancelReset(event.target.checked)} />Cancel date reset</label>
          <DatePicker label="External date" form="external-date-form" name="date"
            defaultValue="2024-06-10" today="2024-06-10" />
          <DateRangePicker label="External range" form="external-date-form" startName="start" endName="end"
            startLabel="External start" endLabel="External end" today="2024-06-10"
            defaultValue={{ start: "2024-06-10", end: "2024-06-20" }} />
          <DateRangePicker label="Draft range" startLabel="Draft start" endLabel="Draft end"
            defaultValue={{ start: "2024-06-10", end: "2024-06-20" }} today="2024-06-10" />
          <Calendar data-testid="invalid-supplied-single" value="2024-06-10" min="2024-06-11" today="2024-06-10" />
          <Calendar data-testid="invalid-supplied-range" mode="range" today="2024-06-10"
            value={{ start: "2024-06-10", end: "2024-06-20" }} isDateUnavailable={(date) => date === "2024-06-15"} />
          <Calendar data-testid="reversed-supplied-range" mode="range" today="2024-06-10"
            value={{ start: "2024-06-20", end: "2024-06-10" }} />
          <button type="button" onClick={() => setDisabledPopup("single")}>Show disabled date popup</button>
          <button type="button" onClick={() => setDisabledPopup("range")}>Show disabled range popup</button>
          <DatePicker label="Disabled open date" disabled open={disabledPopup === "single"}
            defaultValue="2024-06-10" today="2024-06-10" onValueChange={() => setDisabledRequests((count) => count + 1)} />
          <DateRangePicker label="Disabled open range" disabled open={disabledPopup === "range"}
            defaultValue={{ start: "2024-06-10", end: "2024-06-20" }} today="2024-06-10"
            onValueChange={() => setDisabledRequests((count) => count + 1)} />
          <output data-testid="disabled-date-requests">{disabledRequests}</output>
        </section>
      </div>
    </main>
  );
}
