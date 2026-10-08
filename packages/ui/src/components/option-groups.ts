/* Option groups — the one shape `Select` and `Combobox` accept for a list filed under headings, such
   as channels under the category they belong to.

   A list is any mix of options and groups, in the order it should read: an option outside every group
   is listed where it stands, exactly as a channel with no category is listed above the first category.
   The primitives only know a list of sections, so consecutive ungrouped options become one section
   without a heading. That normalization is the whole of this module; rendering, filtering and the
   group semantics stay with the primitive. */

export interface OptionGroup<Option> {
  /** The heading the group is filed under. The primitive names the group from it. */
  label: string;
  options: Option[];
}

/** One rendered section: a group with its heading, or a run of ungrouped options without one. */
export interface OptionSection<Option> {
  key: string;
  label?: string;
  items: Option[];
}

export const isOptionGroup = <Option>(entry: Option | OptionGroup<Option>): entry is OptionGroup<Option> =>
  typeof entry === "object" && entry !== null && Array.isArray((entry as OptionGroup<Option>).options);

export const hasOptionGroups = <Option>(entries: ReadonlyArray<Option | OptionGroup<Option>>) =>
  entries.some(isOptionGroup);

/** Every option in reading order, whichever group it is filed under. */
export const flattenOptions = <Option>(entries: ReadonlyArray<Option | OptionGroup<Option>>): Option[] =>
  entries.flatMap((entry) => (isOptionGroup(entry) ? entry.options : [entry]));

export const toOptionSections = <Option>(
  entries: ReadonlyArray<Option | OptionGroup<Option>>
): OptionSection<Option>[] => {
  const sections: OptionSection<Option>[] = [];
  for (const entry of entries) {
    if (isOptionGroup(entry)) {
      sections.push({ key: `group:${sections.length}:${entry.label}`, label: entry.label, items: entry.options });
      continue;
    }
    const previous = sections[sections.length - 1];
    if (previous && previous.label === undefined) previous.items.push(entry);
    else sections.push({ key: `ungrouped:${sections.length}`, items: [entry] });
  }
  return sections;
};
