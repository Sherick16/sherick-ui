"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import React, { forwardRef, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRingWithin,
  list,
  material,
  overlay,
  shape,
  stacking,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import {
  motionArrive,
  motionFeedback,
  motionOrient,
  motionPresenceAnchored,
  motionTactile,
} from "./ui.motion";

export interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/* Every pass-through is declared here rather than inherited wholesale. Base's combobox root
   renders no element of its own and ignores props it does not destructure: inheriting its type
   would accept `aria-label` and then silently drop it, leaving an unlabeled field. Naming is the
   `Field`'s job — or a native `<label htmlFor>` against this control's `id`. */
type ComboboxRootProps = BaseCombobox.Root.Props<ComboboxOption>;
type ComboboxChangeDetails = Parameters<NonNullable<ComboboxRootProps["onValueChange"]>>[1];

export interface ComboboxProps {
  options: ComboboxOption[];
  /** The selected option's value, or `null` for no selection. */
  value?: string | null;
  defaultValue?: string | null;
  /**
   * The selected option's own `value`, so two equal options compare equal even when a caller
   * rebuilds its options array. Base's event details are passed through unchanged.
   */
  onValueChange?: (value: string | null, eventDetails: ComboboxChangeDetails) => void;
  placeholder?: string;
  /** Shown in place of the list when the query matches no option. */
  emptyMessage?: ReactNode;
  /** Styles the control's own box. The popup and its rows style themselves. */
  className?: string;
  /** Custom matching, when the default label search is not what the list needs. */
  filter?: ((option: ComboboxOption, query: string) => boolean) | null;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: ComboboxRootProps["onOpenChange"];
  /** The query, when the application controls it. */
  inputValue?: string;
  defaultInputValue?: string;
  /** Base's own input-value callback, event details included. */
  onInputValueChange?: ComboboxRootProps["onInputValueChange"];
  /** The control's own id, for a native `<label htmlFor>`. */
  id?: ComboboxRootProps["id"];
  /** Highlights the first match as the query narrows, so `Enter` chooses it. */
  autoHighlight?: boolean;
  /** Identifies the field when a form is submitted. */
  name?: string;
  /** The form that owns the control, when it renders outside it. */
  form?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

/* The composite field's own controls are not standalone `IconButton`s: the field owns their
   focus treatment, and they are one cluster at the field's trailing edge rather than two targets
   beside it, so they take `density.part` instead of the standalone target floor.
   They style themselves from Base's own part state and nothing else. Base marks each part it
   disables (`data-disabled`, plus the native `disabled` attribute), including a part disabled by
   the `Field` around it, and it leaves the trigger operable while the control is read-only —
   a read-only combobox still opens and browses, only its value is fixed. The clear control is
   handed its own `disabled` for that case because Base itself refuses to clear a read-only
   control; nothing here has to be derived from Sherick's props. */
const partClassName = `inline-flex shrink-0 items-center justify-center ${density.part} ${shape.circle} ${text.medium} [&>svg]:size-5 ${motionFeedback} ${stateLayer.quiet} ${state.enabled} ${state.disabledPart} [&:not([data-disabled]):not(:disabled)]:hover:text-sherick-ink`;

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
      onValueChange={(next, eventDetails) =>
        onValueChange?.((next as ComboboxOption | null)?.value ?? null, eventDetails)
      }
      filter={filter ? (item, query) => filter(item as ComboboxOption, query) : filter}
      disabled={disabled}
      readOnly={readOnly}
    >
      <BaseCombobox.InputGroup
        className={({ open, disabled: fieldDisabled }) =>
          cn(
            /* The field's own inline padding is what places the trailing cluster, and it is set on the
               logical ends so the cluster stays at the field's end in either writing direction. The
               20px a mark's box then sits from the edge — 12px of padding plus the 8px each `density.part`
               holds around its 20px glyph — is the same 20px the input's own leading padding uses, so the
               field reads with one inset at both ends. */
            "group/field flex w-full items-center ps-5 pe-3",
            density.normal,
            shape.control,
            material.control,
            motionTactile,
            focusRingWithin,
            !fieldDisabled && !open && state.field.hover,
            !fieldDisabled && state.field.focusWithin,
            open && state.field.engaged,
            state.field.invalid,
            open && state.field.invalidEngaged,
            !fieldDisabled && !open && state.field.invalidHover,
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
        <BaseCombobox.Clear
          aria-label="Clear selection"
          // Clearing changes the value, so a read-only control cannot offer it — which is Base's own
          // reading of the same state, since its clear control refuses the press.
          disabled={disabled || readOnly}
          className={cn(partClassName)}
        >
          <X aria-hidden="true" />
        </BaseCombobox.Clear>
        <BaseCombobox.Trigger aria-label="Show options" className={cn(partClassName, "group")}>
          <ChevronDown aria-hidden="true" className={cn("size-5", motionOrient, "group-data-[popup-open]:rotate-180")} />
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
            className={cn(
              list.sheet,
              "w-max min-w-[var(--anchor-width)] p-2",
              overlay.popup,
              motionPresenceAnchored
            )}
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
                    <Check aria-hidden="true" className={cn("size-4", motionArrive, tone.text.primary)} />
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
