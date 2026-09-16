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
    name,
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
        disabled={isDisabled}
        className={cn(
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
        <BaseInput
          {...props}
          render={<input ref={setRefs} />}
          name={name}
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
          onValueChange={scheduleSearch}
        />
        <Button
          type="button"
          aria-label="Submit search"
          disabled={isDisabled}
          onClick={submitSearch}
          className={cn(
            density.target,
            shape.circle,
            focusRingInset,
            motion.release,
            tone.text[variant],
            !isDisabled && stateLayer.quiet,
            !isDisabled && state.press,
            isDisabled ? state.disabledDescendant : state.enabled,
            "absolute right-1.5 inline-flex items-center justify-center"
          )}
        >
          {loading ? (
            <Spinner className="size-5" size="small" />
          ) : (
            <SearchIcon className="size-5" aria-hidden="true" />
          )}
        </Button>
      </Field.Root>
    );
  }
);

Search.displayName = "Search";

export default Search;
