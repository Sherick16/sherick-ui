"use client";

import { useState } from "react";
import { Stepper, type StepperItem } from "sherick-ui";

const checkoutSteps: StepperItem[] = [
  { value: "cart", label: "Cart", description: "Two items", complete: true },
  { value: "shipping", label: "Shipping", description: "Courier and delivery window" },
  { value: "payment", label: "Payment", disabled: true },
];

export default function StepperSpecimen() {
  const [checkout, setCheckout] = useState<string | null>("shipping");

  return (
    <div className="min-w-0">
      <Stepper
        aria-label="Checkout progress"
        items={checkoutSteps}
        value={checkout}
        onValueChange={setCheckout}
      />
    </div>
  );
}
