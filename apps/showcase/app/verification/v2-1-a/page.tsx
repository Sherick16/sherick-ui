"use client";

import DateFamilySpecimen from "../../../components/v2-1/a";

/* Browser harness for v2.1 unit A. The specimens live in the component so they can be reused as a
   showcase section; this page is the address the browser suite visits. */
export default function VerificationDateFamilyPage() {
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
      </div>
    </main>
  );
}
