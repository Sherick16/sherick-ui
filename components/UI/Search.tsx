"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
} from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn, type TimerHandle } from "@/libs/utils";
import {
  density,
  focusRingInset,
  material,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export interface SearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch: (value: string) => void;
  variant?: Variant;
  loading?: boolean;
  debounceMs?: number;
  inputClassName?: string;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({
    onSearch,
    variant = "secondary",
    className,
    inputClassName,
    loading = false,
    disabled,
    debounceMs = 300,
    placeholder = "Search...",
    ...props
  }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const timerRef = useRef<TimerHandle | null>(null);
    const isDisabled = disabled || loading;

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const scheduleSearch = (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onSearch(value), debounceMs);
    };

    return (
      <div
        className={cn(
          /* A composite field: the outer surface owns the whole field language, the
             input inside stays borderless and the focus step arrives through
             `focus-within`. */
          "relative inline-flex min-h-12 min-w-64 items-center",
          shape.control,
          material.control,
          motion.press,
          "focus-within:outline focus-within:outline-2 focus-within:outline-sherick-focus focus-within:outline-offset-[3px]",
          !isDisabled && state.field.focusWithin,
          isDisabled && state.disabled,
          className
        )}
      >
        <input
          ref={setRefs}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          className={cn(
            "min-h-12 w-full min-w-0 bg-transparent py-3 pl-5 pr-12 text-inherit outline-none placeholder:text-sherick-ink-muted",
            shape.control,
            inputClassName
          )}
          placeholder={placeholder}
          onChange={(event) => scheduleSearch(event.target.value)}
          {...props}
        />
        <button
          type="button"
          aria-label="Submit search"
          disabled={isDisabled}
          onClick={() => onSearch(inputRef.current?.value || "")}
          className={cn(
            "absolute right-1.5 inline-flex items-center justify-center",
            density.target,
            shape.circle,
            focusRingInset,
            motion.release,
            tone.text[variant],
            !isDisabled && stateLayer.quiet,
            !isDisabled && state.press,
            isDisabled ? state.disabled : state.enabled
          )}
        >
          {loading ? (
            <Spinner className="size-5" size="small" />
          ) : (
            <SearchIcon className={cn("size-5", text.medium)} />
          )}
        </button>
      </div>
    );
  }
);

Search.displayName = "Search";

export default Search;
