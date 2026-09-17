"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import React, { type ButtonHTMLAttributes } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRing,
  motion,
  overlay,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue"> {
  options: SelectOption[];
  variant?: Variant;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
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
    className,
    disabled,
    readOnly,
    required,
    name,
    form,
    id,
    ...triggerProps
  }, ref) => {
    return (
      <BaseSelect.Root
        items={options}
        value={value}
        defaultValue={defaultValue ?? null}
        onValueChange={(nextValue) => {
          onValueChange?.(typeof nextValue === "string" ? nextValue : null);
        }}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
      >
        <div className={cn("relative block w-full", className)}>
          <BaseSelect.Trigger
            {...triggerProps}
            ref={ref}
            id={id}
            className={({ open }) =>
              cn(
                "group flex w-full items-center justify-between gap-3 px-5 py-3 text-left",
                density.normal,
                shape.control,
                "bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted",
                motion.release,
                focusRing,
                !disabled && state.field.hover,
                !disabled && state.field.focus,
                open && state.field.engaged,
                !disabled && state.press,
                disabled ? state.disabled : state.enabled
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
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "size-5",
                  text.high,
                  motion.release,
                  "group-data-[popup-open]:rotate-180"
                )}
              />
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
        </div>

        <BaseSelect.Portal>
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            side="bottom"
            align="start"
            sideOffset={8}
            className={cn("z-30")}
          >
            <BaseSelect.Popup
              className={({ open }) =>
                cn(
                  "w-[var(--anchor-width)] min-w-max max-h-[var(--available-height)] space-y-1 overflow-y-auto p-2",
                  overlay.menu,
                  open ? motion.overlayIn : motion.overlayOut
                )
              }
            >
              <BaseSelect.List>
                {options.map((option) => (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ selected: isSelected, disabled: itemDisabled }) =>
                      cn(
                        "flex items-center justify-between gap-4 px-4 py-3 text-left text-sm outline-none",
                        shape.control,
                        motion.press,
                        text.high,
                        isSelected
                          ? tone.selected[variant]
                          : cn(stateLayer.quiet, stateLayer.activeRow),
                        itemDisabled && state.disabled
                      )
                    }
                  >
                    <BaseSelect.ItemText className={cn("min-w-0 flex-1 truncate")}>
                      {option.label}
                    </BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator>
                      <Check aria-hidden="true" className={cn("size-4", tone.text[variant])} />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    );
  }
);

Select.displayName = "Select";

export default Select;
