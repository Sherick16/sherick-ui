export * from "./components/ui.common";
export * from "./components/ui.motion";
export { cn } from "./libs/utils";

/* The workbench needs to declare a writing direction to the positioning primitive as well as to
   CSS, and a consumer application is not expected to reach into Base UI to do it. This re-export
   exists for the showcase fixtures and the browser suite; it is not part of the package's public
   surface. */
export { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";
