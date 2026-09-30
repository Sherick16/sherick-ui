import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { edge, focusRing, material, shape, state, text } from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface TableProps {
  headers: Array<string | TableColumn>;
  rows: ReactNode[][];
  /** Classes for the outer scrollable surface. */
  className?: string;
  /** Classes for the native table element. */
  tableClassName?: string;
}

export interface TableColumn {
  /** Stable identity for this column, shared by its header and body cells. */
  id: string;
  label: string;
  /** Classes applied to this column's header and body cells. */
  className?: string;
}

/* A table is a quiet, dense data region: the lightest matte fill, tighter geometry than
   a card, and hairlines between rows. Row feedback is tonality only — the rows are
   scannable, not manipulated. */
export const Table = ({
  headers,
  rows,
  className,
  tableClassName,
}: TableProps) => {
  const columns = headers.map((header, index): { key: string; label: string; className?: string } =>
    typeof header === "string"
      ? { key: `string:${index}`, label: header }
      : { ...header, key: `column:${header.id}` }
  );

  return (
    // Passive cells still need a keyboard-reachable surface when the table overflows.
    <div tabIndex={0} className={cn("w-full overflow-auto", shape.control, material.matteQuiet, focusRing, className)}>
      <table className={cn("w-full border-collapse", tableClassName)}>
        <thead>
          <tr className={cn(edge.header)}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn("px-4 py-3 text-start text-sm font-medium", text.medium, column.className)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={cn(edge.row, motionFeedback, state.rowHover)}>
              {row.map((cell, j) => (
                <td key={columns[j]?.key ?? `extra:${j}`} className={cn("px-4 py-3 text-sm", text.high, columns[j]?.className)}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
