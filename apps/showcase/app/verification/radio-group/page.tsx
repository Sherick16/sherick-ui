"use client";

import { useState, type FormEvent } from "react";
import { Button, DirectionProvider, RadioGroup } from "sherick-ui";

const cadenceOptions = [
  {
    value: "daily",
    label: (
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Daily field notes</span>
        <span className="text-sm">
          A short digest of recent observations, ready before the next morning’s route.
        </span>
      </span>
    ),
  },
  {
    value: "weekly",
    label: (
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Weekly journal</span>
        <span className="text-sm">
          One issue gathers the full week’s notes and leaves enough room for long entries to wrap
          naturally inside a narrow reading column.
        </span>
      </span>
    ),
  },
  {
    value: "monthly",
    disabled: true,
    label: (
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Monthly archive</span>
        <span className="text-sm">Available after the next review.</span>
      </span>
    ),
  },
];

const controlledOptions = [
  { value: "draft", label: "Keep as a draft" },
  { value: "scheduled", label: "Publish on schedule" },
  { value: "immediate", label: "Publish immediately" },
];

export default function VerificationRadioGroupPage() {
  const [controlledValue, setControlledValue] = useState("scheduled");
  const [submittedValue, setSubmittedValue] = useState("Not submitted");

  const submitCadence = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmittedValue(String(formData.get("journal-cadence") ?? ""));
  };

  return (
    <main
      data-testid="verification-radio-group"
      className="min-h-screen bg-sherick-canvas px-6 py-10 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl min-w-0 flex-col gap-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Field journal cadence</h1>
        </header>

        <form className="flex min-w-0 flex-col items-start gap-4" onSubmit={submitCadence}>
          <div data-testid="narrow-radio-container" className="w-72 max-w-full">
            <RadioGroup
              appearance="surface"
              label="Journal delivery"
              name="journal-cadence"
              defaultValue="weekly"
              required
              options={cadenceOptions}
            />
          </div>
          <Button type="submit" appearance="filled">Save cadence</Button>
          <output data-testid="radio-form-value">{submittedValue}</output>
        </form>

        <RadioGroup
          data-testid="controlled-radio-group"
          appearance="surface"
          label="Publication timing"
          value={controlledValue}
          onValueChange={(nextValue) => setControlledValue(nextValue)}
          options={controlledOptions}
        />
        <output data-testid="controlled-radio-value">{controlledValue}</output>

        <RadioGroup
          appearance="surface"
          label="Locked archive period"
          disabled
          defaultValue="quarterly"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
          ]}
        />

        <RadioGroup
          appearance="surface"
          label="Saved print setting"
          readOnly
          defaultValue="single-sided"
          options={[
            { value: "single-sided", label: "Single-sided" },
            { value: "double-sided", label: "Double-sided" },
          ]}
        />

        <div dir="rtl" className="min-w-0">
          <DirectionProvider direction="rtl">
            <RadioGroup
              data-testid="rtl-radio-group"
              appearance="surface"
              label="RTL journal cadence"
              defaultValue="evening"
              options={[
                { value: "morning", label: "Morning summary" },
                { value: "evening", label: "Evening summary" },
              ]}
            />
          </DirectionProvider>
        </div>
      </section>
    </main>
  );
}
