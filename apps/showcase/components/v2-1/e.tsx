"use client";

import { useState, type ReactNode } from "react";
/* Relative source import while this unit iterates on its own module; integration switches it to the
   `sherick-ui` root import once the barrel exports `Stepper`. */
import Stepper, { type StepperItem } from "../../../../packages/ui/src/components/Stepper";

const Group = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-3">
    <div className="text-xs font-medium text-sherick-ink-muted">{label}</div>
    {children}
  </div>
);

const checkoutSteps: StepperItem[] = [
  { value: "cart", label: "Cart", description: "Two items", complete: true },
  { value: "shipping", label: "Shipping", description: "Courier and delivery window" },
  { value: "payment", label: "Payment", disabled: true },
];

const releaseSteps: StepperItem[] = [
  { value: "build", label: "Build", description: "Artifacts published", complete: true },
  { value: "verify", label: "Verify", description: "Contract and browser suites" },
  { value: "promote", label: "Promote" },
];

const intakeSteps: StepperItem[] = [
  { value: "region", label: "Choose a region", complete: true },
  {
    value: "retention",
    label: "Set the retention window",
    description:
      "Deletion applies to every archived record, including records belonging to workspaces that were removed after the fact.",
  },
  { value: "confirm", label: "Confirm" },
];

const signOffSteps: StepperItem[] = [
  { value: "draft", label: "Draft", complete: true },
  { value: "legal", label: "Legal review", complete: true },
  { value: "signoff", label: "Sign-off" },
];

const importSteps: StepperItem[] = [
  { value: "import", label: "Import" },
  { value: "map", label: "Map fields" },
  { value: "publish", label: "Publish" },
];

const migrationSteps: StepperItem[] = [
  { value: "draft", label: "Draft" },
  { value: "audit", label: "Audit", complete: true },
  { value: "translate", label: "Translate the release notes into every locale the workspace publishes in" },
  { value: "identify", label: "Confirm workspace_release_candidate_signed_artifacts_2024_09_17" },
  { value: "publish", label: "Publish" },
  { value: "verify", label: "Verify" },
];

export default function StepperSpecimen() {
  const [checkout, setCheckout] = useState<string | null>("shipping");
  const [idle, setIdle] = useState<string | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Group label="Interactive">
        <Stepper
          aria-label="Checkout progress"
          items={checkoutSteps}
          value={checkout}
          onValueChange={setCheckout}
        />
      </Group>

      <Group label="Informative">
        <Stepper aria-label="Release progress" items={releaseSteps} value="verify" />
      </Group>

      <Group label="Vertical">
        <Stepper
          aria-label="Intake progress"
          items={intakeSteps}
          value="retention"
          orientation="vertical"
        />
      </Group>

      <Group label="Disabled">
        <Stepper aria-label="Locked progress" items={signOffSteps} value="signoff" disabled onValueChange={() => undefined} />
      </Group>

      <Group label="No current step">
        <Stepper aria-label="Idle progress" items={importSteps} value={idle} onValueChange={setIdle} />
      </Group>

      <Group label="Many steps and long labels">
        <Stepper aria-label="Migration progress" items={migrationSteps} value="audit" />
      </Group>
    </div>
  );
}
