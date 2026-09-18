"use client";

import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
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
  focusRingWithin,
  material,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionFeedback, motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";

export interface SearchProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch: (value: string) => void;
  onValueChange?: (value: string) => void;
  variant?: Variant;
  loading?: boolean;
  debounceMs?: number;
  inputClassName?: string;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({
    onSearch,
    onValueChange,
    variant = "secondary",
    className,
    inputClassName,
    loading = false,
    disabled,
    debounceMs = 300,
    placeholder = "Search...",
    name,
    ...props
  }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const timerRef = useRef<TimerHandle | null>(null);
    const submitDisabled = disabled || loading;

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

      if (debounceMs <= 0) {
        timerRef.current = null;
        onSearch(value);
        return;
      }

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        onSearch(value);
      }, debounceMs);
    };

    const handleValueChange = (value: string) => {
      onValueChange?.(value);
      scheduleSearch(value);
    };

    const submitSearch = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onSearch(inputRef.current?.value || "");
    };

    return (
      <Field.Root
        name={name}
        disabled={disabled}
        className={cn(
          "relative flex w-full items-center",
          density.normal,
          shape.control,
          material.control,
          motionFeedback,
          focusRingWithin,
          !disabled && state.field.hover,
          !disabled && state.field.focusWithin,
          disabled && state.disabled,
          className
        )}
      >
        <BaseInput
          {...props}
          render={<input ref={setRefs} />}
          name={name}
          disabled={disabled}
          aria-busy={loading || undefined}
          className={cn(
            "w-full bg-transparent py-3 pl-5 pr-12 text-inherit outline-none placeholder:text-sherick-ink-muted",
            density.normal,
            shape.control,
            disabled ? state.disabledDescendant : state.text,
            inputClassName
          )}
          placeholder={placeholder}
          onValueChange={handleValueChange}
        />
        <Button
          type="button"
          aria-label="Submit search"
          disabled={submitDisabled}
          onClick={submitSearch}
          className={cn(
            density.target,
            shape.circle,
            focusRingInset,
            motionTactile,
            tone.text[variant],
            !submitDisabled && stateLayer.quiet,
            !submitDisabled && state.pressCompact,
            submitDisabled ? state.disabledDescendant : state.enabled,
            "absolute right-1.5 inline-flex items-center justify-center"
          )}
        >
          {loading ? (
            <Spinner className={cn("size-5")} size="small" />
          ) : (
            <SearchIcon className={cn("size-5")} aria-hidden="true" />
          )}
        </Button>
      </Field.Root>
    );
  }
);

Search.displayName = "Search";

export default Search;
