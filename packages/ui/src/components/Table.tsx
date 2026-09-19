import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { edge, material, shape, state, text } from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface TableProps {
  headers: string[];
  rows: ReactNode[][];
  className?: string;
}

/* A table is a quiet, dense data region: the lightest matte fill, tighter geometry than
   a card, and hairlines between rows. Row feedback is tonality only — the rows are
   scannable, not manipulated. */
export const Table = ({
  headers,
  rows,
  className,
}: TableProps) => {
  return (
    <div className={cn("w-full overflow-auto", shape.control, material.matteQuiet, className)}>
      <table className={cn("w-full border-collapse")}>
        <thead>
          <tr className={cn(edge.header)}>
            {headers.map((header) => (
              <th
                key={header}
                className={cn("px-4 py-3 text-left text-sm font-medium", text.medium)}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={cn(edge.row, motionFeedback, state.rowHover)}>
              {row.map((cell, j) => (
                <td key={j} className={cn("px-4 py-3 text-sm", text.high)}>
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
