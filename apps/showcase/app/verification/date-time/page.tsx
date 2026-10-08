import DateTimeSpecimen from "../../../components/date-time";

/* Browser harness for DateTimePicker. The specimens live in the component so they can be reused as a
   showcase section; this page is the address the browser suite visits. */
export default function VerificationDateTimePage() {
  return (
    <main
      data-testid="verification-date-time"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <div className="mx-auto flex max-w-5xl min-w-0 flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Date and time verification</h1>
          <p className="text-sherick-ink-muted">
            DateTimePicker: native entry, the calendar and time columns, constraints and the popup contract.
          </p>
        </header>

        <DateTimeSpecimen verification />
      </div>
    </main>
  );
}
