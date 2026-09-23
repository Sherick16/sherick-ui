# Application sidebar

Copy [`SidebarExample.tsx`](SidebarExample.tsx) and [`sidebar.css`](sidebar.css) into your React application. Install `sherick-ui` and `lucide-react`; load your host CSS before `sherick-ui/styles.css`. Render `<SidebarExample currentPath={pathname}>…</SidebarExample>` with your router's current pathname (use `basePath` if the destinations live under a route prefix). Replace the destination URLs, product identity and account copy. `NavItem` owns link states; `Drawer` owns mobile focus, dismissal and scrolling.

Preview: run `bun run dev` and visit `/examples/sidebar/overview` in the showcase. The preview route is only a viewer; the source above uses public exports and does not import from the showcase.
