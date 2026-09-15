"use client";

import React, {
  forwardRef,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRing,
  material,
  motion,
  overlay,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";
import { useOverlayPresence } from "./useOverlayPresence";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect" | "value"> {
  options: DropdownOption[];
  variant?: Variant;
  onSelect?: (value: string) => void;
  selected?: string;
  placeholder?: string;
}

const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
  ({
    options,
    variant = "primary",
    onSelect,
    selected,
    placeholder = "Select an option",
    className,
    disabled,
    id,
    onClick,
    onKeyDown,
    ...props
  }, forwardedRef) => {
    const generatedId = useId();
    const triggerId = id ?? `${generatedId}-trigger`;
    const listboxId = `${generatedId}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { mounted, closing, onExitEnd } = useOverlayPresence(isOpen);
    const selectedIndex = options.findIndex((option) => option.value === selected);
    const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);
    const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const setTriggerRefs = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    useEffect(() => {
      if (!isOpen) return;

      const handlePointerDown = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
      };

      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const nextIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setActiveIndex(nextIndex);
      requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus());
    }, [isOpen, selectedIndex]);

    const selectOption = (index: number) => {
      const option = options[index];
      if (!option) return;
      onSelect?.(option.value);
      setIsOpen(false);
      requestAnimationFrame(() => triggerRef.current?.focus());
    };

    const moveActive = (nextIndex: number) => {
      if (options.length === 0) return;
      const normalized = (nextIndex + options.length) % options.length;
      setActiveIndex(normalized);
      optionRefs.current[normalized]?.focus();
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || options.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setIsOpen(true);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : options.length - 1);
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOptionKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveActive(index + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        moveActive(index - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        moveActive(0);
      } else if (event.key === "End") {
        event.preventDefault();
        moveActive(options.length - 1);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectOption(index);
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      } else if (event.key === "Tab") {
        setIsOpen(false);
      }
    };

    return (
      <div ref={rootRef} className={cn("relative inline-block min-w-64", className)}>
        <button
          {...props}
          ref={setTriggerRefs}
          id={triggerId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) setIsOpen((open) => !open);
          }}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            density.normal,
            "flex w-full min-w-64 items-center justify-between gap-3 px-5 py-3 text-left",
            shape.control,
            material.control,
            motion.release,
            focusRing,
            !disabled && state.field.hover,
            !disabled && state.field.focus,
            /* The trigger holds the engaged step for as long as the popup is open,
               even though focus has moved into the listbox. */
            isOpen && state.field.engaged,
            !disabled && state.press,
            disabled ? state.disabled : state.enabled
          )}
        >
          <span className={cn("truncate", !selectedOption && text.medium)}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn("size-5 shrink-0", text.high, motion.release, isOpen && "rotate-180")}
          />
        </button>

        {mounted && options.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            aria-hidden={closing || undefined}
            onAnimationEnd={onExitEnd}
            /* A closing overlay keeps its node for the exit step, so it must stop
               responding to pointers and to the keyboard while it leaves. */
            inert={closing || undefined}
            className={cn(
              /* A hairline gap keeps the rounded option fills from touching, so hover and
                 selection read as separate rows instead of one merged highlight. */
              "absolute z-30 mt-2 w-full min-w-max space-y-1 p-2",
              overlay.menu,
              closing ? cn(motion.overlayOut, "pointer-events-none") : motion.overlayIn
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === selected;
              const isActive = index === activeIndex;

              return (
                <div
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  data-active={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => selectOption(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left text-sm outline-none",
                    shape.control,
                    motion.press,
                    text.high,
                    isSelected
                      ? tone.selected[variant]
                      : cn(stateLayer.quiet, stateLayer.activeRow)
                  )}
                >
                  <span className={cn(isSelected && "font-medium")}>{option.label}</span>
                  {isSelected && (
                    <Check aria-hidden="true" className={cn("size-4", tone.text[variant])} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
