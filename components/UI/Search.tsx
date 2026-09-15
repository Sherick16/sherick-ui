"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
} from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/libs/utils";
import { motionState, pressable, shape, surface, toneTextMap } from "./ui.common";
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
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
          "relative inline-flex min-h-12 min-w-64 items-center",
          shape.control,
          surface.control,
          motionState,
          "focus-within:outline focus-within:outline-2 focus-within:outline-sherick-focus focus-within:outline-offset-[3px] focus-within:bg-sherick-surface-high/[0.9]",
          isDisabled && "cursor-not-allowed opacity-45 hover:bg-sherick-surface-high/[0.66]",
          className
        )}
      >
        <input
          ref={setRefs}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          className={cn(
            "min-h-12 w-full bg-transparent px-5 py-3 pr-12 text-[0.95rem] text-inherit placeholder:text-sherick-ink-muted outline-none",
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
            "absolute right-1.5 inline-flex min-h-9 min-w-9 items-center justify-center rounded-full",
            "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus",
            motionState,
            toneTextMap[variant],
            !isDisabled && "hover:bg-sherick-primary/10 active:bg-sherick-primary/[0.18]",
            !isDisabled && pressable,
            isDisabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          {loading ? <Spinner className="h-5 w-5" size="small" /> : <SearchIcon className="h-5 w-5" />}
        </button>
      </div>
    );
  }
);

Search.displayName = "Search";

export default Search;
