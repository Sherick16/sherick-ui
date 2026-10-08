"use client";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import React, { forwardRef, useState, type ClipboardEvent, type ReactNode } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  fieldMessage,
  focusRingInset,
  focusRingWithin,
  list,
  material,
  overlay,
  rim,
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
  motionInkPress,
  motionOrient,
  motionPresenceAnchored,
  motionTactileField,
} from "./ui.motion";
import { flattenOptions, hasOptionGroups, toOptionSections, type OptionGroup } from "./option-groups";

export interface ComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/** Options filed under one heading, such as channels under their category. */
export type ComboboxOptionGroup = OptionGroup<ComboboxOption>;

/* Every pass-through is declared here rather than inherited wholesale. Base's combobox root
   renders no element of its own and ignores props it does not destructure: inheriting its type
   would accept `aria-label` and then silently drop it, leaving an unlabeled field. Naming is the
   `Field`'s job — or a native `<label htmlFor>` against this control's `id`. */
type ComboboxRootProps = BaseCombobox.Root.Props<ComboboxOption>;
type ComboboxChangeDetails = Parameters<NonNullable<ComboboxRootProps["onValueChange"]>>[1];

/**
 * A change Base did not make: several entries pasted at once into a creatable combobox. It carries
 * the paste event itself, and nothing to cancel — the entries are added in one step.
 */
export interface ComboboxPasteDetails {
  reason: "input-paste";
  event: ClipboardEvent<HTMLInputElement>["nativeEvent"];
}

interface ComboboxCommonProps {
  /**
   * The options, in the order they read. Any of them may be filed under a heading by passing a group
   * (`{ label, options }`) in its place; an option outside every group is listed where it stands.
   */
  options: Array<ComboboxOption | ComboboxOptionGroup>;
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

export interface ComboboxSingleProps extends ComboboxCommonProps {
  multiple?: false;
  /** The selected option's value, or `null` for no selection. */
  value?: string | null;
  defaultValue?: string | null;
  /**
   * The selected option's own `value`, so two equal options compare equal even when a caller
   * rebuilds its options array. Base's event details are passed through unchanged.
   */
  onValueChange?: (value: string | null, eventDetails: ComboboxChangeDetails) => void;
  creatable?: never;
  createLabel?: never;
  chipsLabel?: never;
}

export interface ComboboxMultipleProps extends ComboboxCommonProps {
  /** Holds any number of options, each shown as a removable chip inside the field. */
  multiple: true;
  /** The selected options' values, in the order they were chosen. */
  value?: string[];
  defaultValue?: string[];
  /**
   * The selected options' own values. Base's event details are passed through unchanged; a
   * multi-line paste into a creatable field reports `{ reason: "input-paste" }` instead.
   */
  onValueChange?: (value: string[], eventDetails: ComboboxChangeDetails | ComboboxPasteDetails) => void;
  /**
   * Accepts entries that are not among the options: the typed text is offered as an "Add" row, and
   * pasting several lines adds one entry per line. A created entry's value is its own text.
   */
  creatable?: boolean;
  /** The "Add" row's copy for the current query. */
  createLabel?: (query: string) => ReactNode;
  /** The accessible name of the chip row. */
  chipsLabel?: string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

/** The row a creatable list offers for text that matches nothing yet. Its label is the query itself,
 *  so the primitive's own filter always keeps it. */
interface CreateItem extends ComboboxOption {
  create: true;
}

const isCreateItem = (item: ComboboxOption): item is CreateItem => (item as CreateItem).create === true;

const sameText = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

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

/* A chosen value inside the field is a passive tag, the same object `Chip` draws for one: a neutral
   tonal pill, flat, with its copy at full emphasis. It is shorter than a standalone chip because it
   rides a text field's line rather than standing in a row of its own: 28px leaves the field's 48px
   resting height intact around one line of chips. Base gives a chip real focus while the arrow keys
   walk the row, so the focused chip takes the inset ring — the one this chip is, inside the field's
   own ring, which keeps marking the field as engaged. */
const valueChipClassName = cn(
  "inline-flex h-7 min-w-0 max-w-full items-center gap-0.5 ps-3 pe-0.5 text-sm leading-5 font-medium outline-none",
  shape.pill,
  tone.tonal.secondary,
  text.high,
  focusRingInset
);

/* The dismiss target is a part of the chip the pointer is already in: 24px clears the pointer
   minimum, its circle nests in the chip's pill at the chip's own 2px end inset, and the glyph inside
   it takes the press so the target never moves. Base keeps it out of the tab order — Backspace and
   Delete remove a focused chip — and marks it disabled with the combobox. */
const chipRemoveClassName = cn(
  "group inline-flex size-6 shrink-0 items-center justify-center",
  shape.circle,
  text.medium,
  "[&:not([data-disabled]):not(:disabled)]:hover:text-sherick-ink",
  motionFeedback,
  stateLayer.quiet,
  state.enabled,
  state.disabledPart
);

/**
 * A text field that filters a list of options and selects one of them, or several. It is the
 * searchable sibling of `Select`: the same option shape, the same value contract and the same box,
 * with an input instead of a trigger. Base UI owns filtering, the listbox semantics, keyboard
 * interaction, chip navigation and removal, the anchored popup and the hidden form inputs; Sherick UI
 * owns the field, the row treatment, the chips and the tone of the selected option.
 *
 * Filtering is Base's and it is local — an application that needs remote results owns the
 * fetching, the debounce and the loading state around this control.
 */
const Combobox = forwardRef<HTMLInputElement, ComboboxProps>((props, ref) => {
  const {
    options,
    multiple,
    value,
    defaultValue,
    onValueChange,
    creatable,
    createLabel = (query: string) => `Add “${query}”`,
    chipsLabel = "Selected",
    placeholder = "Select an option",
    emptyMessage,
    className,
    disabled,
    readOnly,
    filter,
    autoHighlight,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    onOpenChange,
    ...rootProps
  } = props;

  const flatOptions = flattenOptions(options);
  const optionByValue = new Map(flatOptions.map((option) => [option.value, option]));
  /* A value that is not among the options — a created entry — is shown under its own text. */
  const toOption = (next: string): ComboboxOption => optionByValue.get(next) ?? { label: next, value: next };

  /* A multiple combobox reads its current value to append a pasted batch, and a creatable one reads
     its query to offer the "Add" row, so both are mirrored here when the application leaves them
     uncontrolled. Base still owns every change; this only remembers what it last reported. */
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(() =>
    multiple ? ((defaultValue as string[] | undefined) ?? []) : []
  );
  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultInputValue ?? "");
  const [notice, setNotice] = useState<{ visible: string; announced: string }>({ visible: "", announced: "" });

  const values = multiple ? ((value as string[] | undefined) ?? uncontrolledValues) : [];
  const query = creatable ? (inputValue ?? uncontrolledQuery) : inputValue;
  const trimmedQuery = (query ?? "").trim();

  const isChosen = (text: string) =>
    values.some((chosen) => sameText(chosen, text) || sameText(toOption(chosen).label, text));

  /* The "Add" row leads the list, so `Enter` adds exactly what was typed and the arrow keys still
     reach the suggestions beneath it. It is offered only while the text names nothing that exists. */
  const createItem: CreateItem | null =
    creatable && trimmedQuery !== "" && !isChosen(trimmedQuery) && !flatOptions.some((option) => sameText(option.label, trimmedQuery))
      ? { create: true, label: trimmedQuery, value: trimmedQuery }
      : null;

  const grouped = hasOptionGroups(options);
  const sections = toOptionSections(options);
  const items: ComboboxOption[] | Array<{ key: string; label?: string; items: ComboboxOption[] }> = grouped
    ? [...(createItem ? [{ key: "create", items: [createItem] }] : []), ...sections]
    : [...(createItem ? [createItem] : []), ...flatOptions];

  /* Reports a change and, unless the application refused it through Base's `cancel()`, applies it.
     Returns whether it was applied. */
  const commitValues = (next: string[], eventDetails: ComboboxChangeDetails | ComboboxPasteDetails) => {
    (onValueChange as ComboboxMultipleProps["onValueChange"])?.(next, eventDetails);
    if ("isCanceled" in eventDetails && eventDetails.isCanceled) return false;
    if (value === undefined) setUncontrolledValues(next);
    return true;
  };

  /* Pasting several lines adds one entry per line. An entry that names an option takes that option;
     one that is already chosen — or repeats an earlier line — is skipped and reported, so a long list
     pasted twice cannot double up. A single line is ordinary typing and is left to the input. */
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!creatable || readOnly || disabled) return;
    const pasted = event.clipboardData.getData("text");
    if (!/[\r\n]/.test(pasted)) return;
    event.preventDefault();

    const lines = pasted.split(/\r?\n|\r/).map((line) => line.trim()).filter(Boolean);
    const next = [...values];
    const added: string[] = [];
    const skipped: string[] = [];
    for (const line of lines) {
      const match = flatOptions.find((option) => sameText(option.label, line) || sameText(option.value, line));
      const entry = match ? match.value : line;
      const duplicate = next.some((chosen) => sameText(chosen, entry) || sameText(toOption(chosen).label, line));
      if (duplicate || match?.disabled) skipped.push(line);
      else {
        next.push(entry);
        added.push(line);
      }
    }
    if (added.length > 0) commitValues(next, { reason: "input-paste", event: event.nativeEvent });
    flagNotice(added.length, skipped);
  };

  const flagNotice = (addedCount: number, skipped: string[]) => {
    const visible =
      skipped.length === 0
        ? ""
        : `Skipped ${skipped.length === 1 ? "1 duplicate" : `${skipped.length} duplicates`}: ${skipped.join(", ")}.`;
    const added = addedCount === 0 ? "" : `Added ${addedCount === 1 ? "1 entry" : `${addedCount} entries`}.`;
    setNotice({ visible, announced: [added, visible].filter(Boolean).join(" ") });
  };

  const handleInputValueChange: ComboboxRootProps["onInputValueChange"] = (next, eventDetails) => {
    onInputValueChange?.(next, eventDetails);
    if (eventDetails.isCanceled) return;
    if (inputValue === undefined) setUncontrolledQuery(next);
    if (next !== "" && notice.announced !== "") setNotice({ visible: "", announced: "" });
  };

  const renderItem = (option: ComboboxOption) =>
    isCreateItem(option) ? (
      <BaseCombobox.Item key="sui-create" value={option} className={cn(list.option, "justify-start gap-3")}>
        <Plus aria-hidden="true" className={cn("size-4 shrink-0", tone.text.primary)} />
        <span className={cn("min-w-0 flex-1 truncate")}>{createLabel(option.label)}</span>
      </BaseCombobox.Item>
    ) : (
      <BaseCombobox.Item
        key={option.value}
        value={option}
        disabled={option.disabled}
        className={({ selected: isSelected }) =>
          cn(list.option, isSelected && cn(tone.selected.primary, elevation.control))
        }
      >
        <span className={cn("min-w-0 flex-1 truncate")}>{option.label}</span>
        <BaseCombobox.ItemIndicator>
          <Check aria-hidden="true" className={cn("size-4", motionArrive, tone.text.primary)} />
        </BaseCombobox.ItemIndicator>
      </BaseCombobox.Item>
    );

  const input = (chosenCount: number) => (
    <BaseCombobox.Input
      ref={ref}
      placeholder={chosenCount > 0 ? undefined : placeholder}
      onPaste={handlePaste}
      className={cn(
        "min-w-0 flex-1 bg-transparent outline-none placeholder:text-sherick-ink-muted disabled:cursor-not-allowed",
        multiple && "h-7 min-w-16"
      )}
    />
  );

  const selectedOptions = values.map(toOption);

  /* Base types its single and multiple roots as two different components; the value contract is
     chosen here, once, and the rest of the root is shared. */
  const selectionProps = (multiple
    ? {
        multiple: true,
        value: selectedOptions,
        onValueChange: (next: ComboboxOption[], eventDetails: ComboboxChangeDetails) => {
          const created = next.find(isCreateItem);
          const removed = values.filter((chosen) => !next.some((option) => option.value === chosen));
          const added = next.filter((option) => !values.includes(option.value));
          /* An option whose text names an entry already chosen — a created "book of dead" before the
             catalog's "Book of Dead" — is a duplicate under another value, so it is refused too. */
          if (
            creatable &&
            added.length === 1 &&
            !isCreateItem(added[0]) &&
            isChosen(added[0].label)
          ) {
            eventDetails.cancel();
            flagNotice(0, [added[0].label]);
            return;
          }
          /* With a query typed, `Enter` on an option that is already chosen would quietly remove
             it. Naming an entry that exists is a duplicate, not a removal, so it is refused and
             reported; the chip's own control and Backspace still remove. */
          if (
            creatable &&
            eventDetails.reason === "item-press" &&
            eventDetails.event instanceof KeyboardEvent &&
            removed.length === 1 &&
            trimmedQuery !== "" &&
            sameText(toOption(removed[0]).label, trimmedQuery)
          ) {
            eventDetails.cancel();
            flagNotice(0, [trimmedQuery]);
            return;
          }
          const applied = commitValues(
            next.map((option) => option.value),
            eventDetails
          );
          if (applied && created) {
            /* Base keeps the typed filter while the list stays open, so several matches can be
               chosen from one query. A created entry used the query up, so it starts over. */
            onInputValueChange?.("", eventDetails);
            if (inputValue === undefined) setUncontrolledQuery("");
            flagNotice(1, []);
          }
        },
      }
    : {
        value: value === undefined ? undefined : value == null ? null : (optionByValue.get(value as string) ?? null),
        defaultValue: defaultValue == null ? null : (optionByValue.get(defaultValue as string) ?? null),
        onValueChange: (next: ComboboxOption | null, eventDetails: ComboboxChangeDetails) =>
          (onValueChange as ComboboxSingleProps["onValueChange"])?.(next?.value ?? null, eventDetails),
      }) as unknown as Pick<ComboboxRootProps, "value" | "defaultValue" | "onValueChange">;

  return (
    <BaseCombobox.Root
      {...rootProps}
      items={items}
      {...selectionProps}
      // The public value is the option's own `value`, so two equal options are equal even when a
      // caller rebuilds its options array every render.
      isItemEqualToValue={(itemValue, currentValue) =>
        (itemValue as ComboboxOption | null)?.value === (currentValue as ComboboxOption | null)?.value
      }
      filter={
        filter
          ? (item, search) => isCreateItem(item as ComboboxOption) || filter(item as ComboboxOption, search)
          : filter
      }
      autoHighlight={autoHighlight ?? (creatable ? true : undefined)}
      {...(creatable ? { inputValue: query } : { inputValue, defaultInputValue })}
      onInputValueChange={handleInputValueChange}
      onOpenChange={(open, eventDetails) => {
        onOpenChange?.(open, eventDetails);
        /* Several choices are made from one open list: choosing one keeps the list where it is, so
           the next can be chosen without reopening it. Escape, Tab and a press outside still close. */
        if (multiple && !open && eventDetails.reason === "item-press") eventDetails.cancel();
      }}
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
               field reads with one inset at both ends. Once chips lead the field, its start inset
               drops to the chips' own block inset, so the first pill sits as far from the field's
               start as from its top. */
            "group/field flex min-w-0 w-full items-center ps-5 pe-3",
            multiple && "has-[[data-sui-value-chip]]:ps-2.5",
            density.normal,
            shape.control,
            material.control,
            rim.field,
            motionTactileField,
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
        {multiple ? (
          /* The chips and the input wrap together, so a long selection grows the field downward
             rather than squeezing the query. Base names the row a toolbar once it holds chips. */
          <BaseCombobox.Chips
            aria-label={selectedOptions.length > 0 ? chipsLabel : undefined}
            className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-2")}
          >
            {selectedOptions.map((option) => (
              <BaseCombobox.Chip
                key={option.value}
                data-sui-value-chip=""
                // Base marks a read-only chip `aria-readonly`, which a role-less element may not
                // carry; the input already reports that the control is read-only.
                aria-readonly={undefined}
                // Without its dismiss target the chip ends on its copy, so it takes its start inset again.
                className={cn(valueChipClassName, (readOnly || disabled) && "pe-3")}
              >
                <span className={cn("min-w-0 truncate")}>{option.label}</span>
                {!readOnly && !disabled && (
                  <BaseCombobox.ChipRemove aria-label={`Remove ${option.label}`} className={cn(chipRemoveClassName)}>
                    <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
                      <X aria-hidden="true" className={cn("size-4")} />
                    </span>
                  </BaseCombobox.ChipRemove>
                )}
              </BaseCombobox.Chip>
            ))}
            {input(selectedOptions.length)}
          </BaseCombobox.Chips>
        ) : (
          input(0)
        )}
        <BaseCombobox.Clear
          aria-label={multiple ? "Clear all" : "Clear selection"}
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

      {creatable && (
        /* Mounted from the start so a screen reader is already listening when a paste or a refused
           duplicate reports itself. Only the skipped entries are shown: the chips already show what
           was added. While the list is open Base hides everything outside it from assistive
           technology, so the same report is also made from inside the list (below). */
        <div role="status" className={cn(notice.visible !== "" && fieldMessage.description)}>
          {notice.announced === notice.visible ? (
            notice.visible
          ) : (
            // The spoken report is the fuller one; the visible line is not read a second time.
            <>
              <span aria-hidden="true">{notice.visible}</span>
              <span className={cn("sr-only")}>{notice.announced}</span>
            </>
          )}
        </div>
      )}

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
            {creatable && (
              <BaseCombobox.Status className={cn("sr-only")}>{notice.announced}</BaseCombobox.Status>
            )}
            <BaseCombobox.Empty>
              <div className={cn("px-4 py-3 text-sm", text.medium)}>
                {emptyMessage ?? (creatable ? "Type to add an entry." : "No results found.")}
              </div>
            </BaseCombobox.Empty>
            <BaseCombobox.List className={cn("space-y-1")}>
              {grouped
                ? (section: { key: string; label?: string; items: ComboboxOption[] }) => (
                    /* A heading names the group it opens. A run of options outside every group is a
                       section without one, because the primitive reads a list as all groups or none. */
                    <BaseCombobox.Group key={section.key} items={section.items} className={cn("space-y-1")}>
                      {section.label !== undefined && (
                        <BaseCombobox.GroupLabel className={cn(list.groupLabel)}>{section.label}</BaseCombobox.GroupLabel>
                      )}
                      <BaseCombobox.Collection>{renderItem}</BaseCombobox.Collection>
                    </BaseCombobox.Group>
                  )
                : renderItem}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
});

Combobox.displayName = "Combobox";

export default Combobox;
