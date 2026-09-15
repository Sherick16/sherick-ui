"use client";

import React, { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRing,
  material,
  motion,
  shape,
  state,
  stateLayer,
  text,
} from "./ui.common";
import { ModalContent } from "./ModalContent";
import { ModalFooter } from "./ModalFooter";
import { ModalHeader } from "./ModalHeader";
import { useOverlayPresence } from "./useOverlayPresence";

export interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function Modal({ children, open, onClose, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const { mounted, closing, onExitEnd } = useOverlayPresence(open);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusables();
      if (elements.length === 0) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === modalRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    /* Focus the dialog itself rather than its first control: the surface opens quiet
       (no ring drawn on an action the user has not chosen), screen readers announce the
       dialog with its title, and the trap already handles the container as the
       pre-first position for both Tab directions. */
    requestAnimationFrame(() => modalRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn("fixed inset-0 z-50", closing && "pointer-events-none")}
      role="dialog"
      aria-modal="true"
      aria-hidden={closing || undefined}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className={cn(
          /* The scrim carries the separation; the blur only defocuses the page far
             enough that it stops competing with the surface above it. */
          "absolute inset-0 bg-sherick-scrim/[0.38] backdrop-blur-[var(--sui-scrim-blur,6px)]",
          closing ? motion.scrimOut : motion.scrimIn
        )}
        onAnimationEnd={onExitEnd}
        aria-hidden="true"
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div
          className="flex min-h-full items-center justify-center p-4 sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onAnimationEnd={onExitEnd}
            className={cn(
              /* A dialog rises further than a menu, from its own scale, on the same
                 overlay timing. */
              "relative w-full max-w-lg outline-none",
              "[--sui-overlay-from-scale:0.985] [--sui-overlay-from-lift:8px]",
              shape.expressive,
              material.acrylicHero,
              elevation.floating,
              closing ? motion.overlayOut : motion.overlayIn,
              className
            )}
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={onClose}
              className={cn(
                /* A quiet ghost at rest: the dialog reads as one surface, and the
                   action only claims its own tone on hover, press or focus. */
                density.target,
                shape.circle,
                text.medium,
                "hover:text-sherick-ink",
                motion.release,
                focusRing,
                stateLayer.quiet,
                state.press,
                state.enabled,
                /* `stateLayer` supplies a containing block for its overlay, so an
                   absolutely positioned control declares its position after the layer
                   and becomes its own containing block. */
                "absolute right-4 top-4 inline-flex items-center justify-center"
              )}
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
