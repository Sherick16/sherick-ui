/* File selection rules for `FileUpload`.

   The native chooser and the drop zone are two doors into one policy: the same accept, the same
   per-file size and the same total count decide both, so a file the picker would refuse cannot
   slip in through a drop. Nothing here reads a browser global — every rule works from the
   metadata a `File` already carries — so the module is safe to evaluate during SSR and can be
   probed without a document.

   `FileUpload.tsx` composes the field around these rules; it owns no rule of its own. */

export type RejectionCode = "type" | "size" | "count";

/** One file a selection operation refused, with the reason it was refused. */
export interface FileRejection {
  file: File;
  code: RejectionCode;
  message: string;
}

export interface FileSelectionLimits {
  /** The native `accept` value, comma-separated MIME types and extensions. */
  accept?: string;
  /** Per-file byte limit, already normalized. */
  maxSize?: number;
  /** Total file limit, already normalized. */
  maxFiles?: number;
  /** Whether the field holds several files or replaces its selection with one. */
  multiple: boolean;
}

export interface FileSelection {
  /** The selection the operation leaves behind. */
  files: File[];
  /** Everything the batch refused, in the order it arrived. */
  rejections: FileRejection[];
  /** How many of the incoming files entered the selection. */
  accepted: number;
}

/** The identity of one selection entry: the fields that make two `File`s the same choice. */
export const fileKey = (file: File) =>
  `${file.name}\u0000${file.size}\u0000${file.type}\u0000${file.lastModified}`;

/** The per-file byte limit as a whole number, or `undefined` when the caller set none. */
export const resolveMaxSize = (maxSize?: number) =>
  maxSize !== undefined && Number.isFinite(maxSize) && maxSize >= 0 ? Math.floor(maxSize) : undefined;

/**
 * The total file limit, or `undefined` when the selection is unbounded. A single-file field
 * holds exactly one: the picker is told nothing about it, because that limit is what makes a
 * second file a replacement rather than an addition.
 */
export const resolveMaxFiles = (maxFiles: number | undefined, multiple: boolean) => {
  if (!multiple) return 1;
  return maxFiles !== undefined && Number.isFinite(maxFiles) && maxFiles >= 0
    ? Math.floor(maxFiles)
    : undefined;
};

/** A byte limit as the copy spells it: `2 MB`, never `2097152`. */
export const formatBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${units[unit]}`;
};

const acceptTokens = (accept?: string) =>
  (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

/** An extension token starts with a dot; anything else has to name a media type. */
const isAcceptToken = (token: string) => (token.startsWith(".") ? token.length > 1 : token.includes("/"));

/**
 * Whether a file satisfies the native `accept` restriction. An extension token matches the file
 * name, a media type matches the reported MIME type, and a `type/*` wildcard matches a whole
 * family of them. A file that reports no MIME type at all can satisfy an extension but can never
 * establish a MIME-only match, which is exactly what the platform does. A malformed `accept`
 * value is ignored entirely rather than taken as a restriction that refuses everything, again
 * mirroring the platform: a typo must not close the field.
 */
export const matchesAccept = (file: File, accept?: string) => {
  const tokens = acceptTokens(accept);
  if (tokens.length === 0 || !tokens.every(isAcceptToken)) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type !== "" && type.startsWith(token.slice(0, -1));
    return type !== "" && type === token;
  });
};

const countMessage = (file: File, limit: number, multiple: boolean) =>
  multiple
    ? `${file.name} was not added: at most ${limit} file${limit === 1 ? "" : "s"} can be selected.`
    : `${file.name} was not added: this field holds one file.`;

/**
 * Applies the whole policy to one batch, from either door.
 *
 * Each file is judged type first, then size, then count — the caller's order of severity — and a
 * refusal never removes a file that was already accepted, so the valid part of a mixed batch
 * still enters. A file the selection already holds is not a failure, it is the same choice
 * arriving twice, so it is neither reported nor counted against the limit.
 *
 * A single-file field starts from an empty selection: the first accepted file replaces what was
 * there and everything after it is a count failure.
 */
export const selectFiles = ({
  incoming,
  current,
  limits,
}: {
  incoming: File[];
  current: File[];
  limits: FileSelectionLimits;
}): FileSelection => {
  const maxSize = resolveMaxSize(limits.maxSize);
  const maxFiles = resolveMaxFiles(limits.maxFiles, limits.multiple);

  const files = limits.multiple ? [...current] : [];
  const keys = new Set(current.map(fileKey));
  const rejections: FileRejection[] = [];
  let accepted = 0;

  for (const file of incoming) {
    if (!matchesAccept(file, limits.accept)) {
      rejections.push({ file, code: "type", message: `${file.name} is not an accepted file type.` });
      continue;
    }

    if (maxSize !== undefined && file.size > maxSize) {
      rejections.push({
        file,
        code: "size",
        message: `${file.name} is larger than the ${formatBytes(maxSize)} limit.`,
      });
      continue;
    }

    const key = fileKey(file);
    if (keys.has(key)) continue;

    if (maxFiles !== undefined && files.length >= maxFiles) {
      rejections.push({ file, code: "count", message: countMessage(file, maxFiles, limits.multiple) });
      continue;
    }

    keys.add(key);
    files.push(file);
    accepted += 1;
  }

  return { files, rejections, accepted };
};
