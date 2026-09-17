"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  list,
  material,
  motion,
  overlay,
  selectable,
  shape,
  stacking,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";

export interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/* Base's own root props are the source for every pass-through below. They are listed one by one
   rather than inherited wholesale because Base's combobox root renders no element of its own and
   ignores props it does not destructure: inheriting its type would accept `aria-label` and then
   silently drop it, leaving an unlabeled field. Naming is the `Field`'s job — or a native
   `<label htmlFor>` against this control's `id`. */
type BaseComboboxRoot = ComponentProps<typeof BaseCombobox.Root>;

export interface ComboboxProps {
  options: ComboboxOption[];
  /** The selected option's value, or `null` for no selection. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  /** Shown in place of the list when the query matches no option. */
  emptyMessage?: ReactNode;
  /** Styles the control's own box. The popup and its rows style themselves. */
  className?: string;
  /** Custom matching, when the default label search is not what the list needs. */
  filter?: ((option: ComboboxOption, query: string) => boolean) | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: BaseComboboxRoot["onOpenChange"];
  /** The query, when the application controls it. */
  inputValue?: BaseComboboxRoot["inputValue"];
  defaultInputValue?: BaseComboboxRoot["defaultInputValue"];
  onInputValueChange?: BaseComboboxRoot["onInputValueChange"];
  autoHighlight?: BaseComboboxRoot["autoHighlight"];
  /** Identifies the field when a form is submitted. */
  name?: BaseComboboxRoot["name"];
  /** The form that owns the control, when it renders outside it. */
  form?: BaseComboboxRoot["form"];
  id?: BaseComboboxRoot["id"];
  required?: BaseComboboxRoot["required"];
  readOnly?: BaseComboboxRoot["readOnly"];
  disabled?: BaseComboboxRoot["disabled"];
}

/* The composite field's own controls are not standalone `IconButton`s: the field owns their
   focus treatment, and Base disables them with the control itself. They take the target floor
   for their height and only the width their glyph needs: they sit beside a field-wide input and
   have to read as one cluster at the field's trailing edge rather than as two separate targets,
   so the floor's width step is dropped. */
const partClassName = (partsDisabled: boolean) =>
  `inline-flex shrink-0 items-center justify-center ${density.target} ${shape.circle} ${text.medium} min-w-9 [&>svg]:size-5 ${motion.press} ${stateLayer.quiet} ${partsDisabled ? state.disabledDescendant : state.enabled} hover:text-sherick-ink`;

/**
 * A text field that filters a list of options and selects one of them. It is the searchable
 * sibling of `Select`: the same option shape, the same value contract and the same box, with an
 * input instead of a trigger. Base UI owns filtering, the listbox semantics, keyboard
 * interaction, the anchored popup and the hidden form input; Sherick UI owns the field, the row
 * treatment and the tone of the selected option.
 *
 * Filtering is Base's and it is local — an application that needs remote results owns the
 * fetching, the debounce and the loading state around this control.
 */
const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled,
  readOnly,
  filter,
  ...rootProps
}, ref) => {
  /* Base disables the clear and trigger parts with the control itself, so their cursor is read
     from the same two props the field passes down rather than from a second source of truth. */
  const partsDisabled = Boolean(disabled || readOnly);
  const selectedOption = (next: string | null | undefined) =>
    next == null ? null : options.find((option) => option.value === next) ?? null;

  return (
    <BaseCombobox.Root
      {...rootProps}
      items={options}
      value={value === undefined ? undefined : selectedOption(value)}
      defaultValue={selectedOption(defaultValue)}
      // The public value is the option's own `value`, so two equal options are equal even when a
      // caller rebuilds its options array every render.
      isItemEqualToValue={(itemValue, currentValue) =>
        (itemValue as ComboboxOption | null)?.value === (currentValue as ComboboxOption | null)?.value
      }
      onValueChange={(next) => onValueChange?.((next as ComboboxOption | null)?.value ?? null)}
      filter={filter ? (item, query) => filter(item as ComboboxOption, query) : filter}
      disabled={disabled}
      readOnly={readOnly}
    >
      <BaseCombobox.InputGroup
        className={({ open, disabled: fieldDisabled }) =>
          cn(
            "flex w-full items-center pl-5 pr-2",
            density.normal,
            shape.control,
            material.control,
            motion.press,
            focusRingWithin,
            !fieldDisabled && state.field.hover,
            !fieldDisabled && state.field.focusWithin,
            open && state.field.engaged,
            state.field.invalid,
            !fieldDisabled && state.field.invalidHover,
            !fieldDisabled && state.field.invalidFocusWithin,
            fieldDisabled ? state.disabled : state.text,
            className
          )
        }
      >
        <BaseCombobox.Input
          ref={ref}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none placeholder:text-sherick-ink-muted disabled:cursor-not-allowed"
          )}
        />
        <BaseCombobox.Clear aria-label="Clear selection" className={cn(partClassName(partsDisabled))}>
          <X aria-hidden="true" />
        </BaseCombobox.Clear>
        <BaseCombobox.Trigger aria-label="Show options" className={cn(partClassName(partsDisabled))}>
          <ChevronDown aria-hidden="true" />
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>

      <BaseCombobox.Portal>
        <BaseCombobox.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          className={cn(stacking.float)}
        >
          <BaseCombobox.Popup
            className={({ open }) =>
              cn(
                list.sheet,
                "w-max min-w-[var(--anchor-width)] p-2",
                overlay.popup,
                open ? motion.overlayIn : motion.overlayOut
              )
            }
          >
            {/* Base keeps this element mounted so a screen reader hears the change, and renders
                its children only while the list is empty. The padding therefore lives on the
                message rather than on the mounted root, or an unfiltered list would open with
                an empty row's worth of space above it. */}
            <BaseCombobox.Empty>
              <div className={cn("px-4 py-3 text-sm", text.medium)}>{emptyMessage}</div>
            </BaseCombobox.Empty>
            <BaseCombobox.List className={cn("space-y-1")}>
              {(option: ComboboxOption) => (
                <BaseCombobox.Item
                  key={option.value}
                  value={option}
                  disabled={option.disabled}
                  className={({ selected: isSelected }) =>
                    cn(list.option, isSelected && tone.selected.primary)
                  }
                >
                  <span className={cn("min-w-0 flex-1 truncate")}>{option.label}</span>
                  <BaseCombobox.ItemIndicator>
                    <Check aria-hidden="true" className={cn("size-4", selectable.mark, tone.text.primary)} />
                  </BaseCombobox.ItemIndicator>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
});

Combobox.displayName = "Combobox";

export default Combobox;
