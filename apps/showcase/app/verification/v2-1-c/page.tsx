"use client";

import { Breadcrumb, Pagination } from "sherick-ui";
import NavigationSpecimen from "@/components/v2-1/c";

export default function VerificationV21CPage() {
  return (
    <main
      data-testid="verification-v2-1-c"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">Navigation verification</h1>
          <p className="text-sherick-ink-muted">Pagination and Breadcrumb fixtures.</p>
        </header>
        <NavigationSpecimen />
        <section aria-label="Numeric and href boundaries" className="space-y-6">
          <Pagination aria-label="Unsafe total" count={Number.MAX_VALUE} value={Number.MAX_VALUE} />
          <Pagination aria-label="Maximum safe total" count={Number.MAX_SAFE_INTEGER} value={1000} siblingCount={Number.MAX_SAFE_INTEGER} />
          <Pagination aria-label="Empty-href pagination" count={3} value={2} getPageHref={() => ""} />
          <Breadcrumb aria-label="Empty-href breadcrumb" items={[{ label: "Reload", href: "" }, { label: "Current" }]} />
        </section>
      </section>
    </main>
  );
}
