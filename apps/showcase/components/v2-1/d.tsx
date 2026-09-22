"use client";

import { useEffect, useState } from "react";
import { FileUpload } from "sherick-ui";

/* Native selection, selected attachments, disabled and invalid fields. */

const build = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type, lastModified: 1 });

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
          accept=".pdf"
          maxSize={2 * 1024 * 1024}
        />
      </div>

      <div className="flex flex-col gap-3">
        <FileUpload
          label="Attachments"
          multiple
          accept=".pdf,image/*"
          maxSize={1024 * 1024}
          maxFiles={2}
          selectLabel="Add attachments"
          clearLabel="Remove all"
          files={attachments}
          onFilesChange={setAttachments}
        />
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
      </div>

      <div className="flex flex-col gap-3">
        <FileUpload
          label="Signed contract"
          description="Required before review."
          error="Attach the signed contract."
          accept=".pdf"
        />
      </div>
    </div>
  );
}
