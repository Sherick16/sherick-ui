import { ToastProvider, ToastViewport } from "sherick-ui";
import ProjectDetailExample from "../../../../../../examples/detail/ProjectDetailExample";

export default function ProjectDetailPreview() {
  return (
    <ToastProvider>
      <ProjectDetailExample projectsHref="/examples/resources" />
      <ToastViewport />
    </ToastProvider>
  );
}
