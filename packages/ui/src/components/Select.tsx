"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import React, { type ButtonHTMLAttributes, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/libs/utils";
import {
  elevation,
  focusRingHeld,
  iconStroke,
  list,
  material,
  overlay,
  rim,
  shape,
  stacking,
  state,
  text,
  tone,
  type,
} from "./ui.common";
import { motionArrive, motionFeedback, motionOrient, motionPresenceAnchored, motionTactileField } from "./ui.motion";
import { flattenOptions, toOptionSections, type OptionGroup } from "./option-groups";
import { Variant } from "./ui.types";
import { Spinner } from "./Spinner";
import { fieldDensity, type FieldSize } from "./Field";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Options filed under one heading, such as channels under their category. */
export type SelectOptionGroup = OptionGroup<SelectOption>;

type SelectRootProps = BaseSelect.Root.Props<string>;
type SelectChangeDetails = Parameters<NonNullable<SelectRootProps["onValueChange"]>>[1];

export interface SelectProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue"> {
  /**
   * The options, in the order they read. Any of them may be filed under a heading by passing a group
   * (`{ label, options }`) in its place; an option outside every group is listed where it stands.
   */
  options: Array<SelectOption | SelectOptionGroup>;
  variant?: Variant;
  value?: string | null;
  defaultValue?: string | null;
  /** Base's value-change event details are passed through unchanged. */
  onValueChange?: (value: string | null, eventDetails: SelectChangeDetails) => void;
  placeholder?: string;
  /**
   * Shown in the list when there are no options. With no message either, the list does not open at all,
   * so an empty select never shows an empty sheet.
   */
  emptyMessage?: ReactNode;
  /** Waiting for its options: a spinner takes the chevron's place and the trigger reports itself busy. */
  loading?: boolean;
  /** The field's density: `sm` for a dense filter row, `md` (the default) or `lg`. */
  size?: FieldSize;
  /** Styles the list's own sheet. The trigger is styled through `className`, and the rows style themselves. */
  popupClassName?: string;
  readOnly?: boolean;
  required?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    options,
    variant = "primary",
    value,
    defaultValue,
    onValueChange,
    placeholder = "Select an option",
    emptyMessage,
    loading = false,
    size = "md",
    popupClassName,
    className,
    disabled,
    readOnly,
    required,
    name,
    form,
    id,
    ...triggerProps
  }, ref) => {
    const flatOptions = flattenOptions(options);
    const isEmpty = flatOptions.length === 0;
    /* A compact trigger keeps its 40px height with a 20px line, so its vertical padding steps down with it. */
    const padding = size === "sm" ? "py-2" : "py-3";

    /* The indicator stays mounted, so a selection made while the list is open springs in. A mark that
       mounts already selected does not, so opening the list animates nothing. The spring belongs to the
       indicator, which Base marks as arriving, and not to the svg inside it. An unselected mark holds its
       slot at zero opacity, so the label does not move when the selection does. */
    const renderOption = (option: SelectOption) => (
      <BaseSelect.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className={({ selected: isSelected }) =>
          cn(list.option, isSelected && cn(tone.selected[variant], elevation.control))
        }
      >
        <BaseSelect.ItemText className={cn("min-w-0 flex-1 truncate")}>
          {option.label}
        </BaseSelect.ItemText>
        <BaseSelect.ItemIndicator
          keepMounted
          className={({ selected: isSelected }) =>
            cn("inline-flex shrink-0 items-center justify-center", motionArrive, !isSelected && "opacity-0")
          }
        >
          <HugeiconsIcon icon={Tick02Icon} aria-hidden="true" className={cn(iconStroke.glyph, "size-4", tone.text[variant])} />
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    );

    return (
      <BaseSelect.Root
        items={flatOptions}
        value={value}
        defaultValue={defaultValue ?? null}
        onValueChange={(nextValue, eventDetails) => {
          onValueChange?.(typeof nextValue === "string" ? nextValue : null, eventDetails);
        }}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
      >
        {/* The field is the control the user presses, so the *wrapper* carries the tactile answer:
            a `Select` trigger's own active state is suppressed by the primitive, while a press on
            it still activates this element as its ancestor. The trigger itself is the field's
            surface, so it takes the tone. */}
        <div className={cn("relative block min-w-0 w-full", motionTactileField)}>
          <BaseSelect.Trigger
            {...triggerProps}
            ref={ref}
            id={id}
            aria-busy={loading || undefined}
            className={({ open, disabled: fieldDisabled }) =>
              cn(
                "group flex w-full items-center justify-between gap-3 px-5 text-start",
                padding,
                fieldDensity[size],
                shape.control,
                material.control,
                rim.field,
                motionFeedback,
                focusRingHeld,
                state.busy,
                !fieldDisabled && !open && state.field.hover,
                !fieldDisabled && state.field.focus,
                open && state.field.engaged,
                state.field.invalid,
                !fieldDisabled && !open && state.field.invalidHover,
                !fieldDisabled && state.field.invalidFocusWithin,
                open && state.field.invalidEngaged,
                fieldDisabled ? state.disabled : state.enabled,
                className
              )
            }
          >
            <BaseSelect.Value
              placeholder={placeholder}
              className={({ placeholder: showingPlaceholder }) =>
                cn("truncate", showingPlaceholder && text.medium)
              }
            />
            <BaseSelect.Icon className={cn("shrink-0")}>
              {loading ? (
                <Spinner className={cn("size-5", text.high)} size="small" />
              ) : (
                <HugeiconsIcon icon={ArrowDown01Icon}
                  aria-hidden="true"
                  className={cn(iconStroke.glyph,
                    "size-5",
                    text.high,
                    motionOrient,
                    "group-data-[popup-open]:rotate-180"
                  )}
                />
              )}
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
        </div>

        {(!isEmpty || emptyMessage != null) && (
          <BaseSelect.Portal>
            <BaseSelect.Positioner
              alignItemWithTrigger={false}
              side="bottom"
              align="start"
              sideOffset={8}
              className={cn(stacking.float)}
            >
              <BaseSelect.Popup
                className={cn(
                  list.sheet,
                  "w-max min-w-[var(--anchor-width)] p-2",
                  overlay.popup,
                  motionPresenceAnchored,
                  popupClassName
                )}
              >
                {isEmpty ? (
                  <div className={cn("px-3 py-3", type.body, text.medium)}>{emptyMessage}</div>
                ) : (
                  <BaseSelect.List className={cn("space-y-1")}>
                    {/* A heading names the group it opens; an ungrouped run sits directly in the list. */}
                    {toOptionSections(options).map((section) =>
                      section.label === undefined ? (
                        <React.Fragment key={section.key}>{section.items.map(renderOption)}</React.Fragment>
                      ) : (
                        <BaseSelect.Group key={section.key} className={cn("space-y-1")}>
                          <BaseSelect.GroupLabel className={cn(list.groupLabel)}>{section.label}</BaseSelect.GroupLabel>
                          {section.items.map(renderOption)}
                        </BaseSelect.Group>
                      )
                    )}
                  </BaseSelect.List>
                )}
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        )}
      </BaseSelect.Root>
    );
  }
);

Select.displayName = "Select";

export default Select;
