"use client";

import { useEffect, useState } from "react";
import { FileUpload } from "sherick-ui";

/* Empty and selected examples; edge cases live on the verification page. */

const build = (name: string, type: string, bytes: number) =>
  new File([new Uint8Array(bytes)], name, { type, lastModified: 1 });

export default function FileUploadSpecimen() {
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    /* `File` is a browser global, so a seeded selection is created once the client is running and
       never during a server render. */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the seeds cannot exist before hydration.
    setAttachments([
      build("brand-guide.pdf", "application/pdf", 240),
      build("hero-shot.png", "image/png", 180),
    ]);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
    </div>
  );
}
