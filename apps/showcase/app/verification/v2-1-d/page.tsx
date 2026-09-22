"use client";

import { useCallback, useEffect, useState } from "react";
import FileUpload from "../../../../../packages/ui/src/components/FileUpload";
import type { FileRejection } from "../../../../../packages/ui/src/components/FileUpload";

/* Verification harness for the FileUpload unit. It holds the states a browser test has to be able
   to reach — a seeded selection, a consumer that refuses an update, a disabled field — and the
   probes that report what the component told its consumer. The component under test is imported by
   source path for isolated iteration; the parent replaces that with the package-root import at
   integration. */

const build = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type, lastModified: 1 });

const names = (files: File[]) => (files.length > 0 ? files.map((file) => file.name).join(", ") : "(none)");
const codes = (items: FileRejection[]) =>
  items.length > 0 ? items.map((item) => `${item.code}:${item.file.name}`).join(", ") : "(none)";

export default function VerificationFileUploadPage() {
  const [multiple, setMultiple] = useState<File[]>([]);
  const [multipleRejections, setMultipleRejections] = useState<FileRejection[]>([]);
  const [singleRejections, setSingleRejections] = useState<FileRejection[]>([]);
  const [scanRejections, setScanRejections] = useState<FileRejection[]>([]);
  const [removal, setRemoval] = useState<File[]>([]);
  const [disabledFiles, setDisabledFiles] = useState<File[]>([]);
  const [controlled, setControlled] = useState<File[]>([]);
  const [committed, setCommitted] = useState<File[]>([]);
  const [defaultsCommitted, setDefaultsCommitted] = useState<File[]>([]);
  const [frozen, setFrozen] = useState(false);
  const [narrow, setNarrow] = useState<File[]>([]);
  const [refTag, setRefTag] = useState("(none)");
  /* The browser-only field mounts its seeds itself: a `File` cannot exist during a server render,
     and `defaultFiles` is read when the field mounts. */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRemoval([
      build("alpha.pdf", "application/pdf", 64),
      build("beta.pdf", "application/pdf", 64),
      build("gamma.pdf", "application/pdf", 64),
    ]);
    setDisabledFiles([build("locked.pdf", "application/pdf", 64)]);
    setNarrow([
      build("a-file-name-that-cannot-possibly-fit-inside-this-narrow-column.pdf", "application/pdf", 64),
    ]);
    setHydrated(true);
  }, []);

  /* One stable ref callback: the probe reports the element the component forwarded, and a fresh
     callback on every render would detach and re-attach it each time. */
  const readPickerRef = useCallback((node: HTMLInputElement | null) => {
    setRefTag(node ? `${node.tagName}:${node.type}` : "(none)");
  }, []);

  const commitControlled = (next: File[]) => {
    setCommitted(next);
    if (!frozen) setControlled(next);
  };

  return (
    <main
      data-testid="v2-1-d"
      className="min-h-screen bg-sherick-canvas px-10 py-12 text-sherick-ink"
    >
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">FileUpload verification</h1>
          <p className="text-sherick-ink-muted">
            One door twice: the native chooser and the drop zone answer to the same rules.
          </p>
        </header>

        <div data-testid="v2-1-d-single">
          <FileUpload
            label="Single document"
            description="A PDF up to 1 KB, one file."
            accept=".pdf"
            maxSize={1024}
            selectLabel="Choose document"
            onReject={setSingleRejections}
            ref={readPickerRef}
          />
          <p data-testid="v2-1-d-single-rejections">{codes(singleRejections)}</p>
          <p data-testid="v2-1-d-single-ref">{refTag}</p>
        </div>

        <div data-testid="v2-1-d-multiple">
          <FileUpload
            label="Attachments"
            description="Up to two files."
            multiple
            accept=".pdf,image/*"
            maxSize={1024}
            maxFiles={2}
            selectLabel="Add files"
            clearLabel="Remove all"
            removeLabel={(file) => `Delete ${file.name}`}
            files={multiple}
            onFilesChange={setMultiple}
            onReject={setMultipleRejections}
          />
          <p data-testid="v2-1-d-multiple-rejections">{codes(multipleRejections)}</p>
        </div>

        <div data-testid="v2-1-d-mime-only">
          <FileUpload
            label="Scans"
            multiple
            accept="application/pdf"
            selectLabel="Add scans"
            onReject={setScanRejections}
          />
          <p data-testid="v2-1-d-mime-only-rejections">{codes(scanRejections)}</p>
        </div>

        <div data-testid="v2-1-d-controlled">
          <FileUpload
            label="Managed selection"
            description="The consumer owns this selection."
            multiple
            files={controlled}
            onFilesChange={commitControlled}
          />
          <div className="mt-2 flex items-center gap-3">
            <button type="button" data-testid="v2-1-d-freeze" onClick={() => setFrozen((value) => !value)}>
              {frozen ? "Allow updates" : "Freeze updates"}
            </button>
            <p data-testid="v2-1-d-controlled-committed">{names(committed)}</p>
          </div>
        </div>

        {hydrated && (
          <div data-testid="v2-1-d-defaults">
            <FileUpload
              label="Seeded selection"
              multiple
              defaultFiles={[build("seeded.pdf", "application/pdf", 64)]}
              onFilesChange={setDefaultsCommitted}
            />
            <p data-testid="v2-1-d-defaults-committed">{names(defaultsCommitted)}</p>
          </div>
        )}

        <div data-testid="v2-1-d-removal">
          <FileUpload label="Review queue" multiple files={removal} onFilesChange={setRemoval} />
        </div>

        <div data-testid="v2-1-d-disabled">
          <FileUpload
            label="Locked evidence"
            description="Attached by the reviewer."
            multiple
            disabled
            files={disabledFiles}
            onFilesChange={setDisabledFiles}
          />
        </div>

        <div data-testid="v2-1-d-error">
          <FileUpload
            label="Signed contract"
            description="Required before review."
            error="Attach the signed contract."
            accept=".pdf"
          />
        </div>

        <div data-testid="v2-1-d-narrow" className="w-[220px]">
          <FileUpload label="Narrow column" multiple files={narrow} onFilesChange={setNarrow} />
        </div>
      </section>
    </main>
  );
}
