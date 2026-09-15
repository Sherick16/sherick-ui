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
          /* A composite field: the outer surface owns the whole field language — the
             same hover and focus steps as a single input — and the disabled opacity, so
             the field dims as one thing rather than three overlapping steps. The inner
             input and action carry the disabled cursor and semantics only. */
          "relative inline-flex min-w-64 items-center",
          density.normal,
          shape.control,
          material.control,
          motion.press,
          "focus-within:outline focus-within:outline-2 focus-within:outline-sherick-focus focus-within:outline-offset-[3px]",
          !isDisabled && state.field.hover,
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
            "w-full bg-transparent py-3 pl-5 pr-12 text-inherit outline-none placeholder:text-sherick-ink-muted",
            density.normal,
            shape.control,
            isDisabled ? state.disabledDescendant : state.text,
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
            density.target,
            shape.circle,
            focusRingInset,
            motion.release,
            /* The action inherits the requested tone rather than imposing its own. */
            tone.text[variant],
            !isDisabled && stateLayer.quiet,
            !isDisabled && state.press,
            isDisabled ? state.disabledDescendant : state.enabled,
            /* `stateLayer` supplies a containing block for its overlay, so an
               absolutely positioned control declares its position after the layer and
               becomes its own containing block. */
            "absolute right-1.5 inline-flex items-center justify-center"
          )}
        >
          {loading ? (
            <Spinner className="size-5" size="small" />
          ) : (
            <SearchIcon className="size-5" />
          )}
        </button>
      </div>
    );
  }
);

Search.displayName = "Search";

export default Search;
