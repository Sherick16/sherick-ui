"use client";

import { useState } from "react";
import { Stepper, type StepperItem } from "sherick-ui";

const noop = () => undefined;

const checkoutSteps: StepperItem[] = [
  { value: "cart", label: "Cart", description: "Two items", complete: true },
  { value: "shipping", label: "Shipping details", description: "Courier and delivery window" },
  { value: "payment", label: "Payment" },
  {
    value: "review",
    label: "Review and confirm",
    description: "Unavailable until payment is authorised",
    disabled: true,
  },
];

const requestSteps: StepperItem[] = [
  { value: "start", label: "Start" },
  { value: "middle", label: "Middle" },
  { value: "end", label: "End" },
];

const releaseSteps: StepperItem[] = [
  { value: "draft", label: "Draft", complete: true },
  { value: "review", label: "Review" },
  { value: "publish", label: "Publish" },
];

const verticalSteps: StepperItem[] = [
  { value: "account", label: "Account", description: "Owner and billing contact", complete: true },
  {
    value: "configure",
    label: "Configure",
    description: "Retention, regions and the archive schedule for every record the workspace keeps.",
  },
  { value: "confirm", label: "Confirm" },
];

const importSteps: StepperItem[] = [
  { value: "import", label: "Import" },
  { value: "map", label: "Map fields" },
  { value: "publish", label: "Publish" },
];

const longSteps: StepperItem[] = [
  { value: "draft", label: "Draft" },
  { value: "audit", label: "Audit", complete: true },
  { value: "translate", label: "Translate the release notes into every locale the workspace publishes in" },
  { value: "identify", label: "Confirm workspace_release_candidate_signed_artifacts_2024_09_17" },
  { value: "publish", label: "Publish" },
  { value: "verify", label: "Verify" },
  { value: "announce", label: "Announce" },
];

export default function VerificationStepperPage() {
  const [value, setValue] = useState<string | null>("shipping");
  const [requested, setRequested] = useState("none");
  const [attempts, setAttempts] = useState(0);
  const [idle, setIdle] = useState<string | null>(null);
  const [locked, setLocked] = useState("none");

  return (
    <main
      data-testid="verification-v2-1-e"
      className="min-h-screen bg-sherick-canvas px-6 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Stepper verification</h1>
          <p className="text-sherick-ink-muted">
            Fixture for step progress semantics, focus, controlled ownership and geometry.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Controlled workflow</h2>
          <Stepper
            aria-label="Checkout progress"
            items={checkoutSteps}
            value={value}
            onValueChange={setValue}
          />
          <p data-testid="stepper-e-value" className="text-sm text-sherick-ink-muted">
            {value ?? "none"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Rejected change</h2>
          <Stepper
            aria-label="Rejected progress"
            items={requestSteps}
            value="start"
            onValueChange={(next) => {
              setRequested(next);
              setAttempts((count) => count + 1);
            }}
          />
          <p data-testid="stepper-e-requested" className="text-sm text-sherick-ink-muted">
            {requested}
          </p>
          <p data-testid="stepper-e-attempts" className="text-sm text-sherick-ink-muted">
            {attempts}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Informative steps</h2>
          <Stepper items={releaseSteps} value="review" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Vertical steps</h2>
          <Stepper
            aria-label="Vertical progress"
            items={verticalSteps}
            value="configure"
            orientation="vertical"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Idle workflow</h2>
          <Stepper
            aria-label="Idle progress"
            items={importSteps}
            value={idle}
            onValueChange={setIdle}
          />
          <p data-testid="stepper-e-idle" className="text-sm text-sherick-ink-muted">
            {idle ?? "none"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Unknown current step</h2>
          <Stepper aria-label="Unknown progress" items={importSteps} value="nowhere" />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Disabled list</h2>
          <Stepper
            aria-label="Locked progress"
            items={importSteps}
            value="map"
            disabled
            onValueChange={setLocked}
          />
          <p data-testid="stepper-e-locked" className="text-sm text-sherick-ink-muted">
            {locked}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Many steps and long labels</h2>
          <div data-testid="stepper-e-narrow" className="w-[18rem] max-w-full">
            <Stepper aria-label="Long progress" items={longSteps} value="audit" onValueChange={noop} />
          </div>
        </div>
      </section>
    </main>
  );
}
