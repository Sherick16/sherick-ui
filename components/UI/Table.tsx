import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { edge, material, motion, shape, state, text } from "./ui.common";
import { Variant } from "./ui.types";

export interface TableProps {
  headers: string[];
  rows: ReactNode[][];
  /** Retained for backwards compatibility. Tables intentionally use a neutral visual treatment. */
  variant?: Variant;
  className?: string;
}

/* A table is a large matte surface. Its lines are the shared hairline tone, and row
   feedback is tonality only: the rows are scannable, not interactive. */
export const Table = ({
  headers,
  rows,
  className,
}: TableProps) => {
  return (
    <div className={cn("w-full overflow-auto", shape.surface, material.matte, className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className={edge.header}>
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
            <tr key={i} className={cn(edge.row, motion.press, state.rowHover)}>
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
