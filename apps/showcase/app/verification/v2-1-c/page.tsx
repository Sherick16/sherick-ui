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
      </section>
    </main>
  );
}
