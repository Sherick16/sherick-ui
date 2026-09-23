import * as React from "react";
import {
  Breadcrumb, Calendar, Command, CommandPalette, DatePicker, DateRangePicker, FileUpload,
  Media, Pagination, Stepper, TreeView,
  type BreadcrumbItem, type BreadcrumbProps, type CalendarDate, type CalendarLabels,
  type CalendarProps, type CommandItem, type CommandProps, type CommandPaletteProps,
  type DateRange, type DatePickerProps, type DateRangePickerProps, type FileRejection,
  type FileUploadProps, type PaginationProps, type StepperItem, type StepperProps,
  type TreeViewItem, type TreeViewProps, type MediaImageProps, type MediaVideoProps,
} from "sherick-ui";

const date: CalendarDate = "2024-06-10";
const range: DateRange = { start: date, end: null };
const labels: Partial<CalendarLabels> = { today: "Today" };
const calendar: CalendarProps = { mode: "range", value: range, labels, onValueChange: (next: DateRange) => void next.end };
const picker: DatePickerProps = { label: "Date", value: date, name: "date", form: "form", onValueChange: (next: CalendarDate | null) => void next };
const rangePicker: DateRangePickerProps = { label: "Range", value: range, startName: "start", endName: "end", onValueChange: (next: DateRange) => void next.start };
const commands: CommandItem[] = [{ value: "save", label: "Save", keywords: ["write"], group: "File" }];
const command: CommandProps = { label: "Commands", items: commands, onAction: (value: string) => void value, onValueChange: (_value, details) => void details.reason };
const palette: CommandPaletteProps = { ...command, title: "Commands", onOpenChange: (_open, details) => details.cancel() };
const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, { label: "Current" }];
const breadcrumb: BreadcrumbProps = { items: breadcrumbItems, renderLink: (_item, props) => <a {...props} /> };
const pagination: PaginationProps = { count: 10, value: 2, getPageHref: page => `?page=${page}`, onValueChange: (page: number) => void page };
const upload: FileUploadProps = { label: "Files", files: [], onFilesChange: (files: File[]) => void files, onReject: (rejections: FileRejection[]) => void rejections };
const steps: StepperItem[] = [{ value: "one", label: "One", complete: true }];
const stepper: StepperProps = { items: steps, value: "one", onValueChange: (value: string) => void value };
const treeItems: TreeViewItem[] = [{ value: "root", label: "Root", children: [{ value: "child", label: "Child" }] }];
const tree: TreeViewProps = { label: "Tree", items: treeItems, onValueChange: (value: string | null) => void value, onExpandedValuesChange: (values: string[]) => void values };
const image: MediaImageProps = { src: "/office.jpg", alt: "Office", srcSet: "/office@2x.jpg 2x" };
const video: MediaVideoProps = { poster: "/poster.jpg", controls: true, preload: "none" };

export const wave = <>
  <Calendar {...calendar} ref={React.createRef<HTMLDivElement>()} />
  <Calendar value={date} onValueChange={(value: CalendarDate | null) => void value} />
  <DatePicker {...picker} ref={React.createRef<HTMLInputElement>()} />
  <DateRangePicker {...rangePicker} ref={React.createRef<HTMLInputElement>()} />
  <Command {...command} ref={React.createRef<HTMLInputElement>()} />
  <CommandPalette {...palette} ref={React.createRef<HTMLInputElement>()} />
  <Breadcrumb {...breadcrumb} ref={React.createRef<HTMLElement>()} />
  <Pagination {...pagination} ref={React.createRef<HTMLElement>()} />
  <FileUpload {...upload} ref={React.createRef<HTMLInputElement>()} />
  <Stepper {...stepper} ref={React.createRef<HTMLElement>()} />
  <TreeView {...tree} ref={React.createRef<HTMLDivElement>()} />
  <Media.Image {...image} ref={React.createRef<HTMLImageElement>()} />
  <Media.Image src="/pattern.jpg" decorative />
  <Media.Video {...video} ref={React.createRef<HTMLVideoElement>()}>
    <source src="/demo.webm" type="video/webm" />
    <track kind="captions" src="/en.vtt" srcLang="en" label="English" />
  </Media.Video>
  <Media.Video src="/ambient.mp4" autoPlay muted loop decorative />
</>;

// @ts-expect-error range mode must not accept a single-date value
export const invalidRange = <Calendar mode="range" value={date} />;
// @ts-expect-error single mode must not accept a range
export const invalidSingle = <Calendar value={range} />;
// @ts-expect-error picker ref is the native input, not its visible div
export const invalidPickerRef = <DatePicker label="Date" ref={React.createRef<HTMLDivElement>()} />;
// @ts-expect-error FileUpload reports files; it does not claim native name/FormData participation
export const invalidUploadName = <FileUpload label="Files" name="files" />;
// @ts-expect-error a tree value is an identity, not an item object
export const invalidTree = <TreeView label="Tree" items={treeItems} value={treeItems[0]} />;
// @ts-expect-error meaningful images require alt
export const missingAlt = <Media.Image src="/office.jpg" />;
// @ts-expect-error decorative images cannot claim descriptive alt
export const conflictingImage = <Media.Image src="/pattern.jpg" decorative alt="Pattern" />;
// @ts-expect-error decorative video cannot have interactive controls
export const conflictingVideo = <Media.Video src="/ambient.mp4" decorative controls />;
// @ts-expect-error decorative video cannot be keyboard focusable
export const conflictingTabStop = <Media.Video src="/ambient.mp4" decorative tabIndex={0} />;
