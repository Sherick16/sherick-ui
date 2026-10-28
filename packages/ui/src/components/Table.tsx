import React, { forwardRef, type ComponentPropsWithoutRef, type Key, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import ScrollRegion from "./scroll-region";
import { edge, material, shape, state, text, type } from "./ui.common";
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
}

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
}

/* A table is a quiet, dense data region: the lightest matte fill, tighter geometry than
   a card, and hairlines between rows. Row feedback is tonality only — the rows are
   scannable, not manipulated. */
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
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const columns = headers.map((header, index): { key: string; label: string; className?: string; rowHeader?: boolean } =>
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
        className={cn("w-full", shape.control, material.matteQuiet, className)}
      >
        <table className={cn("w-full border-collapse", tableClassName)}>
          {caption !== undefined && (
            <caption className={cn("px-4 py-3 text-start", type.label, text.medium)}>{caption}</caption>
          )}
          <thead>
            <tr className={cn(edge.header)}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn("px-4 py-3 text-start", type.label, text.medium, column.className)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && emptyMessage !== undefined ? (
              <tr>
                <td colSpan={columns.length} className={cn("px-4 py-6 text-start", type.body, text.medium)}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={getRowKey ? getRowKey(row, i) : i} className={cn(edge.row, motionFeedback, state.rowHover)}>
                  {row.map((cell, j) => {
                    const column = columns[j];
                    const cellClass = cn("px-4 py-3", type.numeric, text.high, column?.className);
                    return column?.rowHeader ? (
                      <th key={column.key} scope="row" className={cn(cellClass, "text-start font-medium")}>
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
