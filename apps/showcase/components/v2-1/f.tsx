"use client";

import { FileText, Folder } from "lucide-react";
import { useState } from "react";
import { DirectionProvider, TreeView, type TreeViewItem } from "sherick-ui";

const folder = <Folder />;
const file = <FileText />;

/* A descendant the tree shows, marks unavailable, and never selects. The disabled branch below is
   already expanded on purpose: disability is node-local, so its visible child stays usable. */
const projectItems: TreeViewItem[] = [
  {
    value: "src",
    label: "src",
    icon: folder,
    children: [
      {
        value: "src/components",
        label: "components",
        icon: folder,
        children: [
          { value: "src/components/Button.tsx", label: "Button.tsx", icon: file },
          { value: "src/components/Select.tsx", label: "Select.tsx", icon: file },
        ],
      },
      {
        value: "src/utils",
        label: "utils",
        icon: folder,
        children: [{ value: "src/utils/cn.ts", label: "cn.ts", icon: file }],
      },
    ],
  },
  { value: "readme", label: "README.md", icon: file },
  {
    value: "archive",
    label: "Archive",
    icon: folder,
    disabled: true,
    children: [{ value: "archive/notes", label: "notes.md", icon: file }],
  },
  { value: "draft", label: "Draft", icon: file, disabled: true },
];

const controlledItems: TreeViewItem[] = [
  {
    value: "parent",
    label: "Parent",
    children: [
      { value: "first", label: "First child" },
      { value: "second", label: "Second child" },
    ],
  },
  { value: "sibling", label: "Sibling" },
];

const lockedItems: TreeViewItem[] = [
  {
    value: "locked",
    label: "Locked parent",
    children: [{ value: "locked-child", label: "Locked child" }],
  },
];

const deepTree = (depth: number): TreeViewItem =>
  depth === 0
    ? {
        value: "deep-0",
        label: "A label long enough that a narrow column has to yield rather than push the page",
      }
    : { value: `deep-${depth}`, label: `Level ${depth}`, children: [deepTree(depth - 1)] };

const deepItems: TreeViewItem[] = [deepTree(6)];
const deepExpanded = Array.from({ length: 7 }, (_value, index) => `deep-${index}`).filter(
  (value) => value !== "deep-0"
);

/* The same shape as the project tree, read from the other end of the line: a logical forward
   direction has to mirror with the page. */
const mirroredItems: TreeViewItem[] = [
  {
    value: "mirrored-branch",
    label: "Branch node",
    children: [{ value: "mirrored-child", label: "Child node" }],
  },
  { value: "mirrored-other", label: "Other node" },
];

/** The unit F specimens: every meaningful state of a tree, once. */
export default function V21TreeSpecimen({ verification = false }: { verification?: boolean }) {
  const [value, setValue] = useState<string | null>("first");
  const [expanded, setExpanded] = useState<string[]>(["parent"]);
  const [rejecting, setRejecting] = useState(false);
  const [expansionRequests, setExpansionRequests] = useState<string[][]>([]);
  const [removed, setRemoved] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const controlledRows = removed
    ? controlledItems.map((item) =>
        item.value === "parent"
          ? { ...item, children: (item.children ?? []).filter((child) => child.value !== "second") }
          : item
      )
    : controlledItems;

  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-3">
        <TreeView
          data-testid="tree-projects"
          label="Project files"
          items={projectItems}
          defaultValue="src/components/Button.tsx"
          defaultExpandedValues={["src", "src/components", "archive"]}
          className="max-w-sm"
        />
      </section>

      {verification && <section className="space-y-3">
        <TreeView
          data-testid="tree-controlled"
          label="Controlled tree"
          items={controlledRows}
          value={value}
          onValueChange={setValue}
          expandedValues={collapsed ? [] : expanded}
          onExpandedValuesChange={(next) => {
            setExpansionRequests((previous) => [...previous, next]);
            if (!rejecting) setExpanded(next);
          }}
        />
        <p data-testid="tree-value">{value ?? "none"}</p>
        <p data-testid="tree-expanded">{collapsed ? "" : expanded.join(",")}</p>
        <output data-testid="tree-expansion-requests">{JSON.stringify(expansionRequests)}</output>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="tree-reject"
            aria-pressed={rejecting}
            onClick={() => setRejecting((current) => !current)}
            className="rounded-full px-4 py-2 text-sm"
          >
            Refuse expansion
          </button>
          {/* Both controls keep the keyboard where it is, so what they change is the tree's own
              focus and never the button's. */}
          <button
            type="button"
            data-testid="tree-collapse"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setCollapsed(true)}
            className="rounded-full px-4 py-2 text-sm"
          >
            Collapse from outside
          </button>
          <button
            type="button"
            data-testid="tree-remove-child"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setRemoved(true)}
            className="rounded-full px-4 py-2 text-sm"
          >
            Remove child from outside
          </button>
          <button
            type="button"
            data-testid="tree-remove-child-unfocused"
            onClick={() => setRemoved(true)}
            className="rounded-full px-4 py-2 text-sm"
          >
            Remove child while focus is here
          </button>
        </div>
      </section>}

      <section className="space-y-3">
        <TreeView
          data-testid="tree-disabled"
          label="Unavailable tree"
          items={lockedItems}
          defaultExpandedValues={["locked"]}
          disabled
        />
      </section>

      <section className="space-y-3">
        <TreeView data-testid="tree-empty" label="Empty tree" items={[]} className="max-w-sm" />
      </section>

      {verification && <section className="w-56" data-testid="tree-deep-container">
        <TreeView
          data-testid="tree-deep"
          label="Deep tree"
          items={deepItems}
          defaultExpandedValues={deepExpanded}
          renderItem={(item) => (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{item.label}</span>
              <span className="text-xs text-sherick-ink-muted">{item.value}</span>
            </span>
          )}
        />
      </section>}

      <section dir="rtl" data-testid="tree-rtl-container">
        <DirectionProvider direction="rtl">
          <TreeView
            data-testid="tree-rtl"
            label="Right-to-left tree"
            items={mirroredItems}
            defaultValue="mirrored-branch"
            className="max-w-sm"
          />
        </DirectionProvider>
      </section>
    </div>
  );
}
