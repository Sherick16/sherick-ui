"use client";

import { useEffect, useState } from "react";
import { Button, Popover } from "sherick-ui";
import { cn, focusRing, motionFeedback, shape, text } from "sherick-ui/dev";

/*
 Shared metadata for the showcase's major sections: the identifier the section renders, the heading
 it shows, and the short label a narrow gutter can hold. Both navigations read it, and the sections
 themselves take their id and title from it; the page still decides where each section is placed.
*/
export const showcaseSections = [
  { id: "design-language", title: "Design language", nav: "Design language" },
  { id: "optical-balance", title: "Optical balance", nav: "Optical balance" },
  { id: "buttons", title: "Buttons", nav: "Buttons" },
  { id: "fields", title: "Fields", nav: "Fields" },
  { id: "selection", title: "Selection & navigation", nav: "Selection" },
  { id: "feedback", title: "Feedback", nav: "Feedback" },
  { id: "disclosure", title: "Disclosure", nav: "Disclosure" },
  { id: "surfaces", title: "Surfaces & overlays", nav: "Surfaces" },
  { id: "data", title: "Data display", nav: "Data" },
  { id: "floating", title: "Floating surfaces", nav: "Floating" },
  { id: "content", title: "Content", nav: "Content" },
] as const;

export type ShowcaseSectionId = (typeof showcaseSections)[number]["id"];

/*
 A section becomes current once its heading crosses into the upper third of the viewport, which
 is where the reader is looking, rather than when it reaches the very top of the screen. A clicked
 entry still settles at its `scroll-mt-28` offset, inside that third, so the target is the active
 one on arrival.
*/

export function useShowcaseScrollSpy(): ShowcaseSectionId {
  const [activeId, setActiveId] = useState<ShowcaseSectionId>(showcaseSections[0].id);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const offset = window.innerHeight / 3;
      let current: ShowcaseSectionId = showcaseSections[0].id;

      for (const section of showcaseSections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= offset) {
          current = section.id;
        }
      }

      /* The last section can never reach the offset on a page this long, so the bottom edge of
         the document decides instead of leaving the previous entry highlighted. */
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActiveId(atBottom ? showcaseSections[showcaseSections.length - 1].id : current);
    };

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return activeId;
}

/*
 A documentation table of contents is chromeless: no surface, no rim, no marker glyph. The current
 entry is marked by a short primary rail and a step up the emphasis ladder, and the rail's slot is
 reserved on every row so the labels never shift as the reader scrolls. A link that marks a
 *location* inside the page carries `aria-current="location"`.
*/
function ShowcaseSectionLink({
  section,
  active,
  onClick,
  className,
}: {
  section: (typeof showcaseSections)[number];
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <a
      href={`#${section.id}`}
      aria-current={active ? "location" : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm",
        motionFeedback,
        focusRing,
        active ? cn(text.high, "font-medium") : cn(text.medium, "hover:text-sherick-ink focus-visible:text-sherick-ink"),
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-4 w-0.5 shrink-0", shape.pill, active ? "bg-sherick-primary" : "bg-transparent")}
      />
      <span className="truncate">{section.nav}</span>
    </a>
  );
}

export function ShowcaseSideNav({
  activeId,
  className,
}: {
  activeId: ShowcaseSectionId;
  className?: string;
}) {
  return (
    <nav aria-label="Showcase sections" className={cn("space-y-0.5", className)}>
      {showcaseSections.map((section) => (
        <ShowcaseSectionLink
          key={section.id}
          section={section}
          active={section.id === activeId}
          className="py-1"
        />
      ))}
    </nav>
  );
}

export function ShowcaseJumpNav({ activeId }: { activeId: ShowcaseSectionId }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button appearance="tonal" variant="secondary" size="sm">
            Jump to…
          </Button>
        }
      />
      <Popover.Content side="bottom" align="start" className="w-64 p-2">
        <nav aria-label="Showcase sections" className="space-y-0.5">
          {showcaseSections.map((section) => (
            <ShowcaseSectionLink
              key={section.id}
              section={section}
              active={section.id === activeId}
              onClick={() => setOpen(false)}
              className="min-h-10 py-2"
            />
          ))}
        </nav>
      </Popover.Content>
    </Popover>
  );
}
