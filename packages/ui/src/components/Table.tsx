import React, { forwardRef, type ComponentPropsWithoutRef, type Key, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import ScrollRegion from "./scroll-region";
import { edge, material, rowTarget, shape, state, text, type } from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface TableColumn {
  /** Stable identity for this column, shared by its header and body cells. */
  id: string;
  label: string;
  /** Classes applied to this column's header and body cells. */
  className?: string;
  /**
   * The column names each row, so its body cells are row headers (`th scope="row"`) rather than data.
   * A row header is what a screen reader announces with every cell beside it.
   */
  rowHeader?: boolean;
  /**
   * The edge this column's header and body cells align to. Figures compared down a column — counts,
   * amounts, durations — sit at the `end`, so their digits line up. Defaults to `start`.
   */
  align?: "start" | "end";
}

/**
 * `default` is the table's own quiet sheet. `flush` gives that sheet up — no fill and no corner — for a
 * table set inside a surface that already holds it, such as a `Card`, so the two never draw a frame in a
 * frame. A flush table hangs its cell inset past both of its edges (§17): its first column lines up with
 * the content above and below it, and its row lines and row fills reach into the surface's padding.
 */
export type TableAppearance = "default" | "flush";

/** `normal` rows, or `compact` rows with a smaller, quieter header for a dense overview. */
export type TableDensity = "normal" | "compact";

export interface TableProps extends Omit<ComponentPropsWithoutRef<"div">, "children" | "role"> {
  headers: Array<string | TableColumn>;
  rows: ReactNode[][];
  /**
   * The table's visible caption. A string caption also names the scrolling region, so a table with a
   * caption is never anonymous.
   */
  caption?: ReactNode;
  /** The one row shown when `rows` is empty, spanning every column. */
  emptyMessage?: ReactNode;
  /** A stable key for each row. The index is only right for rows that never reorder. */
  getRowKey?: (row: ReactNode[], index: number) => Key;
  /** Classes for the outer scrollable surface. */
  className?: string;
  /** Classes for the native table element. */
  tableClassName?: string;
  /** Whether the table draws its own sheet (`default`) or sits flush in the surface around it. */
  appearance?: TableAppearance;
  /** How tightly the rows are set. */
  density?: TableDensity;
  /**
   * Every row leads somewhere. Put the row's link (or button) in its row header cell (a column with
   * `rowHeader`): its hit area covers the whole row, so a press anywhere in the row opens it. The rows
   * take the pointer cursor, keep the hover tint while keyboard focus is inside them, and answer a press,
   * so a touch screen sees the response too. Other controls in the row keep their own press.
   */
  interactive?: boolean;
}

/* The cell inset is the table's own anatomy, one step tighter at `compact`. A flush table hangs by
   exactly its cell inset, so its text keeps the edge of the content beside it. */
const densityLayout: Record<TableDensity, { cell: string; header: string; empty: string; hang: string }> = {
  normal: { cell: "px-4 py-3", header: "px-4 py-3", empty: "px-4 py-6", hang: "-mx-4 w-[calc(100%+2rem)]" },
  compact: { cell: "px-3 py-2.5", header: "px-3 py-2.5", empty: "px-3 py-5", hang: "-mx-3 w-[calc(100%+1.5rem)]" },
};

/* A compact header is a caption rather than a label: it names the column without competing with the
   rows it heads. */
const headerType: Record<TableDensity, string> = {
  normal: type.label,
  compact: cn(type.caption, "font-medium"),
};

const alignment = { start: "text-start", end: "text-end" } as const;

/* A table is a quiet, dense data region: the lightest matte fill, tighter geometry than
   a card, and hairlines between rows. Row feedback is tonality only — the rows are
   scannable, not manipulated. A flush table gives up the fill and the corner to the surface that
   holds it; an interactive table's rows lead somewhere, and take the navigable row state. */
export const Table = forwardRef<HTMLDivElement, TableProps>(
  (
    {
      headers,
      rows,
      caption,
      emptyMessage,
      getRowKey,
      className,
      tableClassName,
      appearance = "default",
      density = "normal",
      interactive = false,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const layout = densityLayout[density];
    const columns = headers.map((header, index): { key: string; label: string; className?: string; rowHeader?: boolean; align?: TableColumn["align"] } =>
      typeof header === "string"
        ? { key: `string:${index}`, label: header }
        : { ...header, key: `column:${header.id}` }
    );
    const captionText = typeof caption === "string" ? caption : undefined;

    return (
      /* The region is named by the caller's label, then by a string caption, then by the table itself. A
         scrolling box with no name is not something a screen reader can find. */
      <ScrollRegion
        {...props}
        ref={ref}
        label={ariaLabel ?? captionText ?? "Table"}
        className={cn(...(appearance === "flush" ? [layout.hang] : ["w-full", shape.control, material.matteQuiet]), className)}
      >
        <table className={cn("w-full border-collapse", tableClassName)}>
          {caption !== undefined && (
            <caption className={cn(layout.header, "text-start", type.label, text.medium)}>{caption}</caption>
          )}
          <thead>
            <tr className={cn(edge.header)}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(layout.header, alignment[column.align ?? "start"], headerType[density], text.medium, column.className)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && emptyMessage !== undefined ? (
              <tr>
                <td colSpan={columns.length} className={cn(layout.empty, "text-start", type.body, text.medium)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={getRowKey ? getRowKey(row, i) : i} className={cn(edge.row, motionFeedback, state.rowHover, interactive && state.rowNavigable, interactive && rowTarget)}>
                  {row.map((cell, j) => {
                    const column = columns[j];
                    const cellClass = cn(layout.cell, column?.align === "end" && alignment.end, type.numeric, text.high, column?.className);
                    return column?.rowHeader ? (
                      <th key={column.key} scope="row" className={cn(cellClass, column.align !== "end" && alignment.start, "font-medium")}>
                        {cell}
                      </th>
                    ) : (
                      <td key={column?.key ?? `extra:${j}`} className={cn(cellClass)}>
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollRegion>
    );
  }
);

Table.displayName = "Table";
