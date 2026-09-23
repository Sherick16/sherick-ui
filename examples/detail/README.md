# Project detail

Copy [`ProjectDetailExample.tsx`](ProjectDetailExample.tsx) and [`detail.css`](detail.css) into a React application. Load host CSS before `sherick-ui/styles.css`. Pass your project-list route as `projectsHref`, replace the sample project data and activity with real data, and replace the marked local edit with an API call that reports success only after saving. The Copy link action uses the current page URL and reports clipboard failure.

Run `bun run dev` and visit `/examples/resources/customer-portal` for the preview. It uses the [project-list example](../resources/) as its breadcrumb destination; the detail source imports only public Sherick UI components.
