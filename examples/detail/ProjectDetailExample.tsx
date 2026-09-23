"use client";

import { useRef, useState, type FormEvent } from "react";
import { Badge, Breadcrumb, Button, Dialog, Input, Tabs, Textarea } from "sherick-ui";
import "./detail.css";

export default function ProjectDetailExample({ projectsHref = "/projects" }: { projectsHref?: string }) {
  const [name, setName] = useState("Customer portal");
  const [summary, setSummary] = useState("Customer-facing work and releases in one shared place.");
  const [draftName, setDraftName] = useState(name);
  const [draftSummary, setDraftSummary] = useState(summary);
  const [nameError, setNameError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [message, setMessage] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const changed = draftName !== name || draftSummary !== summary;

  function openEdit() {
    setDraftName(name);
    setDraftSummary(summary);
    setNameError(false);
    setMessage("");
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
    setMessage("Project updated.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Link copied.");
    } catch {
      setMessage("Could not copy the link.");
    }
  }

  return (
    <main className="detail-page">
      <Breadcrumb items={[{ label: "Projects", href: projectsHref }, { label: "Details" }]} />

      <header className="detail-heading">
        <div className="detail-identity">
          <div className="detail-title">
            <h1>{name}</h1>
            <Badge variant="success">Active</Badge>
          </div>
          <p>{summary}</p>
        </div>
        <div className="detail-actions">
          <Button appearance="text" variant="secondary" onClick={copyLink}>Copy link</Button>
          <Button appearance="filled" onClick={openEdit}>Edit project</Button>
        </div>
      </header>
      <p className="detail-message" role="status">{message}</p>

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
    </main>
  );
}
