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
    <div className={cn("w-full overflow-auto rounded-2xl bg-sherick-surface/42", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-sherick-ink/[0.08]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-sm font-medium text-sherick-ink-muted"
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
              className="border-b border-sherick-ink/[0.045] transition-colors duration-150 last:border-b-0 hover:bg-sherick-ink/[0.04]"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-sherick-ink/90">
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
