# Project detail

Copy [`ProjectDetailExample.tsx`](ProjectDetailExample.tsx) and [`detail.css`](detail.css) into a React application. Load host CSS before `sherick-ui/styles.css`, and mount `ToastProvider` and `ToastViewport` once at the application root (the preview route shows the integration). Pass your project-list route as `projectsHref` and replace the sample data and activity with real data. The local edit and confirmed deletion are demonstrations: persist them through your API, raise success toasts only after it succeeds, and navigate to the list after deletion. Copy link uses the current URL and reports clipboard failure.

Run `bun run dev` and visit `/examples/resources/customer-portal` for the preview. It uses the [project-list example](../resources/) as its breadcrumb destination; the detail source imports Sherick UI through its public barrel and uses Lucide for the ellipsis icon.
