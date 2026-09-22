"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Upload, X } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import Button from "./Button";
import {
  density,
  elevation,
  fieldLayout,
  focusRingInset,
  focusRingWithin,
  material,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";
import {
  fileKey,
  formatBytes,
  resolveMaxFiles,
  resolveMaxSize,
  selectFiles,
  type FileRejection,
} from "./fileUpload.rules";

export type { FileRejection } from "./fileUpload.rules";

/**
 * A labelled field that selects files from the native picker or by dropping them on its zone.
 *
 * `files` / `defaultFiles` own the *presented* selection. They are deliberately not the picker's
 * own value: the native input stays uncontrolled and is emptied after every read, so choosing the
 * same file twice still reports twice, and nothing this component does assigns files to it or
 * mirrors them into hidden inputs. There is therefore no `name`/`required` submission contract —
 * a consumer builds `FormData` from `onFilesChange`, which is the one place the selection is
 * reported.
 *
 * The chooser and the drop zone are the same door twice, so they answer to one policy
 * (`fileUpload.rules.ts`): a file refused by the picker's `accept` value cannot enter through a
 * drop, and a mixed batch keeps whatever was valid.
 */
export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "defaultValue"> {
  /** The field's label. It names the picker. */
  label: string;
  /** Supporting copy beneath the field. */
  description?: ReactNode;
  /**
   * The message shown while the field is invalid. Its presence is what makes the field invalid,
   * exactly as `error` does on the other fields in the library.
   */
  error?: ReactNode;
  /** The controlled selection. Undefined leaves the selection to the component. */
  files?: File[];
  /** The selection the field starts with when it is not controlled. */
  defaultFiles?: File[];
  /**
   * Reports the selection after every accepted change. The callback receives the next selection as
   * a whole, which is what a consumer builds `FormData` from.
   */
  onFilesChange?: (files: File[]) => void;
  /** Whether the field holds several files or replaces its selection with one. */
  multiple?: boolean;
  /** The native `accept` value: comma-separated MIME types and extensions. A UX restriction only. */
  accept?: string;
  /** Per-file byte limit. A larger file is refused and reported. */
  maxSize?: number;
  /** Total file limit. Only meaningful with `multiple`. */
  maxFiles?: number;
  /** Ignore user interaction. Removes the picker, the drop, the removals and the clear control. */
  disabled?: boolean;
  /** Reports the files a batch refused, with the reason for each. */
  onReject?: (items: FileRejection[]) => void;
  /** The copy on the zone's own affordance. */
  selectLabel?: string;
  /** The accessible name of one removal control. Defaults to `Remove <file name>`. */
  removeLabel?: (file: File) => string;
  /** The accessible name of the control that empties the selection. */
  clearLabel?: string;
}

type FocusRequest =
  | { kind: "row"; index: number; source: HTMLButtonElement }
  | { kind: "clear"; source: HTMLButtonElement };
type FileAction = { before: File[]; next: File[]; focus?: FocusRequest };

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      description,
      error,
      files,
      defaultFiles,
      onFilesChange,
      multiple = false,
      accept,
      maxSize,
      maxFiles,
      disabled = false,
      onReject,
      selectLabel = "Select files",
      removeLabel,
      clearLabel = "Clear files",
      className,
      ...rootProps
    },
    forwardedRef
  ) => {
    const baseId = useId();
    const hintId = `${baseId}-hint`;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const removalRefs = useRef(new Map<string, HTMLButtonElement>());
    const clearRef = useRef<HTMLButtonElement | null>(null);
    const dragDepth = useRef(0);
    const [pendingAction, setPendingAction] = useState<FileAction | null>(null);
    const [attempt, setAttempt] = useState(0);

    const [dragging, setDragging] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [rejections, setRejections] = useState<FileRejection[]>([]);
    const [uncontrolledFiles, setUncontrolledFiles] = useState<File[]>(() => defaultFiles ?? []);

    const controlled = files !== undefined;
    const selected = controlled ? files : uncontrolledFiles;
    const limits = {
      accept,
      maxSize: resolveMaxSize(maxSize),
      maxFiles: resolveMaxFiles(maxFiles, multiple),
      multiple,
    };

    // A request gets exactly its next committed render. Rejection expires it even if files
    // stays referentially identical, so a later external update cannot consume stale effects.
    useEffect(() => {
      if (!pendingAction) return;
      setPendingAction(null);
      const { before, next, focus } = pendingAction;
      const accepted = selected.length === next.length &&
        selected.every((file, index) => fileKey(file) === fileKey(next[index]));
      if (!accepted) return;

      const beforeKeys = new Set(before.map(fileKey));
      const afterKeys = new Set(selected.map(fileKey));
      const added = selected.filter((file) => !beforeKeys.has(fileKey(file))).length;
      const removed = before.filter((file) => !afterKeys.has(fileKey(file)));
      const parts: string[] = [];
      if (removed.length === 1) parts.push(`Removed ${removed[0].name}.`);
      else if (removed.length > 1) parts.push(`Removed ${removed.length} files.`);
      if (added > 0) parts.push(`Added ${added} file${added === 1 ? "" : "s"}.`);
      setAnnouncement(parts.join(" "));

      if (!focus || removed.length === 0) return;
      const document = focus.source.ownerDocument;
      if (document.activeElement !== focus.source &&
        (focus.source.isConnected || document.activeElement !== document.body)) return;
      const row = focus.kind === "row" ? selected[Math.min(focus.index, selected.length - 1)] : null;
      (row ? removalRefs.current.get(fileKey(row)) : inputRef.current)?.focus();
    }, [selected, pendingAction]);

    useEffect(() => {
      if (disabled) {
        dragDepth.current = 0;
        setDragging(false);
      }
    }, [disabled]);

    const commit = (next: File[], focus?: FocusRequest) => {
      setPendingAction({ before: selected, next, focus });
      if (!controlled) setUncontrolledFiles(next);
      onFilesChange?.(next);
    };

    const beginAttempt = () => {
      setAttempt((previous) => previous + 1);
      setAnnouncement("");
    };

    const ingest = (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;
      beginAttempt();

      const { files: next, rejections: refused, accepted } = selectFiles({
        incoming,
        current: selected,
        limits,
      });

      setRejections(refused);
      if (refused.length > 0) onReject?.(refused);
      if (accepted > 0) {
        commit(next);
      }
    };

    const handlePickerChange = (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      /* Read the batch before emptying the picker: clearing its value empties its file list too,
         and the `File` objects stay valid afterwards. The picker is never the selection's source
         of truth, so it is emptied after every read and the same file can be chosen again. */
      const incoming = Array.from(input.files ?? []);
      ingest(incoming);
      input.value = "";
    };

    /* Only a drag that carries files is a drop this zone owns: a text or link drag keeps whatever
       the page's own handlers say, and only this element stops the browser from navigating to a
       dropped file. */
    const carriesFiles = (event: DragEvent<HTMLLabelElement>) =>
      Array.from(event.dataTransfer.types).includes("Files");

    const handleDragEnter = (event: DragEvent<HTMLLabelElement>) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      if (disabled) return;
      dragDepth.current += 1;
      setDragging(true);
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? "none" : "copy";
    };

    const handleDragLeave = () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      ingest(Array.from(event.dataTransfer.files ?? []));
    };

    const removeFile = (index: number) => {
      const file = selected[index];
      if (disabled || !file) return;
      const control = removalRefs.current.get(fileKey(file));
      const focus: FocusRequest | undefined = control && control === control.ownerDocument.activeElement
        ? { kind: "row", index, source: control } : undefined;
      beginAttempt();
      setRejections([]);
      commit(selected.filter((_, position) => position !== index), focus);
    };

    const clearFiles = () => {
      if (disabled) return;
      const control = clearRef.current;
      const focus: FocusRequest | undefined = control && control === control.ownerDocument.activeElement
        ? { kind: "clear", source: control } : undefined;
      beginAttempt();
      setRejections([]);
      commit([], focus);
    };

    const hint = [
      accept ? `Accepts ${accept}` : null,
      limits.maxSize !== undefined ? `Up to ${formatBytes(limits.maxSize)} per file` : null,
      multiple
        ? limits.maxFiles !== undefined
          ? `Up to ${limits.maxFiles} file${limits.maxFiles === 1 ? "" : "s"}`
          : null
        : "One file",
    ]
      .filter((part): part is string => part !== null)
      .join(" · ");

    const status = announcement !== "" || rejections.length > 0;

    return (
      <Field.Root
        {...rootProps}
        disabled={disabled}
        invalid={Boolean(error)}
        className={cn(fieldLayout, className)}
      >
        <Field.Label className={cn("mb-2 text-sm font-medium", text.high)}>{label}</Field.Label>

        {/* The zone is a native label around the picker, so the whole surface opens the chooser
            with no JavaScript in the path, the keyboard reaches the same control the pointer does,
            and a disabled picker refuses both the same way. It is the field's only well — sunk by
            design (`elevation.recessed`) and quiet enough to sit back (`material.matteQuiet`) — and
            it holds the wide panel corner its own extent allows (`shape.surface`). A file drag over
            it takes the held tone. */}
        <label
          className={cn(
            "flex min-w-0 flex-col items-center gap-1.5 px-5 py-6 text-center",
            shape.surface,
            material.matteQuiet,
            elevation.recessed,
            motionFeedback,
            focusRingWithin,
            !disabled && state.enabled,
            !disabled && stateLayer.tonal,
            !disabled && dragging && tone.selected.primary,
            disabled && state.disabled
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* A slot fixes the mark's box: the icon cannot change the zone's geometry. */}
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5",
              text.medium
            )}
            aria-hidden="true"
          >
            <Upload />
          </span>

          <span className={cn("text-sm font-medium", text.high)}>
            {dragging ? (multiple ? "Drop files here" : "Drop the file here") : selectLabel}
          </span>

          {hint && (
            <span id={hintId} className={cn("text-xs leading-5", text.medium)}>
              {hint}
            </span>
          )}

          {/* Uncontrolled by design, and never assigned a value: the selection is the component's
              own state, and the picker is only a way to ask the platform for files. */}
          <Field.Control
            ref={forwardedRef}
            render={<input ref={inputRef} />}
            type="file"
            multiple={multiple || undefined}
            accept={accept}
            aria-describedby={hint ? hintId : undefined}
            onChange={handlePickerChange}
            className={cn("sr-only")}
          />
        </label>

        {selected.length > 0 && (
          <div className={cn("mt-3 flex min-w-0 flex-col gap-2")}>
            <ul role="list" className={cn("m-0 flex min-w-0 list-none flex-col gap-1.5 p-0")}>
              {selected.map((file, index) => {
                const key = fileKey(file);
                return (
                  <li
                    key={key}
                    /* One selected file per row, on the quiet matte step: the list reports what was
                       chosen and must not compete with the zone that chose it. A row that can wrap
                       still places its removal control on the first readable line — the 44px target
                       is offset by the difference between its own height and that line's, so its
                       ink sits at the row's own end padding. */
                    className={cn(
                      "flex min-w-0 items-start gap-2 px-3 py-2",
                      shape.control,
                      material.matteQuiet,
                      text.high,
                      motionFeedback
                    )}
                  >
                    <span className={cn("min-w-0 flex-1 text-sm leading-6 [overflow-wrap:anywhere]")}>
                      {file.name}
                    </span>
                    <BaseButton
                      ref={(node: HTMLButtonElement | null) => {
                        if (node) removalRefs.current.set(key, node);
                        else removalRefs.current.delete(key);
                      }}
                      type="button"
                      aria-label={removeLabel ? removeLabel(file) : `Remove ${file.name}`}
                      disabled={disabled}
                      onClick={() => removeFile(index)}
                      className={cn(
                        "group -my-2.5 inline-flex shrink-0 items-center justify-center",
                        density.target,
                        shape.circle,
                        text.medium,
                        !disabled && "hover:text-sherick-ink",
                        motionFeedback,
                        focusRingInset,
                        stateLayer.quiet,
                        disabled ? state.disabled : state.enabled
                      )}
                    >
                      <span className={cn("inline-flex items-center justify-center", motionInkPress)}>
                        <X className={cn("size-5")} aria-hidden="true" />
                      </span>
                    </BaseButton>
                  </li>
                );
              })}
            </ul>

            <div className={cn("flex justify-end")}>
              <Button
                ref={clearRef}
                type="button"
                appearance="text"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={clearFiles}
              >
                {clearLabel}
              </Button>
            </div>
          </div>
        )}

        {description && (
          <Field.Description className={cn("mt-2 text-xs leading-5", text.medium)}>
            {description}
          </Field.Description>
        )}

        {error ? (
          <Field.Error match className={cn("mt-2 text-xs leading-5 text-sherick-danger")}>
            {error}
          </Field.Error>
        ) : null}

        {/* Mounted whether or not it holds anything, so the region exists before its content
            changes. It reports what the selection became — and every failure with its file. */}
        <div role="status" className={cn(status && "mt-2 flex flex-col gap-1 text-xs leading-5")}>
          {announcement !== "" && <span className={cn(text.medium)}>{announcement}</span>}
          {rejections.length > 0 && (
            <span key={attempt} className={cn("text-sherick-danger")}>
              {rejections.map((rejection) => rejection.message).join(" ")}
            </span>
          )}
        </div>
      </Field.Root>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
