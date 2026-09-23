"use client";

import { Ellipsis } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertDialog, Breadcrumb, Button, Dialog, IconButton, Input, Menu, Tabs, Textarea, useToast } from "sherick-ui";
import "./detail.css";

export default function ProjectDetailExample({ projectsHref = "/projects" }: { projectsHref?: string }) {
  const [name, setName] = useState("Customer portal");
  const [summary, setSummary] = useState("Customer-facing work and releases in one shared place.");
  const [draftName, setDraftName] = useState(name);
  const [draftSummary, setDraftSummary] = useState(summary);
  const [nameError, setNameError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const deletedHeadingRef = useRef<HTMLHeadingElement>(null);
  const toast = useToast();
  const changed = draftName !== name || draftSummary !== summary;

  useEffect(() => {
    if (deleted) deletedHeadingRef.current?.focus();
  }, [deleted]);

  function openEdit() {
    setDraftName(name);
    setDraftSummary(summary);
    setNameError(false);
    setEditOpen(true);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = draftName.trim();
    if (nextName.length < 3) {
      setNameError(true);
      nameRef.current?.focus();
      return;
    }
    // Replace this local commit with your API save and show success only after it succeeds.
    setName(nextName);
    setSummary(draftSummary.trim());
    setEditOpen(false);
    toast.add({ type: "success", title: "Project updated" });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.add({ type: "success", title: "Link copied" });
    } catch {
      toast.add({ type: "danger", title: "Could not copy the link" });
    }
  }

  return (
    <main className="detail-page">
      {deleted ? (
        <>
          <Breadcrumb items={[{ label: "Projects", href: projectsHref }, { label: "Deleted" }]} />
          <section className="detail-deleted" aria-labelledby="detail-deleted-title">
            <h1 id="detail-deleted-title" ref={deletedHeadingRef} tabIndex={-1}>Project deleted</h1>
            <p>Return to Projects to continue working.</p>
          </section>
        </>
      ) : (
        <>
          <Breadcrumb items={[{ label: "Projects", href: projectsHref }, { label: "Details" }]} />

          <header className="detail-heading">
            <div className="detail-identity">
              <h1>{name}</h1>
              <p>{summary}</p>
            </div>
            <div className="detail-actions">
              <Button appearance="filled" onClick={openEdit}>Edit project</Button>
              <Menu>
                <Menu.Trigger render={<IconButton appearance="ghost" variant="secondary" icon={<Ellipsis />} aria-label="More project actions" />} />
                <Menu.Content align="end">
                  <Menu.Item onClick={copyLink}>Copy link</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item variant="danger" onClick={() => setDeleteOpen(true)}>Delete project</Menu.Item>
                </Menu.Content>
              </Menu>
            </div>
          </header>

          <div className="detail-layout">
            <div className="detail-main">
              <Tabs
                ariaLabel="Project views"
                tabs={[
                  {
                    id: "overview",
                    label: "Overview",
                    content: (
                      <section className="detail-section" aria-labelledby="detail-overview-title">
                        <h2 id="detail-overview-title">About this project</h2>
                        <p>Coordinate requests, documentation and release milestones across the team.</p>
                        <h3>Current priorities</h3>
                        <ul>
                          <li>Review open requests with the support team.</li>
                          <li>Prepare the next release handoff.</li>
                        </ul>
                      </section>
                    ),
                  },
                  {
                    id: "activity",
                    label: "Activity",
                    content: (
                      <section className="detail-section" aria-labelledby="detail-activity-title">
                        <h2 id="detail-activity-title">Recent activity</h2>
                        <ol className="detail-activity" role="list">
                          <li><span>Jordan Lee updated the release checklist.</span><time dateTime="2026-09-23">Sep 23, 2026</time></li>
                          <li><span>Mina Patel added a support guide.</span><time dateTime="2026-09-22">Sep 22, 2026</time></li>
                          <li><span>The project was created.</span><time dateTime="2026-09-22">Sep 22, 2026</time></li>
                        </ol>
                      </section>
                    ),
                  },
                ]}
              />
            </div>

            <aside className="detail-metadata" aria-labelledby="detail-metadata-title">
              <h2 id="detail-metadata-title">Project details</h2>
              <dl>
                <div><dt>Owner</dt><dd>You</dd></div>
                <div><dt>Team</dt><dd>Operations</dd></div>
                <div><dt>Created</dt><dd><time dateTime="2026-09-22">Sep 22, 2026</time></dd></div>
                <div><dt>Access</dt><dd>Team members</dd></div>
              </dl>
            </aside>
          </div>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <Dialog.Header>Edit project</Dialog.Header>
            <Dialog.Description>Update the name and summary shown on this page.</Dialog.Description>
            <Dialog.Content>
              <form id="project-detail-edit" className="detail-form" noValidate onSubmit={save}>
                <Input
                  ref={nameRef}
                  label="Project name"
                  required
                  maxLength={80}
                  value={draftName}
                  onValueChange={(value) => { setDraftName(value); setNameError(false); }}
                  error={nameError}
                  errorMessage="Enter at least three characters."
                />
                <Textarea
                  label="Summary"
                  maxLength={200}
                  value={draftSummary}
                  onValueChange={setDraftSummary}
                />
              </form>
            </Dialog.Content>
            <Dialog.Footer>
              <Button appearance="text" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button appearance="filled" type="submit" form="project-detail-edit" disabled={!changed}>Save changes</Button>
            </Dialog.Footer>
          </Dialog>
        </>
      )}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete project?"
        description="The project and its activity will be removed. This cannot be undone."
        cancelLabel="Keep project"
        confirmLabel="Delete project"
        onConfirm={() => {
          // Replace this local deletion with your API call; notify only after it succeeds.
          setDeleted(true);
          toast.add({ type: "success", title: "Project deleted", description: `${name} was removed.` });
        }}
      />
    </main>
  );
}
