"use client";

import { useState, type AnchorHTMLAttributes } from "react";
import { Breadcrumb, Pagination, type BreadcrumbItem } from "sherick-ui";

/* Specimens for the v2.1 navigation family. The components are consumed the way every other
   showcase page consumes the package: through its public exports, which integration registers. */

const NARROW_LABEL = "A destination whose name is far longer than the column it has to fit in";

const label = "text-xs text-sherick-ink-muted";

export default function NavigationSpecimen() {
  const [reportedPage, setReportedPage] = useState<number | null>(null);
  const [linkedPage, setLinkedPage] = useState(3);
  const [longPage, setLongPage] = useState(600);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className={label}>Uncontrolled · bounded set with a gap on each side</p>
          <Pagination count={12} defaultValue={5} onValueChange={setReportedPage} />
          <span data-testid="reported-page" className={label}>
            {reportedPage ?? "no activation yet"}
          </span>
        </div>

        <div className="space-y-2">
          <p className={label}>Linked · controlled, custom page names</p>
          <Pagination
            aria-label="Linked pagination"
            count={9}
            value={linkedPage}
            onValueChange={setLinkedPage}
            getPageHref={(page: number) => `#page-${page}`}
            getPageLabel={(page: number) => `Go to page ${page}`}
          />
          <span data-testid="linked-page" className={label}>
            {linkedPage}
          </span>
        </div>

        <div className="flex flex-wrap items-start gap-10">
          <div className="space-y-2">
            <p className={label}>Empty · count 0</p>
            <Pagination aria-label="Empty pagination" count={0} />
          </div>
          <div className="space-y-2">
            <p className={label}>One page</p>
            <Pagination aria-label="Single page pagination" count={1} />
          </div>
          <div className="space-y-2">
            <p className={label}>Disabled</p>
            <Pagination aria-label="Disabled pagination" count={5} defaultValue={3} disabled />
          </div>
        </div>

        <div className="space-y-2">
          <p className={label}>Normalized · fractional count, out-of-range page, consumer-held value</p>
          <Pagination aria-label="Normalized pagination" count={4.9} value={999} />
        </div>

        <div className="space-y-2">
          <p className={label}>Invalid · no page total</p>
          <Pagination aria-label="Invalid pagination" count={Number.NaN} />
        </div>

        <div className="space-y-2">
          <p className={label}>Long · 1234 pages, two siblings, current in the middle</p>
          <Pagination
            aria-label="Long pagination"
            count={1234}
            value={longPage}
            onValueChange={setLongPage}
            siblingCount={2}
          />
        </div>

        <div className="space-y-2">
          <p className={label}>No siblings</p>
          <Pagination aria-label="No-sibling pagination" count={20} value={10} siblingCount={0} />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="space-y-2">
          <p className={label}>Trail · intermediate links, a bare label, a current item with an href</p>
          <Breadcrumb
            items={[
              { label: "Home", href: "#home" },
              { label: "Library", href: "#library" },
              { label: "Guides" },
              { label: "Pagination", href: "#pagination" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <p className={label}>Trail · custom link renderer</p>
          <Breadcrumb
            aria-label="Rendered breadcrumb"
            items={[
              { label: "Home", href: "#home" },
              { label: "Pagination" },
            ]}
            renderLink={(item: BreadcrumbItem, props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
              <a {...props} data-router="v21" />
            )}
          />
        </div>

        <div className="space-y-2">
          <p className={label}>Trail · one place</p>
          <Breadcrumb aria-label="Single-item breadcrumb" items={[{ label: "Home", href: "#home" }]} />
        </div>
      </section>

      <section className="space-y-2">
        <p className={label}>Narrow column · wrapping</p>
        <div data-testid="v21-narrow" style={{ width: 240 }} className="flex flex-col gap-5">
          <Pagination aria-label="Narrow pagination" count={12} defaultValue={5} />
          <Breadcrumb
            aria-label="Narrow breadcrumb"
            items={[
              { label: "Workspace", href: "#workspace" },
              { label: NARROW_LABEL, href: "#narrow" },
              { label: "Pagination" },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
