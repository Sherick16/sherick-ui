import { notFound } from "next/navigation";
import SidebarExample from "../../../../../../examples/sidebar/SidebarExample";

const pages: Record<string, string> = {
  overview: "Overview",
  projects: "Projects",
  activity: "Activity",
  team: "Team",
  settings: "Settings",
  help: "Help",
};

export function generateStaticParams() {
  return Object.keys(pages).map((section) => ({ section }));
}

export default async function SidebarPreview({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!pages[section]) notFound();

  return (
    <SidebarExample currentPath={`/examples/sidebar/${section}`} basePath="/examples/sidebar">
      <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 600 }}>{pages[section]}</h1>
      <p style={{ color: "oklch(var(--sui-ink-muted))", lineHeight: 1.6 }}>
        Your workspace at a glance.
      </p>
    </SidebarExample>
  );
}
