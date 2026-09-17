import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUI_SCOPE_CLASS } from "../styles/scope";

/** Timer handle: a `number` in the DOM, an object under Node typings. */
export type TimerHandle = ReturnType<typeof setTimeout>;

/**
 * Component class composer. The internal scope marker lets the published stylesheet
 * carry Tailwind-authored rules without leaking generic utility selectors into the
 * consumer application.
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(SUI_SCOPE_CLASS, inputs));
};
