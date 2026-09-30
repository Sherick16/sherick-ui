"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Button, Checkbox, Field, Input, Pagination, Popover, Select, Skeleton, Table, type TableColumn } from "sherick-ui";
import "./resources.css";

type Project = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Archived";
  created: string;
};

const sampleProjects: Project[] = [
  { id: "customer-portal", name: "Customer portal", owner: "You", status: "Active", created: "2026-09-22" },
  { id: "billing-refresh", name: "Billing refresh", owner: "Jordan Lee", status: "Active", created: "2026-09-21" },
  { id: "help-center", name: "Help center", owner: "Mina Patel", status: "Active", created: "2026-09-19" },
  { id: "release-notes", name: "Release notes", owner: "You", status: "Active", created: "2026-09-18" },
  { id: "partner-access", name: "Partner access", owner: "Sam Ortiz", status: "Archived", created: "2026-09-16" },
  { id: "analytics-rollout", name: "Analytics rollout", owner: "Jordan Lee", status: "Active", created: "2026-09-15" },
  { id: "service-dashboard", name: "Service dashboard", owner: "Mina Patel", status: "Archived", created: "2026-09-10" },
  { id: "account-settings", name: "Account settings", owner: "You", status: "Active", created: "2026-09-08" },
  { id: "documentation-hub", name: "Documentation hub", owner: "Mina Patel", status: "Active", created: "2026-09-06" },
  { id: "support-workflows", name: "Support workflows", owner: "Sam Ortiz", status: "Active", created: "2026-09-04" },
  { id: "migration-planning", name: "Migration planning", owner: "You", status: "Archived", created: "2026-09-03" },
  { id: "team-directory", name: "Team directory", owner: "Jordan Lee", status: "Active", created: "2026-08-29" },
  { id: "status-page", name: "Status page", owner: "You", status: "Archived", created: "2026-08-26" },
];

const PAGE_SIZE = 5;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });
const columns: TableColumn[] = [
  { id: "project", label: "Project", className: "resources-column-project" },
  { id: "owner", label: "Owner", className: "resources-column-owner" },
  { id: "status", label: "Status", className: "resources-column-status" },
  { id: "created", label: "Created", className: "resources-column-created" },
  { id: "action", label: "Action", className: "resources-column-action" },
];
const statuses = ["Active", "Archived"] as const;
const ownerOptions = [
  { label: "Anyone", value: "all" },
  { label: "Assigned to me", value: "mine" },
];
const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Name A–Z", value: "name" },
];

export default function ResourceListExample({ initialProjects = sampleProjects, failAttempt = 0 }: {
  initialProjects?: Project[];
  // Preview-only failure injection: 1 fails first load, 2 fails the first refresh. Retry succeeds.
  failAttempt?: number;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [owner, setOwner] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [read, setRead] = useState({ attempt: 1, status: "loading", hasLoaded: false });

  useEffect(() => {
    // Deterministic stand-in for the application's read. Cancellation prevents a stale completion.
    const timer = setTimeout(() => setRead((current) => ({
      ...current,
      status: current.attempt === failAttempt ? "error" : "ready",
      hasLoaded: current.hasLoaded || current.attempt !== failAttempt,
    })), 500);
    return () => clearTimeout(timer);
  }, [read.attempt, failAttempt]);

  function refresh() {
    setRead((current) => ({ ...current, attempt: current.attempt + 1, status: "loading" }));
  }

  const activeFilters = Boolean(query.trim() || selectedStatuses.length > 0 || owner !== "all");
  const term = query.trim().toLowerCase();
  const matches = projects
    .filter((project) =>
      (selectedStatuses.length === 0 || selectedStatuses.includes(project.status)) &&
      (owner === "all" || project.owner === "You") &&
      (!term || `${project.name} ${project.owner}`.toLowerCase().includes(term))
    )
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : b.created.localeCompare(a.created));
  const pageCount = Math.ceil(matches.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(1, pageCount));
  const first = (currentPage - 1) * PAGE_SIZE;
  const visible = matches.slice(first, first + PAGE_SIZE);

  function clearFilters() {
    setQuery("");
    setSelectedStatuses([]);
    setOwner("all");
    setPage(1);
  }

  function createProject() {
    // Replace this local insertion with navigation to your create flow or a successful API response.
    setProjects((current) => [
      { id: crypto.randomUUID(), name: "Untitled project", owner: "You", status: "Active", created: new Date().toISOString().slice(0, 10) },
      ...current,
    ]);
    clearFilters();
    setSort("newest");
  }

  function toggleArchive(id: string) {
    // Persist the change before updating local data when using a real backend.
    setProjects((current) => current.map((project) => project.id === id
      ? { ...project, status: project.status === "Active" ? "Archived" : "Active" }
      : project
    ));
  }

  return (
    <main className="resources-page">
      <header className="resources-heading">
        <div>
          <h1>Projects</h1>
          <p>Review status and ownership across your team’s projects.</p>
        </div>
        {read.hasLoaded && <div className="resources-actions">
          <Button appearance="text" variant="secondary" disabled={read.status === "loading"} onClick={refresh}>Refresh projects</Button>
          {projects.length > 0 && <Button appearance="filled" onClick={createProject}>New project</Button>}
        </div>}
      </header>

      {read.status === "error" && <Alert variant="danger">
        <p>Could not read projects.{read.hasLoaded ? " Showing the last successful results." : ""}</p>
        <Button appearance="text" onClick={refresh}>Retry reading projects</Button>
      </Alert>}
      {!read.hasLoaded ? (
        read.status === "loading" && <section className="resources-results" aria-label="Project results" aria-busy="true">
          <p role="status">Loading projects</p>
          <Table headers={columns} tableClassName="resources-table" rows={Array.from({ length: PAGE_SIZE }, () =>
            columns.map((column) => <Skeleton key={column.id} className="resources-cell-placeholder" />)
          )} />
        </section>
      ) : projects.length === 0 ? (
        <section className="resources-empty" aria-labelledby="resources-empty-title">
          <h2 id="resources-empty-title">No projects yet</h2>
          <p>Create a project to start organizing your work.</p>
          <Button appearance="filled" onClick={createProject}>Create a project</Button>
        </section>
      ) : (
        <>
          <div className="resources-filters" role="search" aria-label="Filter projects">
            <Input
              type="search"
              label="Search projects or owners"
              placeholder="Search projects or owners"
              value={query}
              onValueChange={(value) => { setQuery(value); setPage(1); }}
            />
            <Popover>
              <Popover.Trigger render={<Button appearance="tonal" variant="secondary">Statuses</Button>} />
              <Popover.Content>
                <fieldset className="resources-status-options">
                  <legend>Include statuses</legend>
                  {statuses.map((status) => <label key={status} className="resources-status-option">
                    <Checkbox checked={selectedStatuses.includes(status)} onCheckedChange={(checked) => {
                      setSelectedStatuses((current) => checked ? [...current, status] : current.filter((item) => item !== status));
                      setPage(1);
                    }} />
                    <span>{status}</span>
                  </label>)}
                </fieldset>
              </Popover.Content>
            </Popover>
            <Field label="Owner">
              <Select options={ownerOptions} value={owner} onValueChange={(value) => {
                setOwner(value ?? "all");
                setPage(1);
              }} />
            </Field>
          </div>

          {activeFilters && <p className="resources-filter-summary">
            Filters: {[
              query.trim() ? `Search: ${query.trim()}` : "",
              selectedStatuses.length ? `Status: ${selectedStatuses.join(", ")}` : "",
              owner === "mine" ? "Assigned to me" : "",
            ].filter(Boolean).join(" · ")}
          </p>}
          <section className="resources-results" aria-label="Project results" aria-busy={read.status === "loading"}>
            {read.status === "loading" && <p role="status">Refreshing projects; previous results remain visible.</p>}
            <div className="resources-results-bar">
              <p role="status">
                {matches.length}{activeFilters ? ` of ${projects.length}` : ""} {projects.length === 1 ? "project" : "projects"}
              </p>
              {activeFilters && matches.length > 0 && (
                <Button appearance="text" variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button>
              )}
              <Field label="Sort by" className="resources-sort">
                <Select options={sortOptions} value={sort} onValueChange={(value) => {
                  setSort(value ?? "newest");
                  setPage(1);
                }} />
              </Field>
            </div>

            {matches.length === 0 ? (
              <div className="resources-empty">
                <h2>No matching projects</h2>
                <p>Try a different search or clear your filters to see all projects.</p>
                <Button appearance="tonal" variant="secondary" onClick={clearFilters}>Clear search and filters</Button>
              </div>
            ) : (
              <>
                <Table
                  headers={columns}
                  tableClassName="resources-table"
                  rows={visible.map((project) => [
                    <span className="resources-name">{project.name}</span>,
                    <span className="resources-nowrap">{project.owner}</span>,
                    <Badge variant={project.status === "Active" ? "success" : "secondary"}>{project.status}</Badge>,
                    <time className="resources-nowrap" dateTime={project.created}>
                      {dateFormat.format(new Date(`${project.created}T00:00:00Z`))}
                    </time>,
                    <Button
                      appearance="text"
                      variant="secondary"
                      size="sm"
                      className="resources-nowrap"
                      aria-label={`${project.status === "Active" ? "Archive" : "Restore"} ${project.name}`}
                      onClick={() => toggleArchive(project.id)}
                    >
                      {project.status === "Active" ? "Archive" : "Restore"}
                    </Button>,
                  ])}
                />
                {pageCount > 1 && (
                  <div className="resources-footer">
                    <p>Showing {first + 1}–{Math.min(first + PAGE_SIZE, matches.length)} of {matches.length}</p>
                    <Pagination aria-label="Project pages" count={pageCount} value={currentPage} onValueChange={setPage} />
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}
