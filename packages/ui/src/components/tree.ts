import type { ReactNode } from "react";

/**
 * The finite static tree a `TreeView` presents.
 *
 * A node is data, never markup: the tree renders the roles, the nesting and the indentation
 * itself, so every node in it is reachable the same way whether it is a leaf or a branch.
 * `value` identifies a node throughout the tree and is unique; `label` is what the node is
 * called — its accessible name and what a typeahead search matches.
 */
export interface TreeViewItem {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children?: TreeViewItem[];
}

/** One node, as the tree currently shows it. */
export interface TreeRow {
  item: TreeViewItem;
  /** How deep the node sits, counted from the roots. */
  depth: number;
  /** The node that contains it, or `null` at the top level. */
  parent: string | null;
  /** Its ancestors, outermost first. */
  ancestors: string[];
  /** Whether this node's own children are shown. */
  expanded: boolean;
  /**
   * Whether a node above this one is disabled. `aria-disabled` is inherited down a subtree, and
   * this tree deliberately does not mean that: a node below an unavailable branch is its own
   * node, so the row has to be able to say it is not itself unavailable.
   */
  ancestorDisabled: boolean;
}

/** The characters a typeahead search has accumulated, and when the last one arrived. */
export interface TypeaheadBuffer {
  text: string;
  time: number;
}

/**
 * How long a typed sequence stays open for extension.
 *
 * A node label is a word rather than a document, so a search only spans a few characters: long
 * enough that typing quickly reads as one search, short enough that the next deliberate
 * character starts a new one instead of extending a stale one.
 */
export const typeaheadWindow = 500;

/** Whether a node holds children the tree can show. */
export const isBranch = (item: TreeViewItem) => (item.children?.length ?? 0) > 0;

/**
 * The nodes in the order the tree presents them: a document-order walk that descends into an
 * expanded branch and leaves a collapsed one alone.
 *
 * This is the one place that decides what "visible" means, and the keyboard, the typeahead and
 * the roving tab stop all read it rather than walking the tree again — so they can never
 * disagree about which node is where.
 */
export const flattenTree = (items: TreeViewItem[], expanded: ReadonlySet<string>): TreeRow[] => {
  const rows: TreeRow[] = [];

  const collect = (
    nodes: TreeViewItem[],
    depth: number,
    ancestors: string[],
    ancestorDisabled: boolean
  ) => {
    for (const item of nodes) {
      const expandedHere = isBranch(item) && expanded.has(item.value);
      rows.push({
        item,
        depth,
        parent: ancestors[ancestors.length - 1] ?? null,
        ancestors,
        expanded: expandedHere,
        ancestorDisabled,
      });
      if (expandedHere) {
        collect(
          item.children ?? [],
          depth + 1,
          [...ancestors, item.value],
          ancestorDisabled || item.disabled === true
        );
      }
    }
  };

  collect(items, 0, [], false);
  return rows;
};

/** The nearest of `ancestors`, deepest first, that the tree still shows. */
export const nearestVisible = (
  ancestors: string[],
  visible: ReadonlySet<string>
): string | null => {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    if (visible.has(ancestors[index])) return ancestors[index];
  }
  return null;
};

/**
 * The APG typeahead search: the next *visible* node whose label starts with the characters typed
 * so far, starting after `from` and wrapping at the end of the tree.
 *
 * A search moves focus and nothing else. Selection is the user's decision, so typing a letter can
 * never change what is chosen, and a node that a typeahead lands on is not selected by arriving.
 */
export const matchTypeahead = (
  rows: TreeRow[],
  pattern: string,
  from: string | null
): TreeRow | null => {
  const query = pattern.toLowerCase();
  if (query.length === 0 || rows.length === 0) return null;

  const start = rows.findIndex((row) => row.item.value === from);
  for (let step = 1; step <= rows.length; step += 1) {
    const row = rows[(start + step + rows.length) % rows.length];
    if (row.item.label.toLowerCase().startsWith(query)) return row;
  }
  return null;
};

/**
 * Advances the typeahead buffer by one keystroke.
 *
 * Characters typed in quick succession are one search — `d`, `o`, `c` looks for a label starting
 * with "doc" — and the *same* character typed again cycles through the nodes that start with it
 * rather than searching for a two-letter word that almost certainly does not exist. A repeat
 * neither clears nor extends the buffer, so the next different character still widens the
 * single-character search it was part of.
 */
export const typeaheadStep = (
  buffer: TypeaheadBuffer,
  key: string,
  now: number
): { buffer: TypeaheadBuffer; pattern: string } => {
  if (buffer.text.length === 0 || now - buffer.time >= typeaheadWindow) {
    return { buffer: { text: key, time: now }, pattern: key };
  }

  if (buffer.text === key) {
    return { buffer: { text: buffer.text, time: now }, pattern: key };
  }

  return { buffer: { text: buffer.text + key, time: now }, pattern: buffer.text + key };
};
