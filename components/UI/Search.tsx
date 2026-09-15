"use client";

import React, {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
} from "react";
import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/libs/utils";
import { styleMap } from "./ui.common";
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
      <div className={cn("relative inline-block text-left", className)}>
        <input
          ref={setRefs}
          disabled={isDisabled}
          aria-busy={loading || undefined}
          className={cn(
            "px-6 py-4 pr-14 rounded-4xl bg-opacity-20 hover:bg-opacity-40 border transition-all border-opacity-20 focus:outline-none focus:border-opacity-50",
            styleMap[variant] || styleMap.primary,
            isDisabled && "cursor-not-allowed opacity-60",
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
            "absolute right-0 top-0 px-4 py-4 rounded-4xl bg-gray-400 bg-opacity-0 hover:bg-opacity-10 transition-all",
            isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          )}
        >
          {loading ? <Spinner className="w-6 h-6" /> : <SearchIcon className="w-6 h-6" />}
        </button>
      </div>
    );
  }
);

Search.displayName = "Search";

export default Search;
