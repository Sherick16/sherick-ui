"use client";

import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import React, {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn, type TimerHandle } from "@/libs/utils";
import {
  density,
  fieldLayout,
  fieldMessage,
  focusRingInset,
  focusRingWithin,
  iconStroke,
  material,
  rim,
  shape,
  state,
  stateLayer,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";
import { fieldDensity, type FieldSize } from "./Field";

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  onSearch: (value: string) => void;
  /** Base's value-change callback, event details included. */
  onValueChange?: BaseInput.Props["onValueChange"];
  /**
   * The tone of the submit control. It defaults to `secondary`, the neutral tonal control, so the
   * search field stays quiet beside the page and the one primary action keeps the strong fill.
   */
  variant?: Variant;
  /** Waiting for a result: the submit control shows a spinner and cannot be pressed again. */
  loading?: boolean;
  debounceMs?: number;
  /** Styles the search box itself: the tray that holds the input and its submit control. */
  className?: string;
  /** Styles the field's own column, which holds the box, the description and the error. */
  fieldClassName?: string;
  inputClassName?: string;
  /** Supporting copy beneath the field. */
  description?: ReactNode;
  /**
   * Marks the field invalid, and a message is shown beneath it. `true` marks it without a message of
   * its own, so give the field a message that says how to recover.
   */
  error?: ReactNode;
  /** The field's density: `sm` for a dense filter row, `md` (the default) or `lg`. A number is the native `size` attribute. */
  size?: FieldSize | number;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  ({
    onSearch,
    onValueChange,
    variant = "secondary",
    className,
    fieldClassName,
    inputClassName,
    loading = false,
    disabled,
    debounceMs = 300,
    placeholder = "Search…",
    name,
    description,
    error,
    size,
    onKeyDown,
    ...props
  }, forwardedRef) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const timerRef = useRef<TimerHandle | null>(null);
    const submitDisabled = disabled || loading;
    const invalidByProp = Boolean(error);
    const errorText = typeof error === "boolean" ? undefined : error;
    const fieldSize: FieldSize = typeof size === "string" ? size : "md";
    const nativeSize = typeof size === "number" ? size : undefined;

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

    const handleValueChange: NonNullable<SearchProps["onValueChange"]> = (value, eventDetails) => {
      onValueChange?.(value, eventDetails);
      scheduleSearch(value);
    };

    const submitSearch = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onSearch(inputRef.current?.value || "");
    };

    /* Enter submits from the field itself, so a reader does not have to Tab to the submit control. A
       search that is already waiting is not sent again, and an IME composition keeps its own Enter. */
    const handleKeyDown: NonNullable<SearchProps["onKeyDown"]> = (event) => {
      onKeyDown?.(event);
      if (event.key !== "Enter" || event.nativeEvent.isComposing || submitDisabled) return;
      event.preventDefault();
      submitSearch();
    };

    return (
      <Field.Root
        name={name}
        disabled={disabled}
        invalid={invalidByProp}
        role="search"
        className={cn(fieldLayout, fieldClassName)}
      >
        <BaseInput
          {...props}
          ref={setRefs}
          name={name}
          disabled={disabled}
          size={nativeSize}
          aria-busy={loading || undefined}
          placeholder={placeholder}
          onValueChange={handleValueChange}
          onKeyDown={handleKeyDown}
          className={(inputState) =>
            cn(
              // The input fills the box's height inside its rim rather than declaring a floor of its
              // own, which would push the rimmed box past its density.
              "w-full self-stretch bg-transparent ps-5 pe-12 text-inherit [outline-style:none]",
              inputState.valid === false || invalidByProp
                ? "placeholder:text-sherick-danger"
                : "placeholder:text-sherick-ink-muted",
              shape.control,
              disabled ? state.disabledDescendant : state.text,
              inputClassName
            )
          }
          render={(inputProps, inputState) => {
            /* The box is the invalid field's tray, so the same ladder Input uses applies to it: a
               failed constraint or an error the caller passed both mark it. */
            const invalid = invalidByProp || inputState.valid === false;
            return (
              <div
                data-invalid={invalid ? "" : undefined}
                className={cn(
                  "relative flex w-full items-center",
                  fieldDensity[fieldSize],
                  shape.control,
                  material.control,
                  rim.field,
                  motionFeedback,
                  focusRingWithin,
                  !disabled && state.field.hover,
                  !disabled && state.field.focusWithin,
                  !disabled && state.field.invalidHover,
                  !disabled && state.field.invalidFocusWithin,
                  state.field.invalid,
                  disabled && state.disabled,
                  className
                )}
              >
                <input {...inputProps} />
                <Button
                  type="button"
                  aria-label="Submit search"
                  disabled={submitDisabled}
                  onClick={submitSearch}
                  className={cn(
                    density.target,
                    shape.circle,
                    focusRingInset,
                    motionFeedback,
                    tone.text[variant],
                    !submitDisabled && stateLayer.fieldPart,
                    submitDisabled ? state.disabledDescendant : state.enabled,
                    /* After the state layer, which is `relative` itself: `tailwind-merge` keeps the last class in
                       a conflicting group, so the control's own position has to be written last.
                       The embedded mark is already balanced where it stands: a 20px glyph centred in the 44px
                       target lands its box 18px from the field's end edge, within the 20px the field's own
                       leading padding gives the typed text — so the mark, and the target it lives in, are left
                       exactly where they were. What the field does own is the inset itself, and it is written
                       on the logical end (`pe-12` reserves the target's room, `end-1.5` places it) so a
                       right-to-left page puts the submit control on its own leading edge. */
                    "group absolute end-1.5 inline-flex items-center justify-center"
                  )}
                >
                  {/* The target stays exactly where the pointer found it; the mark inside it carries the
                      press. */}
                  <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
                    {loading ? (
                      <Spinner className={cn("size-5")} size="small" label="Searching" />
                    ) : (
                      <HugeiconsIcon icon={Search01Icon} className={cn(iconStroke.glyph, "size-5")} aria-hidden="true" />
                    )}
                  </span>
                </Button>
              </div>
            );
          }}
        />
        {description && <Field.Description className={cn(fieldMessage.description)}>{description}</Field.Description>}
        {/* Mounted whether or not a message was passed, as in `Field`: without `match` it renders what
            Base reports, and `match` pins the caller's own message in its place. */}
        {!(invalidByProp && !errorText) && (
          <Field.Error
            match={invalidByProp ? true : undefined}
            className={cn(fieldMessage.error)}
            {...(invalidByProp ? { children: errorText } : {})}
          />
        )}
      </Field.Root>
    );
  }
);

Search.displayName = "Search";

export default Search;
