"use client";

import { useEffect } from "react";

/**
 * Marks the document once React has finished hydrating the page.
 *
 * It exists because Base UI generates every ARIA relationship in an effect, so a server-rendered
 * control is briefly a control with no name and no relationships. A scan that races that reports
 * unnamed fields rather than a defect, and the wait has to be for the wiring itself.
 *
 * React flushes a parent's effects after its children's, so this component's effect — mounted in the
 * root layout, above every page — runs once the whole tree below it has wired itself. That is a
 * stronger statement than waiting for any one attribute to appear somewhere on the page, which an
 * unrelated component can satisfy on its own. The suite waits for this attribute.
 */
const HydrationMarker = () => {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return null;
};

export default HydrationMarker;
