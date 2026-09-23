"use client";

import { useRef, useState, type FormEvent } from "react";
import { AlertDialog, Button, Divider, Field, Input, Switch, Textarea } from "sherick-ui";
import "./settings.css";

type Settings = {
  name: string;
  email: string;
  description: string;
  weeklySummary: boolean;
};

const initialSettings: Settings = {
  name: "Operations",
  email: "team@example.com",
  description: "Projects and shared work for the operations team.",
  weeklySummary: true,
};

export default function SettingsExample() {
  const [saved, setSaved] = useState(initialSettings);
  const [draft, setDraft] = useState(initialSettings);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tokensRevoked, setTokensRevoked] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const dirty = draft.name !== saved.name || draft.email !== saved.email ||
    draft.description !== saved.description || draft.weeklySummary !== saved.weeklySummary;

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSavedMessage("");
  }

  function cancel() {
    setDraft(saved);
    setErrors({});
    setSavedMessage("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = { ...draft, name: draft.name.trim(), email: draft.email.trim() };
    const nextErrors = {
      name: next.name.length < 3 ? "Enter at least three characters." : undefined,
      email: !next.email ? "Enter a contact email."
        : emailRef.current?.validity.typeMismatch ? "Enter a valid email address." : undefined,
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) {
      (nextErrors.name ? nameRef : emailRef).current?.focus();
      return;
    }

    // Replace this local commit with your API save; update `saved` only after it succeeds.
    setSaved(next);
    setDraft(next);
    setSavedMessage("Changes saved.");
  }

  return (
    <main className="settings-page">
      <header className="settings-heading">
        <h1>Workspace settings</h1>
        <p>Manage the details and preferences for your workspace.</p>
      </header>

      <form noValidate onSubmit={save}>
        <section className="settings-section" aria-labelledby="settings-details">
          <h2 id="settings-details">Workspace details</h2>
          <div className="settings-fields">
            <Input
              ref={nameRef}
              label="Workspace name"
              name="name"
              required
              maxLength={60}
              value={draft.name}
              onValueChange={(value) => update("name", value)}
              error={Boolean(errors.name)}
              errorMessage={errors.name}
            />
            <Input
              ref={emailRef}
              label="Contact email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={draft.email}
              onValueChange={(value) => update("email", value)}
              error={Boolean(errors.email)}
              errorMessage={errors.email}
            />
            <Textarea
              label="Description"
              name="description"
              description="Shown to people in this workspace."
              maxLength={240}
              value={draft.description}
              onValueChange={(value) => update("description", value)}
            />
          </div>
        </section>

        <section className="settings-section" aria-labelledby="settings-notifications">
          <h2 id="settings-notifications">Notifications</h2>
          <Field label="Weekly summary" description="Email a summary of workspace activity each week.">
            <Switch
              className="settings-switch"
              checked={draft.weeklySummary}
              onCheckedChange={(checked) => update("weeklySummary", checked)}
            />
          </Field>
        </section>

        <div className="settings-actions">
          <p role="status">{savedMessage}</p>
          <Button appearance="text" variant="secondary" onClick={cancel} disabled={!dirty}>Cancel</Button>
          <Button appearance="filled" type="submit" disabled={!dirty}>Save changes</Button>
        </div>
      </form>

      <Divider className="settings-divider" />
      <section className="settings-danger" aria-labelledby="settings-danger-title">
        <h2 id="settings-danger-title">Access tokens</h2>
        <p>Revoking all tokens disconnects integrations using this workspace. Tokens cannot be recovered.</p>
        <Button appearance="tonal" variant="danger" onClick={() => setConfirmOpen(true)}>Revoke all tokens</Button>
        <p role="status">{tokensRevoked ? "All access tokens revoked." : ""}</p>
      </section>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Revoke all access tokens?"
        description="Integrations using these tokens will stop working immediately. The tokens cannot be recovered; create new ones to reconnect."
        cancelLabel="Keep tokens"
        confirmLabel="Revoke all tokens"
        onConfirm={() => {
          // Replace this local result with your API call and report any failure to the user.
          setTokensRevoked(true);
        }}
      />
    </main>
  );
}
