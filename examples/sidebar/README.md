# Application sidebar

Copy [`SidebarExample.tsx`](SidebarExample.tsx) and [`sidebar.css`](sidebar.css) into your React application. Install `sherick-ui` and `lucide-react`; load your host CSS before `sherick-ui/styles.css`. Render `<SidebarExample currentPath={pathname}>…</SidebarExample>` with your router's current pathname (use `basePath` if the destinations live under a route prefix). Replace the destination URLs, product identity and account copy. `NavItem` owns link states; `Drawer` owns mobile focus, dismissal and scrolling.

Preview: run `bun run dev` and visit `/examples/sidebar/overview` in the showcase. The preview route is only a viewer; the source above uses public exports and does not import from the showcase.

## SPA navigation keeps the anchor

A router adapter may wrap `NavItem` because it already renders an anchor and accepts
anchor props. Keep its real `href`, current-route indication and native modified-click,
new-tab, download and target behavior. Use your router's supported anchor adapter where
available. An ordinary primary navigation destination can also be your router's native
`Link` with local presentation; it does not need a new library component.

This router-neutral handler illustrates the boundary (`navigate` is supplied by the app):

```tsx
function handleDestination(event: React.MouseEvent<HTMLAnchorElement>) {
  const anchor = event.currentTarget;
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || anchor.hasAttribute("download") ||
      (anchor.target && anchor.target !== "_self") || anchor.origin !== location.origin) return;
  event.preventDefault();
  navigate(anchor.pathname + anchor.search + anchor.hash);
}

<NavItem href="/projects" active={pathname === "/projects"} onClick={handleDestination}>
  Projects
</NavItem>

<Breadcrumb
  items={[{ label: "Projects", href: "/projects" }, { label: "Details" }]}
  renderLink={(_item, props) => <a {...props} onClick={handleDestination} />}
/>
```

`Breadcrumb.renderLink` can instead return your router's link component, preserving the
provided destination, content and classes. Adapting `Button` with a router helper such as
`createLink` does **not** change its native button into an anchor: ordinary clicking can
navigate while link semantics and browser affordances remain absent. `Button` has no
`href`, `asChild` or arbitrary `render` contract. Verify the role and `href` as well as
client-side navigation in consumer tests.
