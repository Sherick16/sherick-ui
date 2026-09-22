"use client";

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import React, { forwardRef, useId, useMemo, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { density, focusRing, list, material, shape, state, text } from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface CommandItem {
  /** The action's own identity. Values are unique across the list. */
  value: string;
  /** What a reader scans, and what the default matching searches. */
  label: string;
  /**
   * An action that cannot be performed. It stays in the list and stays reachable by keyboard —
   * a command that cannot run is still one a reader has to be able to find and be told about —
   * but it cannot activate, and it takes no hover or press state.
   */
  disabled?: boolean;
  /** The group this command is listed under. Commands without one keep a group of their own. */
  group?: string;
  /**
   * Metadata beside the label: the gesture that runs this command elsewhere. It is a hint rather
   * than a registered shortcut, and this control owns no keyboard manager.
   */
  shortcut?: ReactNode;
  /** Metadata: the row's leading mark. */
  icon?: ReactNode;
  /** Extra terms the default matching searches beside the label. */
  keywords?: string[];
}

type AutocompleteRootProps = BaseAutocomplete.Root.Props<CommandItem>;
type CommandQueryChangeDetails = Parameters<NonNullable<AutocompleteRootProps["onValueChange"]>>[1];

export interface CommandProps {
  items: CommandItem[];
  /**
   * Names the search field for assistive technology. It is the field's own name — a palette's
   * heading names the surface — so it is not rendered as visible copy.
   */
  label: string;
  /**
   * What choosing a command does. A command performs an action rather than holding a value, so
   * this is the next domain value rather than an event, and activating one leaves the query and
   * the list exactly as they were.
   */
  onAction?: (value: string) => void;
  /** The query, when the application controls it. */
  value?: string;
  /** The query a fresh control starts with. Undefined means uncontrolled. */
  defaultValue?: string;
  /** Base's own query-change callback, event details included. */
  onValueChange?: (value: string, eventDetails: CommandQueryChangeDetails) => void;
  placeholder?: string;
  /** Shown in place of the list when the query matches no command. */
  emptyMessage?: ReactNode;
  disabled?: boolean;
  /** A string comparison locale for the default matching. */
  locale?: string;
  /**
   * Custom matching, or `null` to list every command whatever the query. The item is the caller's
   * own `CommandItem`, so the callback matches on the data rather than on anything rendered.
   */
  filter?: ((item: CommandItem, query: string) => boolean) | null;
  /** Adds to the control's own column. */
  className?: string;
  /** Adds to the search field itself. */
  inputClassName?: string;
  /** The search field's own id, for a caller's native `<label htmlFor>`. */
  id?: string;
  /**
   * The command's own content, in place of its label. It is non-interactive content: the row
   * itself is the control, and a nested action would be a second target inside one.
   */
  renderItem?: (item: CommandItem) => ReactNode;
}

/* A group is the list's own structure. Base owns the collection, the group, its heading and the
   empty region; the only thing decided here is how the caller's flat items become groups, so one
   list may hold grouped and ungrouped commands without a second rendering path. */
type CommandGroup = {
  label?: string;
  items: CommandItem[];
};

/**
 * A command list: a search field and the commands it filters, both inline on the surface they
 * belong to. Base UI owns the filtering, the highlight, the active-descendant wiring, the keyboard
 * navigation, the collection and its groups, the empty region and the scroll behaviour; Sherick UI
 * owns the field, the sheet, the row treatment and the one thing a command adds to a listbox — an
 * activation that performs an action and leaves the query alone.
 *
 * The list is deliberately never a popup. `Select` holds a value and `Combobox` chooses one, so
 * both open a list that dismisses; a command list stays where it is, which is what makes a command
 * repeatable without reopening anything.
 */
const Command = forwardRef<HTMLInputElement, CommandProps>(({
  items,
  label,
  onAction,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  emptyMessage = "No commands found.",
  disabled = false,
  locale,
  filter,
  className,
  inputClassName,
  id,
  renderItem,
}, ref) => {
  /* The field's own name is a native label association: the control generates its id when the
     caller did not supply one, and the label points at that id. */
  const generatedId = useId();
  const inputId = id ?? generatedId;

  /* Default matching is Base's collator over the label and the command's own keywords, so a
     keyword search never becomes a second matching implementation — and `locale` is the primitive's
     own comparison locale in both places rather than one chosen here. */
  const collator = BaseAutocomplete.useFilter({ locale });
  const resolvedFilter =
    filter === null
      ? null
      : filter !== undefined
        ? (item: CommandItem, query: string) => filter(item, query)
        : (item: CommandItem, query: string) =>
            collator.contains(item.label, query) ||
            (item.keywords?.some((keyword) => collator.contains(keyword, query)) ?? false);

  /* First appearance decides the group order, and the caller's own `group` string is the group's
     heading: the data declares its structure once and the list follows it. */
  const groups = useMemo(() => {
    const byGroup = new Map<string | undefined, CommandItem[]>();
    for (const item of items) {
      const existing = byGroup.get(item.group);
      if (existing) existing.push(item);
      else byGroup.set(item.group, [item]);
    }
    return [...byGroup].map<CommandGroup>(([groupLabel, groupItems]) => ({
      label: groupLabel,
      items: groupItems,
    }));
  }, [items]);

  const renderCommand = (item: CommandItem) => (
    <BaseAutocomplete.Item
      key={item.value}
      value={item}
      disabled={item.disabled}
      className={cn(list.command)}
      onClick={(event) => {
        /* Base's own item press commits a selection: it would replace the query with the command's
           label — or clear it — and close the list. A command does neither, so the primitive's own
           handler is cancelled while this one still fires exactly once, for a pointer press and for
           Enter. Navigation, highlight and the active descendant stay entirely Base's. */
        event.preventBaseUIHandler();
        if (item.disabled) return;
        onAction?.(item.value);
      }}
    >
      {item.icon !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5",
            text.medium
          )}
        >
          {item.icon}
        </span>
      )}
      <span className={cn("min-w-0 flex-1 truncate")}>{renderItem ? renderItem(item) : item.label}</span>
      {item.shortcut !== undefined && (
        <span className={cn("ms-3 shrink-0 text-xs", text.medium)}>{item.shortcut}</span>
      )}
    </BaseAutocomplete.Item>
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        /* Disabling the control is the composite's state, so the column carries only the pointer
           affordance: the field and each command dim from their own disabled state exactly once. */
        disabled && state.disabledDescendant,
        className
      )}
    >
      <label htmlFor={inputId} className={cn("sr-only")}>
        {label}
      </label>

      {/* `open inline` is Base's own command-picker contract: the list is not a popup, so every
          command is already on screen and the query only narrows it. `autoHighlight="always"` and
          `keepHighlight` keep one command ready under Enter while the pointer is elsewhere. */}
      <BaseAutocomplete.Root
        items={groups}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        filter={resolvedFilter}
        locale={locale}
        disabled={disabled}
        open
        inline
        autoHighlight="always"
        keepHighlight
      >
        {/* The field is a plain text field that filters what is already on screen: nothing opens on
            a press, so it is `Input`'s field — hover and focus tonality — rather than the tactile
            press a control that opens a list answers with. */}
        <BaseAutocomplete.Input
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          className={cn(
            "min-w-0 w-full px-5 py-3",
            density.normal,
            shape.control,
            material.control,
            motionFeedback,
            focusRing,
            !disabled && state.field.hover,
            !disabled && state.field.focus,
            disabled ? state.disabled : state.text,
            inputClassName
          )}
        />

        {/* The sheet is the component's own anatomy — a grounded panel, not a floating one — and it
            scrolls inside itself rather than growing past what the viewport leaves it. An inline
            list is anchored to nothing, so the clamp is authored here rather than read from a
            positioner's available height. */}
        <div
          className={cn(
            list.sheet,
            "space-y-1 p-1.5",
            shape.control,
            material.matte,
            "max-h-[min(24rem,60dvh)] max-w-full"
          )}
        >
          {/* The list's own child renders what Base derived, not the array handed in: a grouped list
              is filtered per group, a group whose commands all matched nothing disappears with
              them, and the rows are always the collection the primitive is navigating. */}
          <BaseAutocomplete.List className={cn("space-y-1")}>
            {(group: CommandGroup, index: number) => (
              <BaseAutocomplete.Group
                key={group.label ?? index}
                items={group.items}
                className={cn("space-y-1 [&:not(:first-child)]:pt-1")}
              >
                {group.label !== undefined && (
                  <BaseAutocomplete.GroupLabel className={cn("px-3 pt-1 pb-0.5 text-xs font-medium", text.high)}>
                    {group.label}
                  </BaseAutocomplete.GroupLabel>
                )}
                <BaseAutocomplete.Collection>{renderCommand}</BaseAutocomplete.Collection>
              </BaseAutocomplete.Group>
            )}
          </BaseAutocomplete.List>

          {/* Base keeps this element mounted so a screen reader hears the change, and renders its
              children only while the list is empty. It sits beside the listbox rather than inside
              it, so an empty list is still a list with no options in it. */}
          <BaseAutocomplete.Empty>
            <div className={cn("px-3 py-3 text-sm", text.medium)}>{emptyMessage}</div>
          </BaseAutocomplete.Empty>
        </div>
      </BaseAutocomplete.Root>
    </div>
  );
});

Command.displayName = "Command";

export default Command;
