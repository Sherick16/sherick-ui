"use client";

import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";
import React, { type ReactNode } from "react";

export interface DirectionProviderProps {
  /** Match the document's `dir` attribute. This provider adds no DOM element. */
  direction: "ltr" | "rtl";
  children: ReactNode;
}

/** Declares writing direction to the interaction and positioning primitives, including portals. */
export const DirectionProvider = ({ direction, children }: DirectionProviderProps) => (
  <BaseDirectionProvider direction={direction}>{children}</BaseDirectionProvider>
);
