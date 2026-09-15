import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { Variant } from "./ui.types";

export interface TableProps {
  headers: string[];
  rows: ReactNode[][];
  /** Retained for backwards compatibility. Tables intentionally use a neutral visual treatment. */
  variant?: Variant;
  className?: string;
}

export const Table = ({
  headers,
  rows,
  className,
}: TableProps) => {
  return (
    <div className={cn("w-full overflow-auto rounded-2xl bg-zinc-900/30", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/8">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/6 transition-colors duration-150 last:border-b-0 hover:bg-white/4"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-zinc-200">
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
