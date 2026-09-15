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
import { ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { bgMap, focusRing, rowStyleMap, styleMap } from "./ui.common";
import { Variant } from "./ui.types";

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
    variant = "secondary",
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

    const focusTrigger = () => requestAnimationFrame(() => triggerRef.current?.focus());

    const selectOption = (index: number) => {
      const option = options[index];
      if (!option) return;
      onSelect?.(option.value);
      setIsOpen(false);
      focusTrigger();
    };

    const moveActive = (nextIndex: number) => {
      const normalized = (nextIndex + options.length) % options.length;
      setActiveIndex(normalized);
      optionRefs.current[normalized]?.focus();
    };

    const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || disabled || options.length === 0) return;

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
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
        focusTrigger();
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
            "flex w-full min-w-64 items-center justify-between rounded-4xl px-6 py-4 bg-opacity-20 hover:bg-opacity-40 transition-all",
            focusRing,
            styleMap[variant] || styleMap.primary,
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <span className={cn(!selectedOption && "text-opacity-70")}>{selectedOption?.label ?? placeholder}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn("ml-3 h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")}
          />
        </button>

        {isOpen && options.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            className={cn(
              "absolute z-30 mt-2 w-full overflow-hidden rounded-3xl bg-opacity-20 p-2 shadow-xl backdrop-blur-xl",
              bgMap[variant] || bgMap.primary
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
                  tabIndex={isActive ? 0 : -1}
                  onFocus={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => selectOption(index)}
                  className={cn(
                    "cursor-pointer rounded-2xl px-6 py-3 text-left transition-colors",
                    focusRing,
                    rowStyleMap[variant] || rowStyleMap.primary,
                    isActive && cn(bgMap[variant] || bgMap.primary, "bg-opacity-20"),
                    isSelected && "font-semibold"
                  )}
                >
                  {option.label}
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
