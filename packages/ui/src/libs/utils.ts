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

/**
 * Recipe composer: joins the parts a shared recipe is built from, and does nothing else.
 *
 * It exists because of how a published recipe survives tree-shaking. The visual and motion recipe
 * modules are shared — every component imports one of them — so an unused recipe that stays in the
 * bundle is paid for by every consumer of every other component. An unused declaration is dropped
 * only when its value is provably side-effect-free, and a template literal with a substitution is
 * not: joining two class strings may in principle call something. A *call* marked pure is dropped
 * whole, so composing a recipe through this one keeps composition free of that cost — which is what
 * lets a family added to a shared module tax only the bundles that use it. `cx` joins strings and
 * nothing else, so the mark is truthful.
 *
 * `cn` is the component-side composer: it merges conflicting utilities and adds the scope marker.
 * A recipe is composed with `cx` and consumed with `cn`.
 */
export const cx = (...parts: string[]) => parts.join(" ");
