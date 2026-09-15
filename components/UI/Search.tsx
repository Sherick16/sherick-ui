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
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2 focus-within:ring-offset-zinc-950",
          isDisabled && "cursor-not-allowed opacity-45",
          className
        )}
      >
        <input
          ref={setRefs}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          className={cn(
            "min-h-12 w-full bg-transparent px-5 py-3 pr-12 text-inherit placeholder:text-zinc-400 outline-none",
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
            "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
            motionState,
            toneTextMap[variant],
            !isDisabled && "hover:bg-white/8 active:bg-white/12",
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
