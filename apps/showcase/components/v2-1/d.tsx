"use client";

import { useEffect, useState } from "react";
import FileUpload from "../../../../packages/ui/src/components/FileUpload";

/* FileUpload specimens: the field's meaningful states, once each — at rest, holding a selection
   under its limits, disabled, and invalid. The component under test is imported by source path for
   isolated iteration; the parent replaces that with the package-root import at integration. */

const build = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type, lastModified: 1 });

const caption = "text-xs leading-5 text-sherick-ink-muted";

export default function FileUploadSpecimen() {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [locked, setLocked] = useState<File[]>([]);

  useEffect(() => {
    /* `File` is a browser global, so a seeded selection is created once the client is running and
       never during a server render. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the seeds cannot exist before hydration.
    setAttachments([
      build("brand-guide.pdf", "application/pdf", 240),
      build("hero-shot.png", "image/png", 180),
    ]);
    setLocked([build("signed-contract.pdf", "application/pdf", 120)]);
  }, []);

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="flex flex-col gap-3">
        <FileUpload
          label="Design brief"
          description="One PDF, up to 2 MB."
          accept=".pdf"
          maxSize={2 * 1024 * 1024}
        />
        <p className={caption}>At rest · single file</p>
      </div>

      <div className="flex flex-col gap-3">
        <FileUpload
          label="Attachments"
          description="Two files, up to 1 MB each."
          multiple
          accept=".pdf,image/*"
          maxSize={1024 * 1024}
          maxFiles={2}
          selectLabel="Add attachments"
          clearLabel="Remove all"
          files={attachments}
          onFilesChange={setAttachments}
        />
        <p className={caption}>Holding a selection · multiple, with limits</p>
      </div>

      <div className="flex flex-col gap-3">
        <FileUpload
          label="Locked evidence"
          description="Attached by the reviewer."
          multiple
          disabled
          files={locked}
          onFilesChange={setLocked}
        />
        <p className={caption}>Disabled · every path closed</p>
      </div>

      <div className="flex flex-col gap-3">
        <FileUpload
          label="Signed contract"
          description="Required before review."
          error="Attach the signed contract."
          accept=".pdf"
        />
        <p className={caption}>Invalid · its own error</p>
      </div>
    </div>
  );
}
